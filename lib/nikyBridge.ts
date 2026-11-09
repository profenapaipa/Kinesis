// Puente con la plataforma Sinapsis. Contrato acordado: Kinesis y Wisfox son
// aplicaciones aparte, dentro de un marco de la plataforma; avisan con un
// mensaje y Niky (la única IA) abre la conversación. La plataforma solo atiende
// mensajes de este origen, del tipo exacto y de un portal conocido.

export const PLATFORM_ORIGIN = "https://profenapaipa.github.io";
export const PLATFORM_URL = "https://profenapaipa.github.io/sinapsis-education/";

export type NikyTask = "pista" | "explicar" | "ajustar-actividad" | "ordenar-nota-bitacora";

/**
 * Sugerencia preparada que se muestra cuando Kinesis se abre solo y no hay a
 * quién avisar. No la genera Niky en vivo: es un ejemplo escrito de antemano,
 * y el texto lo dice. Quien enseña decide.
 */
export function preparedExample(task: NikyTask): string {
  const examples: Record<NikyTask, string> = {
    "ajustar-actividad":
      "Ejemplo preparado: ofrece la instrucción también con imágenes o un paso a paso corto, deja que cada estudiante muestre lo aprendido de más de una forma (oral, escrita o con dibujo) y ofrece dos opciones de tema para sostener el interés. Revisa cuáles aplican en tu clase.",
    "ordenar-nota-bitacora":
      "Ejemplo preparado: una nota ordenada dice qué se hizo, cómo respondió el grupo y qué apoyo ayudó, en dos o tres frases. Tú la escribes y la confirmas.",
    pista: "Ejemplo preparado: empieza por lo que ya sabes de este tema y escribe el primer paso con tus palabras.",
    explicar: "Ejemplo preparado: pide la explicación con un caso concreto de tu clase y compara con lo registrado en la bitácora.",
  };
  return examples[task];
}

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

/** Portada de la plataforma. Sinapsis no tiene ruta de tutorial por rol (`#/tutorial/<rol>` cae en su portada sin decir nada), así que el enlace va a la raíz y no promete un recorrido que no existe. El principal es el de Kinesis (/recorrido). */
export function tourUrl(): string {
  return PLATFORM_URL;
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
