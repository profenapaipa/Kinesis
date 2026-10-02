import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  academicPeriods,
  courses,
  courseTeachers,
  effectiveSupports,
  enrollments,
  guardianStudents,
  pedagogicalBarriers,
  pedagogicalProfiles,
  pedagogicalStrengths,
  studentLearningPreferences,
  supportCategories,
  users,
} from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { isGuardianOfStudent, isTeacherAssignedToStudentCourse, PermissionError } from "@/lib/permissions";
import type { LearningStyle } from "@/types";

// Consultas de datos para las vistas de estudiante y padre. Este archivo
// NUNCA importa `clinicalInfo` de db/schema — el diagnóstico, el profesional
// responsable y la fecha de revisión son clínicos y están fuera del alcance
// de estas dos vistas (ver canViewDiagnosis() en lib/permissions.ts).

export interface StudentBasicProfile {
  fullName: string;
  courseId: string | null;
  grade: string | null;
  group: string | null;
  courseName: string | null;
  learningPreferences: string[];
}

export interface EffectiveSupportSummary {
  description: string;
  categoryName: string | null;
  studentFriendlyText: string | null;
}

export interface PedagogicalSummary {
  learningStyle: LearningStyle | null;
  strengths: string[];
  barriers: string[];
  effectiveSupports: EffectiveSupportSummary[];
}

export interface GuardianChild {
  studentUserId: string;
  fullName: string;
  relationship: string;
}

export interface RosterStudent {
  studentUserId: string;
  fullName: string;
  grade: string;
  group: string;
  hasPedagogicalProfile: boolean;
}

