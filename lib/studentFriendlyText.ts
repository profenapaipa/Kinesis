import type { AdjustmentType } from "@/types";

// Traducción en segunda persona, cercana y no clínica de cada tipo de ajuste,
// pensada para mostrarse directamente a estudiantes (y a sus acudientes).
export const STUDENT_FRIENDLY_ADJUSTMENTS: Record<AdjustmentType, string> = {
  "Tiempos extendidos":
    "Tendrás más tiempo para terminar tus actividades y evaluaciones.",
  "Apoyo visual":
    "Vas a contar con imágenes, pictogramas o esquemas que te ayuden a entender mejor.",
  "Instrucciones simplificadas":
    "Las instrucciones se te explicarán paso a paso, de forma clara y sencilla.",
  "Apoyo auditivo":
    "Podrás recibir explicaciones adicionales en voz alta cuando las necesites.",
  "Material en braille":
    "Tus materiales estarán disponibles en braille o en un formato accesible.",
  "Lengua de señas":
    "Contarás con interpretación en Lengua de Señas Colombiana en tus clases.",
  "Agrupamiento flexible": "Trabajarás en grupos pensados para apoyarte mejor.",
  "Evaluación oral": "Podrás sustentar tus trabajos de forma oral si lo prefieres.",
  "Uso de tecnología asistiva":
    "Podrás usar herramientas tecnológicas de apoyo, como lector de pantalla o software especializado.",
  "Reducción de carga de trabajo":
    "Tus actividades se ajustarán en cantidad, sin cambiar lo que debes aprender.",
  "Pausas activas":
    "Tendrás pausas cortas durante la clase para descansar y volver a concentrarte.",
  "Ubicación preferencial en el aula":
    "Tu puesto estará ubicado en un lugar que te ayude a concentrarte mejor.",
};

// Etiquetas de las opciones de student_learning_preferences (db/schema.ts) —
// "Mi forma de aprender", autoreportada por el estudiante.
export const LEARNING_PREFERENCE_LABEL: Record<string, string> = {
  imagenes: "Imágenes",
  ejemplos: "Ejemplos",
  explicaciones_profesor: "Explicaciones del profesor",
  trabajar_con_companero: "Trabajar con un compañero",
  instrucciones_paso_a_paso: "Instrucciones paso a paso",
  videos: "Videos",
  practicar_directamente: "Practicar directamente",
};
