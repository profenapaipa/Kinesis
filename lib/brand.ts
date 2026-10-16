// Identidad de marca: única fuente de verdad del nombre, el descriptor y los
// textos institucionales. Ningún componente escribe "Kinesis" a mano: si el
// equipo decide otro nombre, se cambia aquí y en app/icon.svg, nada más.
// El porqué del nombre, el logo y las reglas de uso están en
// docs/IDENTIDAD_DE_MARCA.md.

export const BRAND = {
  name: "Kinesis",
  // Lo que hace, en una línea. Acompaña al nombre donde haya espacio.
  descriptor: "Planeación inclusiva con PIAR y DUA",
  // Versión corta para la barra lateral y espacios estrechos.
  shortDescriptor: "PIAR · DUA · Áreas MEN",
  // La promesa, en el tono de la marca: concreta, sin tecnicismos.
  tagline: "Aprender en movimiento: apoyos que avanzan con cada estudiante.",
  description:
    "Plataforma para que el docente diseñe su clase desde los tres principios del Diseño Universal de Aprendizaje, la cruce con los perfiles PIAR de sus estudiantes y coordine los ajustes con el equipo de apoyo y la familia.",
  origin: "Semillero de Tecnología Maker · Instituto Infantil y Juvenil",
  team: "Equipo 3 · Camila Segura y Santiago Vanegas",
} as const;
