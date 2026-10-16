import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, courses, courseTeachers } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { isTeacherAssignedToCourseSubject, PermissionError } from "@/lib/permissions";
import { MEN_SUBJECTS } from "@/lib/subjects";
import type { SubjectId } from "@/types";

// Consultas sobre la tabla real `activities` (contenido de clase autoría del
// docente), en reemplazo de lib/mockData.ts (mockLessonPlans).

export interface SubjectPlanningSummary {
  subjectId: SubjectId;
  isAssigned: boolean;
  activityCount: number;
}

export async function listMySubjectsSummary(session: Session): Promise<SubjectPlanningSummary[]> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  const assignedRows = await db
    .select({ subjectId: courseTeachers.subjectId })
    .from(courseTeachers)
    .where(eq(courseTeachers.teacherUserId, session.userId));
  const assignedSubjects = new Set(assignedRows.map((row) => row.subjectId));

  const myActivities = await db
    .select({ subjectId: activities.subjectId })
    .from(activities)
    .where(eq(activities.teacherUserId, session.userId));
  const counts = new Map<string, number>();
  for (const row of myActivities) {
    counts.set(row.subjectId, (counts.get(row.subjectId) ?? 0) + 1);
  }

  return MEN_SUBJECTS.map((subject) => ({
    subjectId: subject.id,
    isAssigned: assignedSubjects.has(subject.id),
    activityCount: counts.get(subject.id) ?? 0,
  }));
}

export interface TeacherCourseOption {
  courseId: string;
  courseName: string;
  grade: string;
  group: string;
}

export async function listMyCoursesForSubject(
  session: Session,
  subjectId: SubjectId
): Promise<TeacherCourseOption[]> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  return db
    .select({
      courseId: courseTeachers.courseId,
      courseName: courses.name,
      grade: courses.grade,
      group: courses.group,
    })
    .from(courseTeachers)
    .innerJoin(courses, eq(courses.id, courseTeachers.courseId))
    .where(
      and(eq(courseTeachers.teacherUserId, session.userId), eq(courseTeachers.subjectId, subjectId))
    );
}

export interface TeacherActivity {
  id: string;
  courseName: string;
  grade: string;
  group: string;
  topic: string;
  objective: string;
  instructions: string;
  resources: string[];
  representationNotes: string | null;
  expressionNotes: string | null;
  engagementNotes: string | null;
  evidenceRequested: string | null;
  status: string;
  scheduledDate: string | null;
  createdAt: string;
}

