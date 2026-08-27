import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { guardianStudents, users } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";

export interface GuardianStudentLink {
  id: string;
  guardianUserId: string;
  guardianFullName: string;
  studentUserId: string;
  studentFullName: string;
  relationship: string;
  authorizedForDiagnosis: boolean;
}

const guardianUsers = alias(users, "guardian_users");
const studentUsers = alias(users, "student_users");

export async function listGuardianLinks(session: Session): Promise<GuardianStudentLink[]> {
  requireAdmin(session);
  return db
    .select({
      id: guardianStudents.id,
      guardianUserId: guardianStudents.guardianUserId,
      guardianFullName: guardianUsers.fullName,
      studentUserId: guardianStudents.studentUserId,
      studentFullName: studentUsers.fullName,
      relationship: guardianStudents.relationship,
      authorizedForDiagnosis: guardianStudents.authorizedForDiagnosis,
    })
    .from(guardianStudents)
    .innerJoin(guardianUsers, eq(guardianUsers.id, guardianStudents.guardianUserId))
    .innerJoin(studentUsers, eq(studentUsers.id, guardianStudents.studentUserId));
}

export interface CreateGuardianLinkInput {
  guardianUserId: string;
  studentUserId: string;
  relationship: string;
  authorizedForDiagnosis?: boolean;
}

// authorizedForDiagnosis se guarda tal cual, pero NO habilita acceso clínico
// por sí solo: canViewDiagnosis() (lib/permissions.ts) sigue devolviendo
// false para cualquier rol distinto de docente, sin excepción. Conectar
// este flag a un acceso real es una decisión de política aparte.
export async function createGuardianLink(
  session: Session,
  input: CreateGuardianLinkInput
) {
  requireAdmin(session);

  const existing = await db
    .select({ id: guardianStudents.id })
    .from(guardianStudents)
    .where(
      and(
        eq(guardianStudents.guardianUserId, input.guardianUserId),
        eq(guardianStudents.studentUserId, input.studentUserId)
      )
    )
    .get();
  if (existing) {
    throw new Error("Ese acudiente ya está vinculado a ese estudiante.");
  }

  return db
    .insert(guardianStudents)
    .values({
      guardianUserId: input.guardianUserId,
      studentUserId: input.studentUserId,
      relationship: input.relationship,
      authorizedForDiagnosis: input.authorizedForDiagnosis ?? false,
    })
    .returning()
    .get();
}

export async function deleteGuardianLink(session: Session, id: string): Promise<void> {
  requireAdmin(session);
  await db.delete(guardianStudents).where(eq(guardianStudents.id, id));
}
