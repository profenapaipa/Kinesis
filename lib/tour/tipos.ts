// Tipos del recorrido guiado de Kinesis. Los datos viven en recorridos.ts.

/** Roles que atiende Kinesis (el estudiante usa Wisfox, no tiene recorrido aquí). */
export type RolRecorrido = "docente" | "orientador" | "padre" | "administrador";

export const ROLES_RECORRIDO: readonly RolRecorrido[] = ["docente", "orientador", "padre", "administrador"];

export type CasoId = "tecnologia" | "ingles" | "matematicas" | "ciencias" | "lengua";

export interface Opcion {
  texto: string;
  /** Consecuencia de elegirla, redactada como posibilidad, no como veredicto. */
  resultado: string;
}

export interface Decision {
  pregunta: string;
  opciones: [Opcion, Opcion];
}

export interface Ejemplo {
  id: string;
  caso: CasoId;
  titulo: string;
  /** Solo el código del curso, p. ej. "8A-04". Nunca un nombre. */
  estudiante: string;
  situacion: string;
  /** Lo que dice Sinapso al presentar el caso. */
  sinapso: string;
  companero: { personaje: "Kinesis" | "Wisfox"; linea: string };
  decisiones: [Decision, Decision];
  /** Respuesta PREPARADA de Niky (negritas y listas simples). */
  niky: { respuesta: string };
  /** Ruta de Kinesis para ese rol. */
  pantalla: string;
}

/** Los seis pasos de cada ejemplo, en orden. */
export const PASOS = ["caso", "decision1", "decision2", "niky", "pantalla", "cierre"] as const;
export type PasoId = (typeof PASOS)[number];

export const TITULO_PASO: Record<PasoId, string> = {
  caso: "El caso",
  decision1: "Tu primera decisión",
  decision2: "Tu segunda decisión",
  niky: "Lo que propone Niky",
  pantalla: "La pantalla de Kinesis",
  cierre: "Cierre",
};

export const NOMBRE_CASO: Record<CasoId, string> = {
  tecnologia: "Tecnología e informática",
  ingles: "Inglés",
  matematicas: "Matemáticas",
  ciencias: "Ciencias naturales",
  lengua: "Lengua castellana",
};

/** Una propuesta de Niky dentro del recorrido: siempre es una sugerencia, nunca una acción hecha. */
export interface AccionNiky {
  /** Verbo con el que Niky la plantea: «Sugiere revisar…», «Avisa de…», «Prepara…». */
  etiqueta: string;
  detalle: string;
}
