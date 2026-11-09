import { and, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { activities, activityProgress, courses, enrollments, guardianStudents, users } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { isTeacherAssignedToStudentCourse, PermissionError } from "@/lib/permissions";
import { MAX_FEEDBACK, validScore, type ProgressStatus } from "@/lib/progressShared";

// Progreso por estudiante y actividad. Quién ve qué (cada función repite su
// revisión; la matriz por sí sola no es un candado):
//   - docente: las actividades que él creó, de los estudiantes de sus cursos; es
//     el único que califica.
//   - estudiante: solo lo suyo.
//   - familia: solo sus hijos vinculados.
// No importa `clinical_info` ni muestra si el estudiante tiene PIAR.

export interface ProgressRow {
  activityId: string;
  topic: string;
  courseName: string;
  studentUserId: string;
  studentName: string;
  status: ProgressStatus;
  evidence: string | null;
  score: number | null;
  feedback: string | null;
}

async function loadRows(activityWhere: SQL | undefined, studentIds: string[] | null): Promise<ProgressRow[]> {
  const acts = await db
    .select({ id: activities.id, topic: activities.topic, courseId: activities.courseId, courseName: courses.name })
    .from(activities)
    .innerJoin(courses, eq(courses.id, activities.courseId))
    .where(activityWhere)
    .orderBy(activities.scheduledDate);
  if (!acts.length) return [];

  const courseIds = [...new Set(acts.map((a) => a.courseId))];
  const enrolled = await db
    .select({ courseId: enrollments.courseId, id: users.id, name: users.fullName })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.studentUserId))
    .where(inArray(enrollments.courseId, courseIds))
    .orderBy(users.fullName);

  const progress = await db
    .select()
    .from(activityProgress)
    .where(inArray(activityProgress.activityId, acts.map((a) => a.id)));
  const byKey = new Map(progress.map((p) => [`${p.activityId}|${p.studentUserId}`, p]));

  const rows: ProgressRow[] = [];
  for (const act of acts) {
    for (const st of enrolled.filter((e) => e.courseId === act.courseId)) {
      if (studentIds && !studentIds.includes(st.id)) continue;
      const p = byKey.get(`${act.id}|${st.id}`);
      rows.push({
        activityId: act.id,
        topic: act.topic,
        courseName: act.courseName,
        studentUserId: st.id,
        studentName: st.name,
        status: p?.status ?? "sin_empezar",
        evidence: p?.evidenceSource ? `${p.evidenceSource}${p.evidenceDetail ? `: ${p.evidenceDetail}` : ""}` : null,
        score: p?.score ?? null,
        feedback: p?.feedback ?? null,
      });
    }
  }
  return rows;
}

export async function listProgress(session: Session): Promise<ProgressRow[]> {
  if (session.role === "docente") {
    return loadRows(eq(activities.teacherUserId, session.userId), null);
  }
  if (session.role === "estudiante") {
    const enrollment = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.studentUserId, session.userId))
      .get();
    if (!enrollment) return [];
    return loadRows(eq(activities.courseId, enrollment.courseId), [session.userId]);
  }
  if (session.role === "padre") {
    const kids = (
      await db
        .select({ id: guardianStudents.studentUserId })
        .from(guardianStudents)
        .where(eq(guardianStudents.guardianUserId, session.userId))
    ).map((k) => k.id);
    if (!kids.length) return [];
    const kidCourses = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(inArray(enrollments.studentUserId, kids));
    const ids = [...new Set(kidCourses.map((c) => c.courseId))];
    if (!ids.length) return [];
    return loadRows(inArray(activities.courseId, ids), kids);
  }
  throw new PermissionError("seguimiento_pedagogico");
}

export interface GradeInput {
  activityId: string;
  studentUserId: string;
  score: number | null;
  feedback?: string;
}

// Solo el docente que creó la actividad, y solo sobre estudiantes de su curso.
export async function gradeActivity(session: Session, input: GradeInput): Promise<void> {
  if (session.role !== "docente") throw new PermissionError("seguimiento_pedagogico");
  const activity = await db
    .select({ id: activities.id })
    .from(activities)
    .where(and(eq(activities.id, input.activityId), eq(activities.teacherUserId, session.userId)))
    .get();
  // Mismo error para "no existe" y "no es tuya".
  if (!activity) throw new PermissionError("seguimiento_pedagogico");
  if (!(await isTeacherAssignedToStudentCourse(session.userId, input.studentUserId))) {
    throw new PermissionError("seguimiento_pedagogico");
  }
  if (input.score !== null && !validScore(input.score)) {
    throw new Error("La nota debe estar entre 1,0 y 5,0.");
  }
  const feedback = (input.feedback ?? "").trim().slice(0, MAX_FEEDBACK) || null;
  const now = new Date().toISOString();
  const status: ProgressStatus = input.score === null ? "entregada" : "calificada";
  const values = {
    status,
    score: input.score,
    feedback,
    gradedBy: session.userId,
    gradedAt: input.score === null ? null : now,
    updatedAt: now,
  };
  const existing = await db
    .select({ id: activityProgress.id })
    .from(activityProgress)
    .where(and(eq(activityProgress.activityId, input.activityId), eq(activityProgress.studentUserId, input.studentUserId)))
    .get();
  if (existing) {
    await db.update(activityProgress).set(values).where(eq(activityProgress.id, existing.id));
  } else {
    await db.insert(activityProgress).values({ activityId: input.activityId, studentUserId: input.studentUserId, ...values });
  }
}