async function fetchStudentBasicProfile(
  studentUserId: string
): Promise<StudentBasicProfile | undefined> {
  const user = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, studentUserId))
    .get();
  if (!user) return undefined;

  const activeEnrollment = await db
    .select({
      courseId: courses.id,
      grade: courses.grade,
      group: courses.group,
      courseName: courses.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .innerJoin(academicPeriods, eq(academicPeriods.id, enrollments.academicPeriodId))
    .where(
      and(
        eq(enrollments.studentUserId, studentUserId),
        eq(enrollments.status, "activa"),
        eq(academicPeriods.isActive, true)
      )
    )
    .get();

  const preferenceRows = await db
    .select({ option: studentLearningPreferences.option })
    .from(studentLearningPreferences)
    .where(
      and(
        eq(studentLearningPreferences.studentUserId, studentUserId),
        eq(studentLearningPreferences.selected, true)
      )
    );

  return {
    fullName: user.fullName,
    courseId: activeEnrollment?.courseId ?? null,
    grade: activeEnrollment?.grade ?? null,
    group: activeEnrollment?.group ?? null,
    courseName: activeEnrollment?.courseName ?? null,
    learningPreferences: preferenceRows.map((row) => row.option),
  };
}

async function fetchPedagogicalSummary(
  studentUserId: string
): Promise<PedagogicalSummary | null> {
  const profile = await db
    .select()
    .from(pedagogicalProfiles)
    .where(eq(pedagogicalProfiles.studentUserId, studentUserId))
    .get();
  if (!profile) return null;

  const strengths = await db
    .select({ description: pedagogicalStrengths.description })
    .from(pedagogicalStrengths)
    .where(eq(pedagogicalStrengths.profileId, profile.id));

  const barriers = await db
    .select({ description: pedagogicalBarriers.description })
    .from(pedagogicalBarriers)
    .where(
      and(eq(pedagogicalBarriers.profileId, profile.id), eq(pedagogicalBarriers.isActive, true))
    );

  const effective = await db
    .select({
      description: effectiveSupports.description,
      categoryName: supportCategories.name,
      studentFriendlyText: supportCategories.studentFriendlyText,
    })
    .from(effectiveSupports)
    .leftJoin(supportCategories, eq(supportCategories.id, effectiveSupports.supportCategoryId))
    .where(eq(effectiveSupports.profileId, profile.id));

  return {
    learningStyle: profile.learningStyle,
    strengths: strengths.map((row) => row.description),
    barriers: barriers.map((row) => row.description),
    effectiveSupports: effective.map((row) => ({
      description: row.description,
      categoryName: row.categoryName ?? null,
      studentFriendlyText: row.studentFriendlyText ?? null,
    })),
  };
}

export async function getMyStudentProfile(session: Session): Promise<StudentBasicProfile> {
  if (session.role !== "estudiante") throw new PermissionError("datos_basicos");
  const profile = await fetchStudentBasicProfile(session.userId);
  if (!profile) throw new Error("Perfil de estudiante no encontrado.");
  return profile;
}

export async function getMyPedagogicalSummary(
  session: Session
): Promise<PedagogicalSummary | null> {
  if (session.role !== "estudiante") throw new PermissionError("adaptaciones");
  return fetchPedagogicalSummary(session.userId);
}

export async function getGuardianChildren(session: Session): Promise<GuardianChild[]> {
  if (session.role !== "padre") throw new PermissionError("datos_basicos");
  return db
    .select({
      studentUserId: guardianStudents.studentUserId,
      fullName: users.fullName,
      relationship: guardianStudents.relationship,
    })
    .from(guardianStudents)
    .innerJoin(users, eq(users.id, guardianStudents.studentUserId))
    .where(eq(guardianStudents.guardianUserId, session.userId));
}

export async function getChildProfile(
  session: Session,
  studentUserId: string
): Promise<StudentBasicProfile> {
  if (session.role !== "padre") throw new PermissionError("datos_basicos");
  if (!(await isGuardianOfStudent(session.userId, studentUserId))) {
    throw new PermissionError("datos_basicos");
  }
  const profile = await fetchStudentBasicProfile(studentUserId);
  if (!profile) throw new Error("Perfil de estudiante no encontrado.");
  return profile;
}

export async function getChildPedagogicalSummary(
  session: Session,
  studentUserId: string
): Promise<PedagogicalSummary | null> {
  if (session.role !== "padre") throw new PermissionError("adaptaciones");
  if (!(await isGuardianOfStudent(session.userId, studentUserId))) {
    throw new PermissionError("adaptaciones");
  }
  return fetchPedagogicalSummary(studentUserId);
}

// Roster del docente: estudiantes matriculados (activa) en cursos donde
// tiene alguna asignación en course_teachers. Deliberadamente NO incluye
// resumen pedagógico completo ni nada clínico — solo lo necesario para la
// lista (nombre, curso, si tiene o no perfil pedagógico registrado).
export async function listMyStudents(session: Session): Promise<RosterStudent[]> {
  if (session.role !== "docente") throw new PermissionError("datos_basicos");

  const myCourseRows = await db
    .select({ courseId: courseTeachers.courseId })
    .from(courseTeachers)
    .where(eq(courseTeachers.teacherUserId, session.userId));
  const myCourseIds = [...new Set(myCourseRows.map((row) => row.courseId))];
  if (myCourseIds.length === 0) return [];

  const rows = await db
    .select({
      studentUserId: enrollments.studentUserId,
      fullName: users.fullName,
      grade: courses.grade,
      group: courses.group,
      hasPedagogicalProfile: pedagogicalProfiles.id,
    })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .innerJoin(users, eq(users.id, enrollments.studentUserId))
    .leftJoin(pedagogicalProfiles, eq(pedagogicalProfiles.studentUserId, enrollments.studentUserId))
    .where(and(inArray(enrollments.courseId, myCourseIds), eq(enrollments.status, "activa")));

  const byStudent = new Map<string, RosterStudent>();
  for (const row of rows) {
    byStudent.set(row.studentUserId, {
      studentUserId: row.studentUserId,
      fullName: row.fullName,
      grade: row.grade,
      group: row.group,
      hasPedagogicalProfile: Boolean(row.hasPedagogicalProfile),
    });
  }
  return [...byStudent.values()];
}

export async function getStudentProfileForTeacher(
  session: Session,
  studentUserId: string
): Promise<StudentBasicProfile> {
  if (session.role !== "docente") throw new PermissionError("datos_basicos");
  if (!(await isTeacherAssignedToStudentCourse(session.userId, studentUserId))) {
    throw new PermissionError("datos_basicos");
  }
  const profile = await fetchStudentBasicProfile(studentUserId);
  if (!profile) throw new Error("Perfil de estudiante no encontrado.");
  return profile;
}

export async function getPedagogicalSummaryForTeacher(
  session: Session,
  studentUserId: string
): Promise<PedagogicalSummary | null> {
  if (session.role !== "docente") throw new PermissionError("adaptaciones");
  if (!(await isTeacherAssignedToStudentCourse(session.userId, studentUserId))) {
    throw new PermissionError("adaptaciones");
  }
  return fetchPedagogicalSummary(studentUserId);
}

// Acceso institucional del equipo de apoyo (orientador, Decreto 1421): ve
// TODOS los estudiantes del colegio, no solo los de un curso o docente
// concreto — mismo alcance amplio que canViewDiagnosis() le da para
// clinical_info. Sin este nivel, el rol no podría cumplir su función real.
export async function listAllStudentsForSupport(session: Session): Promise<RosterStudent[]> {
  if (session.role !== "orientador") throw new PermissionError("datos_basicos");

  const rows = await db
    .select({
      studentUserId: users.id,
      fullName: users.fullName,
      grade: courses.grade,
      group: courses.group,
      hasPedagogicalProfile: pedagogicalProfiles.id,
    })
    .from(users)
    .leftJoin(
      enrollments,
      and(eq(enrollments.studentUserId, users.id), eq(enrollments.status, "activa"))
    )
    .leftJoin(courses, eq(courses.id, enrollments.courseId))
    .leftJoin(pedagogicalProfiles, eq(pedagogicalProfiles.studentUserId, users.id))
    .where(eq(users.role, "estudiante"));

  const byStudent = new Map<string, RosterStudent>();
  for (const row of rows) {
    byStudent.set(row.studentUserId, {
      studentUserId: row.studentUserId,
      fullName: row.fullName,
      grade: row.grade ?? "Sin curso",
      group: row.group ?? "—",
      hasPedagogicalProfile: Boolean(row.hasPedagogicalProfile),
    });
  }
  return [...byStudent.values()];
}

export async function getStudentProfileForSupport(
  session: Session,
  studentUserId: string
): Promise<StudentBasicProfile> {
  if (session.role !== "orientador") throw new PermissionError("datos_basicos");
  const profile = await fetchStudentBasicProfile(studentUserId);
  if (!profile) throw new Error("Perfil de estudiante no encontrado.");
  return profile;
}

export async function getPedagogicalSummaryForSupport(
  session: Session,
  studentUserId: string
): Promise<PedagogicalSummary | null> {
  if (session.role !== "orientador") throw new PermissionError("adaptaciones");
  return fetchPedagogicalSummary(studentUserId);
}
