import type {
  AdaptedActivity,
  AdjustmentType,
  LearningStyle,
  LessonPlan,
  Student,
  StudentAdaptation,
} from "@/types";

interface AdjustmentStrategy {
  describe: (activityTitle: string) => string;
  resources: string[];
}

// Ajusta el formato de la actividad según el estilo de aprendizaje
// predominante del estudiante (modelo VAK + lectoescritura).
const LEARNING_STYLE_STRATEGIES: Record<LearningStyle, AdjustmentStrategy> = {
  visual: {
    describe: (activity) =>
      `Presenta "${activity}" apoyada en imágenes, video o un esquema: el estudiante aprende mejor de forma visual.`,
    resources: [
      "Imágenes o infografía del tema",
      "Video corto explicativo",
      "Mapa visual o diagrama",
    ],
  },
  auditivo: {
    describe: (activity) =>
      `Refuerza "${activity}" con una explicación oral o un audio: el estudiante aprende mejor escuchando.`,
    resources: [
      "Audio explicativo del tema",
      "Explicación oral adicional",
      "Grabación o podcast de apoyo",
    ],
  },
  kinestesico: {
    describe: (activity) =>
      `Incluye un componente práctico o manipulativo en "${activity}" (material concreto, juego de roles o movimiento): el estudiante aprende mejor haciendo.`,
    resources: [
      "Material manipulativo",
      "Actividad práctica o de movimiento",
      "Juego de roles",
    ],
  },
  lectoescritura: {
    describe: (activity) =>
      `Acompaña "${activity}" con un resumen escrito y espacio para tomar notas: el estudiante aprende mejor leyendo y escribiendo.`,
    resources: [
      "Resumen escrito del tema",
      "Guía con espacio para notas",
      "Glosario de términos clave",
    ],
  },
};

const ADJUSTMENT_STRATEGIES: Record<AdjustmentType, AdjustmentStrategy> = {
  "Tiempos extendidos": {
    describe: (activity) =>
      `Otorgar entre un 30% y 50% de tiempo adicional para completar "${activity}".`,
    resources: ["Cronómetro visible en el aula", "Plan de trabajo con hitos de tiempo"],
  },
  "Apoyo visual": {
    describe: (activity) =>
      `Acompañar "${activity}" con pictogramas, esquemas o material gráfico de apoyo.`,
    resources: ["Pictogramas", "Organizador gráfico", "Presentación con imágenes"],
  },
  "Instrucciones simplificadas": {
    describe: (activity) =>
      `Dividir las instrucciones de "${activity}" en pasos cortos y numerados, verificando comprensión antes de avanzar.`,
    resources: ["Guía de instrucciones paso a paso", "Lista de chequeo"],
  },
  "Apoyo auditivo": {
    describe: (activity) =>
      `Reforzar "${activity}" con explicación oral adicional y verificación de comprensión auditiva.`,
    resources: ["Audiodescripción de la actividad", "Amplificador de sonido personal"],
  },
  "Material en braille": {
    describe: (activity) =>
      `Transcribir el material de "${activity}" a braille o a un formato accesible equivalente.`,
    resources: ["Documento en braille", "Regleta y punzón"],
  },
  "Lengua de señas": {
    describe: (activity) =>
      `Disponer interpretación en Lengua de Señas Colombiana (LSC) durante "${activity}".`,
    resources: ["Intérprete de LSC", "Glosario visual de términos clave"],
  },
  "Agrupamiento flexible": {
    describe: (activity) =>
      `Ubicar al estudiante en un grupo de apoyo entre pares durante "${activity}".`,
    resources: ["Roles de trabajo colaborativo definidos"],
  },
  "Evaluación oral": {
    describe: (activity) =>
      `Permitir sustentar de forma oral los resultados de "${activity}", como alternativa o complemento a la entrega escrita.`,
    resources: ["Rúbrica de evaluación oral"],
  },
  "Uso de tecnología asistiva": {
    describe: (activity) =>
      `Habilitar tecnología asistiva (lector de pantalla, magnificador o software especializado) para "${activity}".`,
    resources: [
      "Lector de pantalla",
      "Software de magnificación",
      "Tablet con aplicaciones de accesibilidad",
    ],
  },
  "Reducción de carga de trabajo": {
    describe: (activity) =>
      `Reducir el número de ítems o la extensión de "${activity}", sin modificar el objetivo de aprendizaje.`,
    resources: ["Versión abreviada de la guía de trabajo"],
  },
  "Pausas activas": {
    describe: (activity) =>
      `Incluir una pausa activa breve antes o durante "${activity}" para favorecer la autorregulación.`,
    resources: ["Rutina de pausa activa", "Temporizador visual"],
  },
  "Ubicación preferencial en el aula": {
    describe: (activity) =>
      `Durante "${activity}", mantener al estudiante ubicado cerca del docente y lejos de distractores visuales o auditivos.`,
    resources: ["Mapa de distribución del aula"],
  },
};

export const LEARNING_STYLE_LABEL: Record<LearningStyle, string> = {
  visual: "Visual",
  auditivo: "Auditivo",
  kinestesico: "Kinestésico",
  lectoescritura: "Lectoescritura",
};

export function generateStudentAdaptation(
  plan: LessonPlan,
  student: Student
): StudentAdaptation | null {
  if (!student.hasPiar || !student.piarProfile) return null;

  const { piarProfile } = student;
  const strategies = [
    ...piarProfile.adjustmentTypes.map((type) => ADJUSTMENT_STRATEGIES[type]),
    LEARNING_STYLE_STRATEGIES[piarProfile.learningStyle],
  ];

  const adaptedActivities: AdaptedActivity[] = plan.activities.map((activity) => ({
    originalActivityId: activity.id,
    adaptationDescription: strategies
      .map((strategy) => strategy.describe(activity.title))
      .join(" "),
    specificResources: Array.from(
      new Set(strategies.flatMap((strategy) => strategy.resources))
    ),
    adjustmentTypesApplied: piarProfile.adjustmentTypes,
  }));

  const generalRecommendations = [
    ...piarProfile.supportNeeds,
    `Revisar avances con ${piarProfile.responsibleProfessional} antes de la siguiente evaluación.`,
  ];

  return { student, adaptedActivities, generalRecommendations };
}

export function generateAdaptationsForPlan(
  plan: LessonPlan,
  students: Student[]
): StudentAdaptation[] {
  return students
    .filter((student) => student.hasPiar)
    .map((student) => generateStudentAdaptation(plan, student))
    .filter((adaptation): adaptation is StudentAdaptation => adaptation !== null);
}
