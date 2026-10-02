// Tipos centrales del dominio: estudiantes, perfiles PIAR y planeaciones de clase.

export type Grade = "8°" | "9°" | "10°" | "11°";

// Rol simulado (sin autenticación real): controla qué navegación y vistas se muestran.
// "orientador" = equipo de apoyo pedagógico (Decreto 1421 de 2017) — acceso
// institucional completo a información clínica, ver canViewDiagnosis().
export type Role = "docente" | "estudiante" | "padre" | "administrador" | "orientador";

// Modelo VAK(+lectoescritura) de estilo de aprendizaje predominante.
export type LearningStyle = "visual" | "auditivo" | "kinestesico" | "lectoescritura";

// Áreas obligatorias y fundamentales definidas por el MEN (Ley 115 de 1994, Art. 23).
export type SubjectId =
  | "matematicas"
  | "ciencias-naturales"
  | "ciencias-sociales"
  | "humanidades-lengua"
  | "educacion-artistica"
  | "tecnologia-informatica"
  | "educacion-fisica"
  | "etica-valores"
  | "educacion-religiosa";

export type AdjustmentType =
  | "Tiempos extendidos"
  | "Apoyo visual"
  | "Instrucciones simplificadas"
  | "Apoyo auditivo"
  | "Material en braille"
  | "Lengua de señas"
  | "Agrupamiento flexible"
  | "Evaluación oral"
  | "Uso de tecnología asistiva"
  | "Reducción de carga de trabajo"
  | "Pausas activas"
  | "Ubicación preferencial en el aula";

export interface PiarProfile {
  id: string;
  diagnosis: string;
  adjustmentTypes: AdjustmentType[];
  learningStyle: LearningStyle;
  strengths: string[];
  supportNeeds: string[];
  recommendedResources: string[];
  lastReview: string; // fecha ISO de la última revisión del PIAR
  responsibleProfessional: string; // profesional de apoyo (psicopedagogo, fonoaudiólogo, etc.)
}

export interface Student {
  id: string;
  fullName: string;
  grade: Grade;
  group: string; // ej: "9°-A"
  hasPiar: boolean;
  piarProfile?: PiarProfile;
  guardianContact?: string;
}

export interface LessonPlanActivity {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface LessonPlan {
  id: string;
  subject: SubjectId;
  topic: string;
  grade: Grade;
  objective: string;
  activities: LessonPlanActivity[];
  resources: string[];
  evaluationMethod: string;
  date: string; // fecha ISO
}

export interface AdaptedActivity {
  originalActivityId: string;
  adaptationDescription: string;
  specificResources: string[];
  adjustmentTypesApplied: AdjustmentType[];
}

export interface StudentAdaptation {
  student: Student;
  adaptedActivities: AdaptedActivity[];
  generalRecommendations: string[];
}

// Avance académico simulado por asignatura, usado en las gráficas de
// seguimiento (vista de padres y vista de docente).
export interface StudentProgress {
  studentId: string;
  subject: SubjectId;
  score: number; // 0-100, avance del período actual
  previousScore: number; // 0-100, avance del período anterior
}

export type TestQuestionFormat = "abierta" | "opción múltiple" | "oral" | "visual";

export interface AdaptedTestQuestion {
  id: string;
  prompt: string;
  format: TestQuestionFormat;
  supportNote?: string;
}

// Prueba generada automáticamente a partir de una planeación, adaptada
// según el PIAR del estudiante (o estándar si no tiene PIAR activo).
export interface AdaptedTest {
  studentId: string;
  lessonPlanId: string;
  title: string;
  instructions: string;
  estimatedMinutes: number;
  questions: AdaptedTestQuestion[];
}
