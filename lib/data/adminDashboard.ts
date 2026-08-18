import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, courses, enrollments, pedagogicalProfiles, users } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";

export interface AdminDashboardStats {
  totalStudents: number;
  studentsWithPiar: number;
  totalTeachers: number;
  totalCourses: number;
  activeActivities: number;
  pendingTracking: number;
  studentsWithoutEnrollment: number;
  inactiveUsers: number;
}

export async function getAdminDashboardStats(session: Session): Promise<AdminDashboardStats> {
  requireAdmin(session);

  const [
    totalStudentsRow,
    studentsWithPiarRow,
    totalTeachersRow,
    totalCoursesRow,
    pendingTrackingRow,
    inactiveUsersRow,
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.role, "estudiante")).get(),
    db.select({ value: count() }).from(pedagogicalProfiles).get(),
    db.select({ value: count() }).from(users).where(eq(users.role, "docente")).get(),
    db.select({ value: count() }).from(courses).get(),
    db
      .select({ value: count() })
      .from(activities)
      .where(eq(activities.status, "pendiente_seguimiento"))
      .get(),
    db.select({ value: count() }).from(users).where(eq(users.isActive, false)).get(),
  ]);

  const allActivities = await db.select({ id: activities.id }).from(activities);
  const studentUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "estudiante"));
  const enrolledStudentIds = new Set(
    (await db.select({ studentUserId: enrollments.studentUserId }).from(enrollments)).map(
      (row) => row.studentUserId
    )
  );

  return {
    totalStudents: totalStudentsRow?.value ?? 0,
    studentsWithPiar: studentsWithPiarRow?.value ?? 0,
    totalTeachers: totalTeachersRow?.value ?? 0,
    totalCourses: totalCoursesRow?.value ?? 0,
    activeActivities: allActivities.length,
    pendingTracking: pendingTrackingRow?.value ?? 0,
    studentsWithoutEnrollment: studentUsers.filter((student) => !enrolledStudentIds.has(student.id))
      .length,
    inactiveUsers: inactiveUsersRow?.value ?? 0,
  };
}
