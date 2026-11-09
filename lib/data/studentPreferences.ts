import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { studentLearningPreferences } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import {
  isGuardianOfStudent,
  isTeacherAssignedToStudentCourse,
  PermissionError,
} from "@/lib/permissions";

// «Mi forma de aprender»: lo que el propio estudiante marca. Es su voz, se
// guarda aparte de lo que observa el docente (bitácora) y de lo clínico.
// Solo el estudiante la escribe y solo la suya; el docente y la familia la ven
// como «dijo que le gusta…», nunca como una etiqueta.

export const PREFERENCE_OPTIONS = [
  "imagenes",
  "ejemplos",
  "explicaciones_profesor",
  "trabajar_con_companero",
  "instrucciones_paso_a_paso",
  "videos",
  "practicar_directamente",
] as const;
export type PreferenceOption = (typeof PREFERENCE_OPTIONS)[number];

export async function setMyPreferences(session: Session, selected: string[]): Promise<string[]> {
  if (session.role !== "estudiante") throw new PermissionError("datos_basicos");
  const clean = [
    ...new Set(selected.filter((option): option is PreferenceOption =>
      (PREFERENCE_OPTIONS as readonly string[]).includes(option)
    )),
  ];

  const existing = await db
    .select()
    .from(studentLearningPreferences)
    .where(eq(studentLearningPreferences.studentUserId, session.userId));
  const now = new Date().toISOString();

  for (const option of PREFERENCE_OPTIONS) {
    const row = existing.find((candidate) => candidate.option === option);
    const wanted = clean.includes(option);
    if (row) {
      if (row.selected !== wanted) {
        await db
          .update(studentLearningPreferences)
          .set({ selected: wanted, updatedAt: now })
          .where(and(eq(studentLearningPreferences.id, row.id)));
      }
    } else if (wanted) {
      await db
        .insert(studentLearningPreferences)
        .values({ studentUserId: session.userId, option, selected: true, updatedAt: now });
    }
  }
  return clean;
}

// Lo que dijeron los estudiantes, para quien tiene derecho a verlo: el
// docente asignado al curso, el equipo de apoyo y la familia del propio
// estudiante. Se devuelve como lista de opciones marcadas; quien la muestra la
// redacta como «dijo que le gusta…», nunca como una etiqueta.
export async function listStatedPreferences(
  session: Session,
  studentUserIds: string[]
): Promise<Record<string, string[]>> {
  if (!studentUserIds.length) return {};
  const allowed: string[] = [];
  for (const studentUserId of new Set(studentUserIds)) {
    if (session.role === "orientador") allowed.push(studentUserId);
    else if (session.role === "docente" && (await isTeacherAssignedToStudentCourse(session.userId, studentUserId)))
      allowed.push(studentUserId);
    else if (session.role === "padre" && (await isGuardianOfStudent(session.userId, studentUserId)))
      allowed.push(studentUserId);
  }
  if (!allowed.length) return {};
  const rows = await db
    .select({
      studentUserId: studentLearningPreferences.studentUserId,
      option: studentLearningPreferences.option,
    })
    .from(studentLearningPreferences)
    .where(
      and(
        inArray(studentLearningPreferences.studentUserId, allowed),
        eq(studentLearningPreferences.selected, true)
      )
    );
  const byStudent: Record<string, string[]> = {};
  for (const row of rows) (byStudent[row.studentUserId] ??= []).push(row.option);
  return byStudent;
}
