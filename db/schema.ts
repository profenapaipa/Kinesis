import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Todas las tablas usan id de texto (UUID) para mantener el mismo estilo de
// identificador legible que ya usaba lib/mockData.ts, y timestamps ISO-8601
// en texto por portabilidad/legibilidad.

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

// ---------------------------------------------------------------------------
// Usuarios y sesión
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
  id: id(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", {
    enum: ["administrador", "docente", "estudiante", "padre", "orientador"],
  }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  mustChangePassword: integer("must_change_password", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: createdAt(),
  expiresAt: text("expires_at").notNull(),
});

// ---------------------------------------------------------------------------
// Estructura institucional
// ---------------------------------------------------------------------------

export const academicPeriods = sqliteTable("academic_periods", {
  id: id(),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
});

// Sembrada desde lib/subjects.ts (MEN_SUBJECTS) — solo para integridad
// referencial; el TS union SubjectId sigue siendo la fuente de verdad del
// catálogo (son las áreas de la Ley 115/1994, no algo que el admin edite).
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(), // coincide con SubjectId, ej. "matematicas"
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  color: text("color").notNull(),
});

export const courses = sqliteTable("courses", {
  id: id(),
  name: text("name").notNull(), // ej. "8°-A"
  grade: text("grade").notNull(), // ej. "8°"
  group: text("group").notNull(), // ej. "A"
  academicPeriodId: text("academic_period_id")
    .notNull()
    .references(() => academicPeriods.id),
  createdAt: createdAt(),
});

export const enrollments = sqliteTable("enrollments", {
  id: id(),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  academicPeriodId: text("academic_period_id")
    .notNull()
    .references(() => academicPeriods.id),
  status: text("status", { enum: ["activa", "retirada", "finalizada"] })
    .notNull()
    .default("activa"),
  createdAt: createdAt(),
});

export const courseTeachers = sqliteTable("course_teachers", {
  id: id(),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  createdAt: createdAt(),
});

