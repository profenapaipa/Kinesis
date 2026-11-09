// Vocabulario del seguimiento, sin base de datos (lo usan el navegador y el servidor).

export const FOLLOW_KINDS = ["recomendacion", "acuerdo", "seguimiento"] as const;
export type FollowKind = (typeof FOLLOW_KINDS)[number];

export const FOLLOW_LABEL: Record<FollowKind, string> = {
  recomendacion: "Recomendación de orientación",
  acuerdo: "Acuerdo",
  seguimiento: "Seguimiento",
};

export const FOLLOW_HELP: Record<FollowKind, string> = {
  recomendacion: "Una sugerencia para el aula, redactada sin diagnóstico.",
  acuerdo: "Algo que se acordó con la familia o con el equipo.",
  seguimiento: "Cómo va el estudiante frente al periodo anterior.",
};

export const MAX_FOLLOW_BODY = 600;

export const FOLLOW_WARNING =
  "Describe el apoyo y lo que se observó en el aula; no escribas el diagnóstico ni datos clínicos.";
