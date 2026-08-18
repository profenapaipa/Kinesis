import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseTeachers, enrollments, users } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";
import type { Grade, SubjectId } from "@/types";

export type Course = typeof courses.$inferSelect;

export async function listCourses(session: Session): Promise<Course[]> {
  requireAdmin(session);
  return db.select().from(courses);
}

export interface CreateCourseInput {
  name: string;
  grade: Grade;
  group: string;
  academicPeriodId: string;
}

export async function createCourse(session: Session, input: CreateCourseInput): Promise<Course> {
  requireAdmin(session);
  return db.insert(courses).values(input).returning().get();
}

export interface EnrollmentWithStudent {
  id: string;
  studentUserId: string;
  studentFullName: string;
  courseId: string;
  academicPeriodId: string;
  status: string;
}

export async function listEnrollments(
  session: Session,
  courseId?: string
): Promise<EnrollmentWithStudent[]> {
  requireAdmin(session);
  const query = db
    .select({
      id: enrollments.id,
      studentUserId: enrollments.studentUserId,
      studentFullName: users.fullName,
      courseId: enrollments.courseId,
      academicPeriodId: enrollments.academicPeriodId,
      status: enrollments.status,
    })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.studentUserId));

  const rows = await query;
  return courseId ? rows.filter((row) => row.courseId === courseId) : rows;
}

export interface EnrollStudentInput {
  studentUserId: string;
  courseId: string;
  academicPeriodId: string;
}

export async function enrollStudent(session: Session, input: EnrollStudentInput) {
  requireAdmin(session);
  return db.insert(enrollments).values(input).returning().get();
}

export interface CourseTeacherWithNames {
  id: string;
  teacherUserId: string;
  teacherFullName: string;
  courseId: string;
  subjectId: SubjectId;
}

export async function listCourseTeachers(
  session: Session,
  courseId?: string
): Promise<CourseTeacherWithNames[]> {
  requireAdmin(session);
  const rows = await db
    .select({
      id: courseTeachers.id,
      teacherUserId: courseTeachers.teacherUserId,
      teacherFullName: users.fullName,
      courseId: courseTeachers.courseId,
      subjectId: courseTeachers.subjectId,
    })
    .from(courseTeachers)
    .innerJoin(users, eq(users.id, courseTeachers.teacherUserId));

  return (courseId ? rows.filter((row) => row.courseId === courseId) : rows) as CourseTeacherWithNames[];
}

export interface AssignTeacherInput {
  teacherUserId: string;
  courseId: string;
  subjectId: SubjectId;
}

export async function assignTeacherToCourse(session: Session, input: AssignTeacherInput) {
  requireAdmin(session);
  return db.insert(courseTeachers).values(input).returning().get();
}