// Solo modelo de datos por ahora — sin UI de padre en esta fase.
export const guardianStudents = sqliteTable("guardian_students", {
  id: id(),
  guardianUserId: text("guardian_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  authorizedForDiagnosis: integer("authorized_for_diagnosis", { mode: "boolean" })
    .notNull()
    .default(false),
});

// ---------------------------------------------------------------------------
// Categorías de apoyo (reemplaza el union fijo AdjustmentType; gestionable
// por el administrador — "Gestionar categorías de apoyos" del documento)
// ---------------------------------------------------------------------------

export const supportCategories = sqliteTable("support_categories", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  studentFriendlyText: text("student_friendly_text").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Perfil pedagógico (separado de lo clínico) — fase Profesor lo usa a fondo;
// se crea ya el esquema para no tener que rehacerlo después.
// ---------------------------------------------------------------------------

export const pedagogicalProfiles = sqliteTable("pedagogical_profiles", {
  id: id(),
  studentUserId: text("student_user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  learningStyle: text("learning_style", {
    enum: ["visual", "auditivo", "kinestesico", "lectoescritura"],
  }),
  createdAt: createdAt(),
});

export const pedagogicalStrengths = sqliteTable("pedagogical_strengths", {
  id: id(),
  profileId: text("profile_id")
    .notNull()
    .references(() => pedagogicalProfiles.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

// Concepto NUEVO — no existía en el modelo anterior (que solo tenía
// supportNeeds, mezclando barrera y estrategia en un mismo campo).
export const pedagogicalBarriers = sqliteTable("pedagogical_barriers", {
  id: id(),
  profileId: text("profile_id")
    .notNull()
    .references(() => pedagogicalProfiles.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const effectiveSupports = sqliteTable("effective_supports", {
  id: id(),
  profileId: text("profile_id")
    .notNull()
    .references(() => pedagogicalProfiles.id, { onDelete: "cascade" }),
  supportCategoryId: text("support_category_id").references(() => supportCategories.id),
  description: text("description").notNull(),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Información clínica — tabla separada, acceso restringido
// (ver lib/permissions.ts; nunca se lee sin pasar por canViewDiagnosis()).
// ---------------------------------------------------------------------------

export const clinicalInfo = sqliteTable("clinical_info", {
  id: id(),
  studentUserId: text("student_user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
  responsibleProfessional: text("responsible_professional").notNull(),
  lastReviewDate: text("last_review_date").notNull(),
  notes: text("notes"),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// "Mi forma de aprender" — preferencia autoreportada por el estudiante.
// Tabla deliberadamente distinta de pedagogical_*: una preferencia declarada
// no es lo mismo que una necesidad clínica ni que una estrategia docente.
export const studentLearningPreferences = sqliteTable("student_learning_preferences", {
  id: id(),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  option: text("option", {
    enum: [
      "imagenes",
      "ejemplos",
      "explicaciones_profesor",
      "trabajar_con_companero",
      "instrucciones_paso_a_paso",
      "videos",
      "practicar_directamente",
    ],
  }).notNull(),
  selected: integer("selected", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ---------------------------------------------------------------------------
// Actividades, adaptaciones y seguimiento — fase Profesor las usa a fondo;
// esquema creado ahora para que la base ya lo soporte.
// ---------------------------------------------------------------------------

export const activities = sqliteTable("activities", {
  id: id(),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  topic: text("topic").notNull(),
  objective: text("objective").notNull(),
  instructions: text("instructions").notNull(),
  resources: text("resources", { mode: "json" }).$type<string[]>().notNull().default([]),
  // Diseño Universal de Aprendizaje aplicado a TODA la actividad (no a un
  // estudiante puntual) — los mismos 3 principios de activity_adaptations
  // (representación / acción-expresión / participación), pero pensados
  // desde el diseño de la clase, no como parche posterior para PIAR.
  // Opcionales: no deben bloquear al docente que solo quiere guardar rápido.
  representationNotes: text("representation_notes"),
  expressionNotes: text("expression_notes"),
  engagementNotes: text("engagement_notes"),
  evidenceRequested: text("evidence_requested"),
  status: text("status", {
    enum: ["preparada", "pendiente_adaptacion", "en_curso", "finalizada", "pendiente_seguimiento"],
  })
    .notNull()
    .default("preparada"),
  scheduledDate: text("scheduled_date"),
  createdAt: createdAt(),
});

export const activityAdaptations = sqliteTable("activity_adaptations", {
  id: id(),
  activityId: text("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["sugerida", "aplicada", "editada", "rechazada"] })
    .notNull()
    .default("sugerida"),
  representationText: text("representation_text"),
  representationResources: text("representation_resources", { mode: "json" })
    .$type<string[]>()
    .default([]),
  actionExpressionText: text("action_expression_text"),
  actionExpressionResources: text("action_expression_resources", { mode: "json" })
    .$type<string[]>()
    .default([]),
  participationText: text("participation_text"),
  participationResources: text("participation_resources", { mode: "json" })
    .$type<string[]>()
    .default([]),
  rationale: text("rationale"),
  supportCategoriesApplied: text("support_categories_applied", { mode: "json" })
    .$type<string[]>()
    .default([]),
  editedText: text("edited_text"),
  generatedAt: createdAt(),
  decidedBy: text("decided_by").references(() => users.id),
  decidedAt: text("decided_at"),
});

export const trackingEntries = sqliteTable("tracking_entries", {
  id: id(),
  activityId: text("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  adaptationId: text("adaptation_id").references(() => activityAdaptations.id),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id),
  participation: text("participation", { enum: ["adecuada", "parcial", "baja"] }).notNull(),
  comprehension: text("comprehension", {
    enum: ["lograda", "en_proceso", "no_evidenciada"],
  }).notNull(),
  strategyUsedSupportCategoryId: text("strategy_used_support_category_id").references(
    () => supportCategories.id
  ),
  result: text("result", {
    enum: ["funciono", "funciono_parcialmente", "no_funciono"],
  }).notNull(),
  observation: text("observation"),
  createdAt: createdAt(),
});

export const progressEntries = sqliteTable("progress_entries", {
  id: id(),
  studentUserId: text("student_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  academicPeriodId: text("academic_period_id")
    .notNull()
    .references(() => academicPeriods.id),
  score: integer("score").notNull(),
  previousScore: integer("previous_score").notNull(),
  recordedAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Auditoría — quién hizo qué (útil sobre todo para acciones de administrador
// y accesos a información restringida).
// ---------------------------------------------------------------------------

export const auditLog = sqliteTable("audit_log", {
  id: id(),
  actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: createdAt(),
});
