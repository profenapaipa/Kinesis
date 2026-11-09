"use client";

import { useCallback, useSyncExternalStore } from "react";

// Estado del recorrido guiado, guardado en el NAVEGADOR (sessionStorage).
//
// Por qué así: la demostración es un sitio estático sin cookies ni rutas API,
// y para ir a una pantalla de Kinesis y volver hay que cambiar de página, o sea
// que el estado no puede vivir solo en un componente. sessionStorage dura lo
// que dure la pestaña (se borra al cerrarla), así que no deja rastro y nadie
// retoma el recorrido de otra persona en un computador compartido.
//
// useSyncExternalStore evita el desajuste de hidratación: en el servidor (y en
// el primer render del cliente) el estado es «vacío»; después se lee de verdad.

const CLAVE = "kinesis:recorrido:v1";

export interface EstadoRecorrido {
  rol: string;
  /** id del ejemplo abierto; null = se está eligiendo. */
  ejemplo: string | null;
  /** Índice del paso dentro de PASOS. */
  paso: number;
  /** Opción elegida en cada decisión, por ejemplo: { "docente-1": [0, null] }. */
  elecciones: Record<string, Array<number | null>>;
  /** Propuestas de Niky: "ejemplo:índice" -> aceptada / más tarde. */
  acciones: Record<string, "aceptada" | "despues">;
  /** true mientras la persona está en OTRA pantalla de Kinesis y puede volver. */
  enPantalla: boolean;
}

export const ESTADO_VACIO: EstadoRecorrido = {
  rol: "",
  ejemplo: null,
  paso: 0,
  elecciones: {},
  acciones: {},
  enPantalla: false,
};

const oyentes = new Set<() => void>();
let ultimo: string | null = null;
let leido = false;

function leerCrudo(): string | null {
  if (!leido) {
    leido = true;
    try {
      ultimo = window.sessionStorage.getItem(CLAVE);
    } catch {
      // Sin sessionStorage (ventana privada, bloqueo): el recorrido funciona
      // igual dentro de esta carga de página, solo que no sobrevive a navegar.
      ultimo = null;
    }
  }
  return ultimo;
}

function escribirCrudo(valor: string | null) {
  ultimo = valor;
  leido = true;
  try {
    if (valor === null) window.sessionStorage.removeItem(CLAVE);
    else window.sessionStorage.setItem(CLAVE, valor);
  } catch {
    /* ver leerCrudo */
  }
  oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  // Otra pestaña no comparte sessionStorage, pero un cambio hecho desde otro
  // documento de la misma pestaña (el marco) sí debería reflejarse.
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      leido = false;
      avisar();
    }
  };
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiar);
  };
}

function analizar(crudo: string | null): EstadoRecorrido {
  if (!crudo) return ESTADO_VACIO;
  try {
    return { ...ESTADO_VACIO, ...(JSON.parse(crudo) as Partial<EstadoRecorrido>) };
  } catch {
    return ESTADO_VACIO;
  }
}

/** Estado actual y una función para cambiarlo. `listo` es false hasta que el cliente leyó el almacén. */
export function useRecorrido(): {
  estado: EstadoRecorrido;
  listo: boolean;
  cambiar: (parche: Partial<EstadoRecorrido>) => void;
  reiniciar: () => void;
} {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => "__servidor__");
  const listo = crudo !== "__servidor__";
  const estado = listo ? analizar(crudo) : ESTADO_VACIO;

  const cambiar = useCallback((parche: Partial<EstadoRecorrido>) => {
    const actual = analizar(leerCrudo());
    escribirCrudo(JSON.stringify({ ...actual, ...parche }));
  }, []);

  const reiniciar = useCallback(() => escribirCrudo(null), []);
  return { estado, listo, cambiar, reiniciar };
}
