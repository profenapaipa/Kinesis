// Vocabulario del progreso, SIN base de datos: lo usan la pantalla, los
// componentes del navegador y lib/data/progress.ts.

export const PROGRESS_STATUSES = ["sin_empezar", "en_curso", "entregada", "calificada"] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const STATUS_TEXT: Record<ProgressStatus, string> = {
  sin_empezar: "Sin empezar",
  en_curso: "En curso",
  entregada: "Entregada",
  calificada: "Calificada",
};

// Escala del sistema institucional de ejemplo (documento simulado). Los ajustes
// de un PIAR cambian el tiempo o el formato, no esta escala.
export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

export function formatScore(score: number | null): string {
  return score === null ? "—" : score.toFixed(1).replace(".", ",");
}

export function validScore(score: number): boolean {
  return Number.isFinite(score) && score >= SCORE_MIN && score <= SCORE_MAX;
}

export const MAX_FEEDBACK = 400;
