// Contrato público de los personajes. Es el MISMO que usa la plataforma en
// `MT.mascotas.mascota(id, { pose, emocion, tamano })` (repositorio
// mt-mascotas2, js/mascotas.js): mismos ids, mismas poses y mismas siete
// emociones. Así, cuando el diseño final de la plataforma esté listo, basta
// reemplazar `dibujos.tsx` (lo único que sabe dibujar) sin tocar una sola
// pantalla que use <Personaje />.

export const PERSONAJES = ["sinapso", "kinesis", "wisfox", "niky"] as const;
export type PersonajeId = (typeof PERSONAJES)[number];

export const POSES = ["base", "saluda", "senala", "piensa", "celebra"] as const;
export type Pose = (typeof POSES)[number];

export const EMOCIONES = [
  "contento",
  "curioso",
  "pensando",
  "celebra",
  "animo",
  "sorprendido",
  "duda",
] as const;
export type Emocion = (typeof EMOCIONES)[number];

export const NOMBRE_PERSONAJE: Record<PersonajeId, string> = {
  sinapso: "Sinapso",
  kinesis: "Kinesis",
  wisfox: "Wisfox",
  niky: "Niky",
};

// Qué es cada uno, en una línea, para etiquetas y textos de apoyo.
export const ROL_PERSONAJE: Record<PersonajeId, string> = {
  sinapso: "oso de anteojos, guía de todo el recorrido",
  kinesis: "pulpo, acompaña a docentes, orientación, familias y coordinación",
  wisfox: "zorro, acompaña al estudiante",
  niky: "venado azul, el asistente que propone y no decide",
};
