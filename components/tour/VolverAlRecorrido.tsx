"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Personaje } from "@/components/personajes";
import { buttonVariants } from "@/components/ui/button";
import { useRecorrido } from "@/lib/tour/estado";
import { RECORRIDOS } from "@/lib/tour/recorridos";
import { PASOS, ROLES_RECORRIDO, type RolRecorrido } from "@/lib/tour/tipos";
import { cn } from "@/lib/utils";

// Banda flotante «Volver al recorrido»: aparece solo cuando la persona salió del
// recorrido con «Ir a esa pantalla». No es un modo aparte ni una cinta de
// guion: es el camino de vuelta. Se puede cerrar con la X (el avance se
// conserva y siempre se puede retomar desde «Recorrido guiado» de la cabecera).
//
// Va por encima de la barra inferior del celular (que mide unos 5 rem) y no
// atrapa el foco ni tapa contenido: la página tiene espacio de sobra abajo.

export function VolverAlRecorrido({ rol }: { rol: string }) {
  const pathname = usePathname();
  const { estado, cambiar } = useRecorrido();

  if (!(ROLES_RECORRIDO as readonly string[]).includes(rol)) return null;
  if (!estado.enPantalla || estado.rol !== rol || !estado.ejemplo || pathname === "/recorrido") return null;
  const ejemplo = RECORRIDOS[rol as RolRecorrido].find((e) => e.id === estado.ejemplo);
  if (!ejemplo) return null;

  return (
    <div
      role="region"
      aria-label="Volver al recorrido guiado"
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-50 mx-auto flex max-w-xl items-center gap-2.5 rounded-3xl bg-card p-2.5 pr-2 shadow-2xl ring-1 ring-primary/40 md:bottom-5"
    >
      <Personaje id="sinapso" tamano={44} className="size-11" pose="senala" />
      <p className="min-w-0 flex-1 text-xs leading-snug">
        <span className="block font-extrabold">Estás en el paso {estado.paso + 1} de {PASOS.length}</span>
        <span className="line-clamp-1 text-muted-foreground">{ejemplo.titulo}</span>
      </p>
      <Link
        href="/recorrido"
        className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        onClick={() => cambiar({ enPantalla: false })}
      >
        <ArrowLeft aria-hidden />
        <span>Volver al recorrido</span>
      </Link>
      <button
        type="button"
        aria-label="Cerrar este aviso"
        onClick={() => cambiar({ enPantalla: false })}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
