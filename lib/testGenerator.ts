import type { AdaptedTest, AdaptedTestQuestion, TestQuestionFormat } from "@/types";

// Entrada mínima requerida para generar la prueba adaptada — desacoplada del
// tipo `Student` del modelo mock, ya que las categorías de apoyo reales son
// dinámicas (lib/data/students.ts las resuelve a partir de effective_supports).
export interface AdaptedTestStudentInput {
  id: string;
  hasPiar: boolean;
  adjustmentTypes: string[];
}

// Contenido real de una actividad (db/schema.ts `activities`) — a diferencia
// del antiguo LessonPlan mock, no trae una lista estructurada de
// sub-actividades: `instructions` es un solo texto libre que el docente
// escribe (a menudo con pasos en líneas separadas).
export interface ActivityContent {
  id: string;
  topic: string;
  objective: string;
  instructions: string;
}

function baseQuestionForActivity(activityTitle: string, simplified: boolean): string {
  return simplified
    ? `Cuenta con tus palabras qué hiciste en "${activityTitle}".`
    : `Explica con tus palabras qué trabajamos en "${activityTitle}" y por qué es importante.`;
}

// `instructions` es texto libre del docente — si lo escribió como pasos en
// líneas separadas (con o sin viñetas/números), cada línea se usa como un
// "paso" para generar una pregunta; si es un solo párrafo, queda un único
// paso (el texto completo).
function splitInstructionSteps(instructions: string): string[] {
  const lines = instructions
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter((line) => line.length > 0);
  return lines.length > 0 ? lines : [instructions.trim()];
}

// Genera una prueba corta a partir de una actividad real, adaptando formato,
// cantidad de preguntas e instrucciones según el PIAR del estudiante.
export function generateAdaptedTest(
  activity: ActivityContent,
  student: AdaptedTestStudentInput
): AdaptedTest {
  const adjustments = student.adjustmentTypes;
  const simplified = adjustments.includes("Instrucciones simplificadas");
  const oral = adjustments.includes("Evaluación oral");
  const visual = adjustments.includes("Apoyo visual");
  const reduced = adjustments.includes("Reducción de carga de trabajo");
  const extendedTime = adjustments.includes("Tiempos extendidos");

  const steps = splitInstructionSteps(activity.instructions);
  let questions: AdaptedTestQuestion[] = steps.map((step, index) => {
    const format: TestQuestionFormat = oral ? "oral" : visual && index === 0 ? "visual" : "abierta";
    const notes: string[] = [];
    if (oral) notes.push("Puedes responder esta pregunta de forma oral.");
    if (visual) notes.push("Puedes apoyarte en un dibujo, esquema o pictograma.");

    return {
      id: `${activity.id}-${student.id}-q${index + 1}`,
      prompt: baseQuestionForActivity(step, simplified),
      format,
      supportNote: notes.length > 0 ? notes.join(" ") : undefined,
    };
  });

  questions.push({
    id: `${activity.id}-${student.id}-qf`,
    prompt: simplified
      ? `¿Qué fue lo más importante que aprendiste sobre "${activity.topic}"?`
      : `A partir de lo trabajado, ¿cómo lograste el objetivo de la clase: "${activity.objective}"?`,
    format: oral ? "oral" : "abierta",
    supportNote: oral ? "Puedes responder esta pregunta de forma oral." : undefined,
  });

  if (reduced) {
    questions = questions.slice(0, 3);
  }

  const instructionNotes: string[] = [];
  if (extendedTime) instructionNotes.push("Tendrás tiempo adicional para responder.");
  if (adjustments.includes("Pausas activas"))
    instructionNotes.push("Puedes tomar pausas cortas durante la prueba.");
  if (adjustments.includes("Apoyo auditivo"))
    instructionNotes.push("Puedes pedir que te lean las preguntas en voz alta.");
  if (adjustments.includes("Uso de tecnología asistiva"))
    instructionNotes.push(
      "Puedes usar tu tecnología de apoyo habitual (lector de pantalla, software especializado, etc.)."
    );
  if (adjustments.includes("Material en braille"))
    instructionNotes.push("Esta prueba está disponible también en braille.");
  if (adjustments.includes("Lengua de señas"))
    instructionNotes.push(
      "Puedes solicitar apoyo de interpretación en Lengua de Señas Colombiana."
    );

  const baseMinutesPerQuestion = 8;
  const rawMinutes = questions.length * baseMinutesPerQuestion;
  const estimatedMinutes = extendedTime ? Math.round(rawMinutes * 1.4) : rawMinutes;

  return {
    studentId: student.id,
    lessonPlanId: activity.id,
    title: student.hasPiar ? `Prueba adaptada — ${activity.topic}` : `Prueba — ${activity.topic}`,
    instructions: [
      `Responde las siguientes preguntas sobre "${activity.topic}".`,
      ...instructionNotes,
    ].join(" "),
    estimatedMinutes,
    questions,
  };
}