export async function listActivitiesForSubject(
  session: Session,
  subjectId: SubjectId
): Promise<TeacherActivity[]> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  const rows = await db
    .select({
      id: activities.id,
      courseName: courses.name,
      grade: courses.grade,
      group: courses.group,
      topic: activities.topic,
      objective: activities.objective,
      instructions: activities.instructions,
      resources: activities.resources,
      representationNotes: activities.representationNotes,
      expressionNotes: activities.expressionNotes,
      engagementNotes: activities.engagementNotes,
      evidenceRequested: activities.evidenceRequested,
      status: activities.status,
      scheduledDate: activities.scheduledDate,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .innerJoin(courses, eq(courses.id, activities.courseId))
    .where(and(eq(activities.teacherUserId, session.userId), eq(activities.subjectId, subjectId)));

  return rows.sort((a, b) => (b.scheduledDate ?? b.createdAt).localeCompare(a.scheduledDate ?? a.createdAt));
}

export interface CreateActivityInput {
  courseId: string;
  subjectId: SubjectId;
  topic: string;
  objective: string;
  instructions: string;
  resources: string[];
  representationNotes?: string;
  expressionNotes?: string;
  engagementNotes?: string;
  evidenceRequested?: string;
  scheduledDate?: string;
}

export async function createActivity(session: Session, input: CreateActivityInput) {
  if (session.role !== "docente") throw new PermissionError("planeacion");
  const assigned = await isTeacherAssignedToCourseSubject(
    session.userId,
    input.courseId,
    input.subjectId
  );
  if (!assigned) throw new PermissionError("planeacion");

  return db
    .insert(activities)
    .values({
      teacherUserId: session.userId,
      courseId: input.courseId,
      subjectId: input.subjectId,
      topic: input.topic,
      objective: input.objective,
      instructions: input.instructions,
      resources: input.resources,
      representationNotes: input.representationNotes || null,
      expressionNotes: input.expressionNotes || null,
      engagementNotes: input.engagementNotes || null,
      evidenceRequested: input.evidenceRequested || null,
      scheduledDate: input.scheduledDate || null,
    })
    .returning()
    .get();
}

// Lectura para las vistas de estudiante/padre. Sin chequeo de permisos
// propio: courseId siempre llega aquí ya resuelto desde un perfil validado
// (getMyStudentProfile / getChildProfile en lib/data/students.ts), y el
// contenido (tema, objetivo, instrucciones, recursos) no es clínico ni
// restringido — es exactamente lo que un estudiante de ese curso vería en
// clase.
export interface StudentActivityView {
  id: string;
  subjectId: SubjectId;
  topic: string;
  objective: string;
  instructions: string;
  resources: string[];
  evidenceRequested: string | null;
  scheduledDate: string | null;
}

async function fetchActivitiesForCourse(courseId: string): Promise<StudentActivityView[]> {
  const rows = await db
    .select({
      id: activities.id,
      subjectId: activities.subjectId,
      topic: activities.topic,
      objective: activities.objective,
      instructions: activities.instructions,
      resources: activities.resources,
      evidenceRequested: activities.evidenceRequested,
      scheduledDate: activities.scheduledDate,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .where(eq(activities.courseId, courseId));

  return rows
    .sort((a, b) => (b.scheduledDate ?? b.createdAt).localeCompare(a.scheduledDate ?? a.createdAt))
    .map(({ createdAt: _createdAt, ...rest }) => rest as StudentActivityView);
}

export async function listActivitiesForCourseSubject(
  courseId: string,
  subjectId: SubjectId
): Promise<StudentActivityView[]> {
  const all = await fetchActivitiesForCourse(courseId);
  return all.filter((activity) => activity.subjectId === subjectId);
}

// Una por asignatura (la más reciente) — usada por las vistas de resumen
// (app/estudiante/page.tsx, app/padre/page.tsx) para mostrar "tema actual"
// por asignatura sin hacer una consulta por cada una de las 9.
export async function listLatestActivityPerSubject(
  courseId: string
): Promise<Map<SubjectId, StudentActivityView>> {
  const all = await fetchActivitiesForCourse(courseId);
  const latestBySubject = new Map<SubjectId, StudentActivityView>();
  for (const activity of all) {
    if (!latestBySubject.has(activity.subjectId)) {
      latestBySubject.set(activity.subjectId, activity);
    }
  }
  return latestBySubject;
}

// Para la vista de ajustes PIAR (app/generador): todas las actividades del
// docente, sin filtrar por asignatura, para elegir sobre cuál cruzar.
export interface MyActivityOption {
  id: string;
  subjectId: SubjectId;
  topic: string;
  courseName: string;
}

export async function listMyActivities(session: Session): Promise<MyActivityOption[]> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  const rows = await db
    .select({
      id: activities.id,
      subjectId: activities.subjectId,
      topic: activities.topic,
      courseName: courses.name,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .innerJoin(courses, eq(courses.id, activities.courseId))
    .where(eq(activities.teacherUserId, session.userId));

  return rows
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((row) => ({
      id: row.id,
      subjectId: row.subjectId as SubjectId,
      topic: row.topic,
      courseName: row.courseName,
    }));
}

export interface MyActivityDetail extends TeacherActivity {
  courseId: string;
  subjectId: SubjectId;
}

// Una actividad concreta del docente. Doble guard: tiene que ser suya Y
// seguir teniendo asignado ese curso+asignatura (si la administración le
// retiró la asignación, deja de verla aunque la haya creado).
export async function getMyActivity(
  session: Session,
  activityId: string
): Promise<MyActivityDetail | null> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  const row = await db
    .select({
      id: activities.id,
      courseId: activities.courseId,
      subjectId: activities.subjectId,
      courseName: courses.name,
      grade: courses.grade,
      group: courses.group,
      topic: activities.topic,
      objective: activities.objective,
      instructions: activities.instructions,
      resources: activities.resources,
      representationNotes: activities.representationNotes,
      expressionNotes: activities.expressionNotes,
      engagementNotes: activities.engagementNotes,
      evidenceRequested: activities.evidenceRequested,
      status: activities.status,
      scheduledDate: activities.scheduledDate,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .innerJoin(courses, eq(courses.id, activities.courseId))
    .where(and(eq(activities.id, activityId), eq(activities.teacherUserId, session.userId)))
    .get();

  if (!row) return null;
  if (!(await isTeacherAssignedToCourseSubject(session.userId, row.courseId, row.subjectId))) {
    return null;
  }
  return { ...row, subjectId: row.subjectId as SubjectId };
}
