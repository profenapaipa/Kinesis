import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, activityProgress, enrollments, followUpNotes, users } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { MODALITY_LABEL, shortDate } from "@/lib/classLogShared";
import { listClassLog, summarizeWorked } from "@/lib/data/classLog";
import { formatScore } from "@/lib/progressShared";
import { FOLLOW_KINDS, MAX_FOLLOW_BODY, type FollowKind } from "@/lib/followUpShared";
import { isGuardianOfStudent, isTeacherAssignedToStudentCourse, PermissionError } from "@/lib/permissions";

// Seguimiento por estudiante: recomendaciones de orientación, acuerdos y
// seguimiento por periodo. Quién ve qué:
//   - orientador: todo, de cualquier estudiante.
//   - docente: todo lo del estudiante si está asignado a su curso.
//   - familia: solo lo marcado como compartido, solo de sus hijos vinculados.
//   - estudiante y administrador: nada.
// Este archivo NO importa `clinical_info`: son notas pedagógicas, sin diagnóstico.

export interface FollowUpNote {
  id: string;
  kind: FollowKind;
  body: string;
  authorRole: "orientador" | "docente";
  authorName: string;
  sharedWithGuardian: boolean;
  reviewDate: string | null;
  createdAt: string;
}

async function authorize(session: Session, studentUserId: string): Promise<void> {
  if (session.role === "orientador") return;
  if (session.role === "docente" && (await isTeacherAssignedToStudentCourse(session.userId, studentUserId))) return;
  if (session.role === "padre" && (await isGuardianOfStudent(session.userId, studentUserId))) return;
  throw new PermissionError("seguimiento_pedagogico");
}

export async function listFollowUp(session: Session, studentUserId: string): Promise<FollowUpNote[]> {
  await authorize(session, studentUserId);
  const rows = await db
    .select({
      id: followUpNotes.id,
      kind: followUpNotes.kind,
      body: followUpNotes.body,
      authorRole: followUpNotes.authorRole,
      authorName: users.fullName,
      sharedWithGuardian: followUpNotes.sharedWithGuardian,
      reviewDate: followUpNotes.reviewDate,
      createdAt: followUpNotes.createdAt,
    })
    .from(followUpNotes)
    .innerJoin(users, eq(users.id, followUpNotes.authorUserId))
    .where(eq(followUpNotes.studentUserId, studentUserId))
    .orderBy(desc(followUpNotes.createdAt));
  return session.role === "padre" ? rows.filter((row) => row.sharedWithGuardian) : rows;
}

export interface AddFollowUpInput {
  studentUserId: string;
  kind: string;
  body: string;
  sharedWithGuardian?: boolean;
  reviewDate?: string | null;
}

export async function addFollowUpNote(session: Session, input: AddFollowUpInput): Promise<void> {
  if (session.role !== "orientador" && session.role !== "docente") throw new PermissionError("seguimiento_pedagogico");
  await authorize(session, input.studentUserId);
  if (!(FOLLOW_KINDS as readonly string[]).includes(input.kind)) throw new Error("El tipo de nota no es válido.");
  // Las recomendaciones de orientación son del equipo de apoyo; el docente aporta seguimiento y acuerdos.
  if (input.kind === "recomendacion" && session.role !== "orientador") {
    throw new PermissionError("seguimiento_pedagogico");
  }
  const body = (input.body ?? "").trim();
  if (body.length < 3) throw new Error("Escribe al menos una frase.");
  if (body.length > MAX_FOLLOW_BODY) throw new Error(`La nota es muy larga (máximo ${MAX_FOLLOW_BODY} caracteres).`);
  const reviewDate = input.reviewDate && /^\d{4}-\d{2}-\d{2}$/.test(input.reviewDate) ? input.reviewDate : null;
  await db.insert(followUpNotes).values({
    studentUserId: input.studentUserId,
    authorUserId: session.userId,
    authorRole: session.role,
    kind: input.kind as FollowKind,
    body,
    sharedWithGuardian: Boolean(input.sharedWithGuardian),
    reviewDate,
  });
}

export interface FollowSummary {
  gradedCount: number;
  totalActivities: number;
  average: string;
  worked: string[];
}

// Cifras y líneas ya redactadas para la síntesis. Reutiliza los módulos de
// progreso y de bitácora, que repiten sus propias revisiones: aquí solo se
// compone lo que ese rol ya podría ver.
export async function getFollowSummary(session: Session, studentUserId: string): Promise<FollowSummary> {
  if (session.role !== "docente" && session.role !== "orientador") throw new PermissionError("seguimiento_pedagogico");
  await authorize(session, studentUserId);

  const enrollment = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentUserId, studentUserId))
    .get();
  const total = enrollment
    ? (await db.select({ id: activities.id }).from(activities).where(eq(activities.courseId, enrollment.courseId))).length
    : 0;
  const scores = (
    await db
      .select({ score: activityProgress.score })
      .from(activityProgress)
      .where(eq(activityProgress.studentUserId, studentUserId))
  )
    .map((row) => row.score)
    .filter((score): score is number => score !== null);

  const entries = (await listClassLog(session, 200)).filter((entry) => entry.studentUserId === studentUserId);
  const worked = summarizeWorked(entries).flatMap((student) =>
    student.items.map(
      (item) =>
        `${MODALITY_LABEL[item.modality]}: funcionó en ${item.worked} de ${item.total} ${
          item.total === 1 ? "registro" : "registros"
        } (último: ${shortDate(item.lastAt)})`
    )
  );
  return {
    gradedCount: scores.length,
    totalActivities: total,
    average: scores.length ? formatScore(scores.reduce((a, b) => a + b, 0) / scores.length) : "—",
    worked,
  };
}
