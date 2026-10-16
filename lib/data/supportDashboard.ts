import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  courses,
  effectiveSupports,
  enrollments,
  pedagogicalBarriers,
  pedagogicalProfiles,
  users,
} from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { PermissionError } from "@/lib/permissions";

// Inicio del equipo de apoyo (orientador, Decreto 1421 de 2017): una vista
// de todo el colegio para decidir a quién acompañar primero. Mismo alcance
// institucional que listAllStudentsForSupport() en lib/data/students.ts.
//
// Deliberadamente NO lee clinical_info: para priorizar basta saber qué
// perfiles PIAR están incompletos. El diagnóstico sigue estando en la ficha
// de cada estudiante, detrás de canViewDiagnosis().

export interface ProfileToComplete {
  studentUserId: string;
  fullName: string;
  courseName: string | null;
  missing: string[];
}

export interface SupportCourse {
  courseName: string;
  studentCount: number;
  withProfileCount: number;
}

export interface SupportDashboard {
  studentCount: number;
  withProfileCount: number;
  withoutCourseCount: number;
  profilesToComplete: ProfileToComplete[];
  courses: SupportCourse[];
  activityCount: number;
  duaCompleteCount: number;
}

function hasText(value: string | null): boolean {
  return Boolean(value && value.trim());
}

export async function getSupportDashboard(session: Session): Promise<SupportDashboard> {
  if (session.role !== "orientador") throw new PermissionError("seguimiento_pedagogico");

  const [students, activeEnrollments, profiles, barrierRows, supportRows, activityRows] =
    await Promise.all([
      db
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .where(eq(users.role, "estudiante")),
      db
        .select({ studentUserId: enrollments.studentUserId, courseName: courses.name })
        .from(enrollments)
        .innerJoin(courses, eq(courses.id, enrollments.courseId))
        .where(eq(enrollments.status, "activa")),
      db
        .select({ id: pedagogicalProfiles.id, studentUserId: pedagogicalProfiles.studentUserId })
        .from(pedagogicalProfiles),
      db
        .select({ profileId: pedagogicalBarriers.profileId })
        .from(pedagogicalBarriers)
        .where(eq(pedagogicalBarriers.isActive, true)),
      db.select({ profileId: effectiveSupports.profileId }).from(effectiveSupports),
      db
        .select({
          representationNotes: activities.representationNotes,
          expressionNotes: activities.expressionNotes,
          engagementNotes: activities.engagementNotes,
        })
        .from(activities),
    ]);

  const courseByStudent = new Map<string, string>();
  for (const row of activeEnrollments) courseByStudent.set(row.studentUserId, row.courseName);

  const profileByStudent = new Map(profiles.map((row) => [row.studentUserId, row.id]));
  const profilesWithBarriers = new Set(barrierRows.map((row) => row.profileId));
  const profilesWithSupports = new Set(supportRows.map((row) => row.profileId));

  const profilesToComplete: ProfileToComplete[] = [];
  const courseMap = new Map<string, SupportCourse>();

  for (const student of students) {
    const courseName = courseByStudent.get(student.id) ?? null;
    const profileId = profileByStudent.get(student.id);

    if (courseName) {
      const course = courseMap.get(courseName) ?? { courseName, studentCount: 0, withProfileCount: 0 };
      course.studentCount += 1;
      if (profileId) course.withProfileCount += 1;
      courseMap.set(courseName, course);
    }

    if (profileId) {
      const missing = [
        profilesWithBarriers.has(profileId) ? null : "barreras",
        profilesWithSupports.has(profileId) ? null : "apoyos que funcionan",
        courseName ? null : "curso",
      ].filter((item): item is string => Boolean(item));
      if (missing.length > 0) {
        profilesToComplete.push({ studentUserId: student.id, fullName: student.fullName, courseName, missing });
      }
    }
  }

  return {
    studentCount: students.length,
    withProfileCount: profileByStudent.size,
    withoutCourseCount: students.filter((student) => !courseByStudent.has(student.id)).length,
    profilesToComplete: profilesToComplete.sort((a, b) => a.fullName.localeCompare(b.fullName, "es")),
    courses: [...courseMap.values()].sort((a, b) => a.courseName.localeCompare(b.courseName, "es")),
    activityCount: activityRows.length,
    duaCompleteCount: activityRows.filter((row) =>
      [row.representationNotes, row.expressionNotes, row.engagementNotes].every(hasText)
    ).length,
  };
}
