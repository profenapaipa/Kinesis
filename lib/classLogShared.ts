// Vocabulario de la bitácora de clase, SIN importar la base de datos: lo usan
// tanto los componentes del navegador como lib/data/classLog.ts.
//
// Decisión del 2 de octubre de 2026 (docs/HOJA_DE_RUTA.md): visual, auditivo
// y kinestésico son una preferencia que motiva, no una prescripción. Por eso
// "modalidad" describe la ACTIVIDAD ("una actividad con imágenes"), nunca a la
// persona ("es visual"), y el resumen siempre se redacta en pasado y con
// fecha: "funcionó en 2 de 3 registros", no "aprende mejor con…".

export const LOG_KINDS = ["novedad", "lo_que_funciono", "observacion"] as const;
export type LogKind = (typeof LOG_KINDS)[number];

export const LOG_MODALITIES = [
  "visual",
  "auditiva",
  "kinestesica",
  "lectoescritura",
  "digital",
  "en_pareja",
] as const;
export type LogModality = (typeof LOG_MODALITIES)[number];

export const LOG_OUTCOMES = ["funciono", "funciono_parcialmente", "no_funciono"] as const;
export type LogOutcome = (typeof LOG_OUTCOMES)[number];

export const KIND_LABEL: Record<LogKind, string> = {
  novedad: "Novedad",
  lo_que_funciono: "Lo que funcionó",
  observacion: "Observación privada",
};

export const KIND_HELP: Record<LogKind, string> = {
  novedad: "Algo que pasó en clase y que el equipo debería saber.",
  lo_que_funciono: "Una actividad o un apoyo que se probó y cómo salió.",
  observacion: "Una nota solo para ti. No la ve el equipo de apoyo ni la familia.",
};

// Etiquetas de la ACTIVIDAD (no de la persona).
export const MODALITY_LABEL: Record<LogModality, string> = {
  visual: "Actividad visual",
  auditiva: "Actividad auditiva",
  kinestesica: "Actividad kinestésica",
  lectoescritura: "Lectura y escritura",
  digital: "Actividad virtual",
  en_pareja: "Trabajo en pareja",
};

export const OUTCOME_LABEL: Record<LogOutcome, string> = {
  funciono: "Funcionó",
  funciono_parcialmente: "Funcionó a medias",
  no_funciono: "No funcionó",
};

export const SOURCE_LABEL = { manual: "Escrito a mano", niky: "Ordenado con Niky" } as const;

export const MAX_BODY_LENGTH = 800;

export const NO_NAMES_WARNING =
  "Escribe lo que pasó con la actividad, no el diagnóstico de nadie ni los nombres de otros estudiantes.";

/** "12 oct" en hora de Colombia. */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  })
    .format(new Date(iso))
    .replace(".", "");
}

// Sugerencia local para "Ordenar con Niky" cuando Kinesis se abre solo, sin la
// plataforma que trae a Niky. NO es un modelo de lenguaje: son reglas de
// palabras, y la pantalla lo dice. Sirve para que el flujo se pueda mostrar sin
// conexión; con la plataforma, `niky:abrir` reemplaza esto por la respuesta real.
export interface LogSuggestion {
  modality: LogModality | null;
  outcome: LogOutcome | null;
  kind: LogKind;
}

const MODALITY_WORDS: Array<[LogModality, RegExp]> = [
  ["digital", /virtual|digital|computador|tableta|tablet|pantalla|plataforma|wisfox|quiz/i],
  ["visual", /imagen|imágenes|dibujo|visual|esquema|pictograma|tarjeta|color|video|vídeo/i],
  ["auditiva", /audio|oral|voz|explic|escuch|auditiv|canci/i],
  ["kinestesica", /mover|moviment|manipul|armar|pausa|kinest|con las manos|maqueta|rompecabezas/i],
  ["en_pareja", /pareja|compañer|equipo|grupo/i],
  ["lectoescritura", /escrib|escrit|leer|lectura|cuaderno|texto/i],
];

export function suggestFromText(text: string): LogSuggestion {
  const modality = MODALITY_WORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
  let outcome: LogOutcome | null = null;
  if (/no (le )?(funcion|sirvi|logr|ayud)|no pudo|(?<!no )se frustr/i.test(text)) outcome = "no_funciono";
  else if (/a medias|parcial|en parte|solo (la )?mitad/i.test(text)) outcome = "funciono_parcialmente";
  else if (/funcion|ayud|logr|termin|entendi|entendió|mejor|prefiri/i.test(text)) outcome = "funciono";
  const kind: LogKind = modality || outcome ? "lo_que_funciono" : "novedad";
  return { modality, outcome, kind };
}
