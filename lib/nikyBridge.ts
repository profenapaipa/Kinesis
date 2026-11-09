// Puente con la plataforma Sinapsis. Contrato acordado: Kinesis y Wisfox son
// aplicaciones aparte, dentro de un marco de la plataforma; avisan con un
// mensaje y Niky (la única IA) abre la conversación. La plataforma solo atiende
// mensajes de este origen, del tipo exacto y de un portal conocido.

export const PLATFORM_ORIGIN = "https://profenapaipa.github.io";
export const PLATFORM_URL = "https://profenapaipa.github.io/sinapsis-education/";

export type NikyTask = "pista" | "explicar" | "ajustar-actividad" | "ordenar-nota-bitacora";

export function insidePlatform(): boolean {
  return typeof window !== "undefined" && window.parent !== window;
}

/** true si había una plataforma a quien avisar (no garantiza que la atienda). */
export function callNiky(task: NikyTask, context?: string): boolean {
  if (!insidePlatform()) return false;
  window.parent.postMessage(
    { tipo: "niky:abrir", portal: "kinesis", tarea: task, contexto: (context ?? "").replace(/\s+/g, " ").trim().slice(0, 200) },
    PLATFORM_ORIGIN
  );
  return true;
}

// Roles de Kinesis -> nombre del rol en el tutorial de la plataforma.
const TUTORIAL_ROLE: Record<string, string> = {
  docente: "docente",
  orientador: "orientacion",
  padre: "familia",
  administrador: "coordinacion",
  estudiante: "estudiante",
};

/** Enlace directo al recorrido guiado del rol (si la plataforma aún no lo conoce, cae en su portada). */
export function tourUrl(role: string): string {
  return `${PLATFORM_URL}#/tutorial/${TUTORIAL_ROLE[role] ?? "docente"}`;
}

/** Dentro del marco, avisa a la plataforma para abrir el recorrido sin recargar; el enlace queda siempre. */
export function openGuidedTour(role: string): void {
  if (insidePlatform()) {
    window.parent.postMessage(
      { tipo: "recorrido:abrir", portal: "kinesis", rol: TUTORIAL_ROLE[role] ?? "docente" },
      PLATFORM_ORIGIN
    );
  }
}
