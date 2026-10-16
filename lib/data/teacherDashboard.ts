import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { activities, courses, courseTeachers, enrollments, pedagogicalProfiles } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { PermissionError } from "@/lib/permissions";
import type { SubjectId } from "@/types";

// Panel de inicio del docente, sobre datos reales. Reemplaza las cifras de
// lib/mockData.ts que app/page.tsx venía mostrando aunque el resto de la app
// ya leyera la BD (pendiente de Fase 1/9).
//
// Alcance: solo los cursos con asignación en course_teachers y solo las
// actividades del propio docente. Este archivo NO toca clinical_info: el
// panel dice cuántos estudiantes tienen perfil pedagógico (lo mismo que ya
// muestra el roster), nunca qué diagnóstico tienen.

export interface DashboardCourse {
  courseId: string;
  courseName: string;
  studentCount: number;
  withProfileCount: number;
  subjectIds: SubjectId[];
}

export interface DashboardActivity {
  id: string;
  subjectId: SubjectId;
  topic: string;
  courseName: string;
  scheduledDate: string | null;
  // Cuántos de los tres principios DUA quedaron escritos (0 a 3).
  duaPrinciples: number;
}

export interface TeacherDashboard {
  courses: DashboardCourse[];
  studentCount: number;
  withProfileCount: number;
  activityCount: number;
  // Actividades con los tres principios DUA escritos.
  duaCompleteCount: number;
  pendingFollowUpCount: number;
  upcoming: DashboardActivity[];
  duaIncomplete: DashboardActivity[];
  activityCountBySubject: Map<SubjectId, number>;
  assignedSubjects: Set<SubjectId>;
}

function hasText(value: string | null): boolean {
  return Boolean(value && value.trim());
}

export async function getTeacherDashboard(session: Session): Promise<TeacherDashboard> {
  if (session.role !== "docente") throw new PermissionError("planeacion");

  const assignments = await db
    .select({
      courseId: courseTeachers.courseId,
      courseName: courses.name,
      subjectId: courseTeachers.subjectId,
    })
    .from(courseTeachers)
    .innerJoin(courses, eq(courses.id, courseTeachers.courseId))
    .where(eq(courseTeachers.teacherUserId, session.userId));

  const courseIds = [...new Set(assignments.map((row) => row.courseId))];

  const enrollmentRows =
    courseIds.length === 0
      ? []
      : await db
          .select({
            courseId: enrollments.courseId,
            studentUserId: enrollments.studentUserId,
            profileId: pedagogicalProfiles.id,
          })
          .from(enrollments)
          .leftJoin(
            pedagogicalProfiles,
            eq(pedagogicalProfiles.studentUserId, enrollments.studentUserId)
          )
          .where(and(inArray(enrollments.courseId, courseIds), eq(enrollments.status, "activa")));

  const activityRows = await db
    .select({
      id: activities.id,
      subjectId: activities.subjectId,
      topic: activities.topic,
      courseName: courses.name,
      status: activities.status,
      scheduledDate: activities.scheduledDate,
      createdAt: activities.createdAt,
      representationNotes: activities.representationNotes,
      expressionNotes: activities.expressionNotes,
      engagementNotes: activities.engagementNotes,
    })
    .from(activities)
    .innerJoin(courses, eq(courses.id, activities.courseId))
    .where(eq(activities.teacherUserId, session.userId));

  const courseMap = new Map<string, DashboardCourse>();
  for (const row of assignments) {
    const course = courseMap.get(row.courseId) ?? {
      courseId: row.courseId,
      courseName: row.courseName,
      studentCount: 0,
      withProfileCount: 0,
      subjectIds: [],
    };
    course.subjectIds.push(row.subjectId as SubjectId);
    courseMap.set(row.courseId, course);
  }

  // Un estudiante puede aparecer en más de un curso del mismo docente: el
  // total general cuenta personas, no matrículas.
  const studentsWithProfile = new Set<string>();
  const allStudents = new Set<string>();
  for (const row of enrollmentRows) {
    const course = courseMap.get(row.courseId);
    if (course) {
      course.studentCount += 1;
      if (row.profileId) course.withProfileCount += 1;
    }
    allStudents.add(row.studentUserId);
    if (row.profileId) studentsWithProfile.add(row.studentUserId);
  }

  const today = new Date().toISOString().slice(0, 10);
  const mapped = activityRows.map((row) => ({
    view: {
      id: row.id,
      subjectId: row.subjectId as SubjectId,
      topic: row.topic,
      courseName: row.courseName,
      scheduledDate: row.scheduledDate,
      duaPrinciples: [row.representationNotes, row.expressionNotes, row.engagementNotes].filter(
        hasText
      ).length,
    } satisfies DashboardActivity,
    status: row.status,
    createdAt: row.createdAt,
  }));

  const upcoming = mapped
    .filter((item) => item.view.scheduledDate && item.view.scheduledDate >= today)
    .sort((a, b) => (a.view.scheduledDate ?? "").localeCompare(b.view.scheduledDate ?? ""))
    .slice(0, 5)
    .map((item) => item.view);

  const duaIncomplete = mapped
    .filter((item) => item.view.duaPrinciples < 3)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => item.view);

  const activityCountBySubject = new Map<SubjectId, number>();
  for (const item of mapped) {
    activityCountBySubject.set(
      item.view.subjectId,
      (activityCountBySubject.get(item.view.subjectId) ?? 0) + 1
    );
  }

  return {
    courses: [...courseMap.values()],
    studentCount: allStudents.size,
    withProfileCount: studentsWithProfile.size,
    activityCount: mapped.length,
    duaCompleteCount: mapped.length - duaIncomplete.length,
    pendingFollowUpCount: mapped.filter((item) => item.status === "pendiente_seguimiento").length,
    upcoming,
    duaIncomplete,
    activityCountBySubject,
    assignedSubjects: new Set(assignments.map((row) => row.subjectId as SubjectId)),
  };
}
