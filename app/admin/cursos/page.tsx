import type { Metadata } from "next";
import { AssignTeacherForm } from "@/components/admin/AssignTeacherForm";
import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { EnrollStudentForm } from "@/components/admin/EnrollStudentForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { listAcademicPeriods } from "@/lib/data/academicPeriods";
import { listCourses, listCourseTeachers, listEnrollments } from "@/lib/data/courses";
import { listUsers } from "@/lib/data/users";
import { getSubject } from "@/lib/subjects";

export const metadata: Metadata = { title: "Cursos · Administración" };

export default async function AdminCoursesPage() {
  const session = await requireSession();
  const [courses, periods, students, teachers, enrollments, courseTeachers] = await Promise.all([
    listCourses(session),
    listAcademicPeriods(session),
    listUsers(session, "estudiante"),
    listUsers(session, "docente"),
    listEnrollments(session),
    listCourseTeachers(session),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight">Cursos</h1>
        <p className="text-muted-foreground">{courses.length} curso(s) creados.</p>
      </div>

      <CreateCourseForm periods={periods} />
      <EnrollStudentForm courses={courses} students={students} periods={periods} />
      <AssignTeacherForm courses={courses} teachers={teachers} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const period = periods.find((item) => item.id === course.academicPeriodId);
          const courseEnrollments = enrollments.filter((item) => item.courseId === course.id);
          const courseTeacherRows = courseTeachers.filter((item) => item.courseId === course.id);

          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{period?.name ?? "Sin periodo académico"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium">Estudiantes matriculados</p>
                  <p className="text-sm text-muted-foreground">{courseEnrollments.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Profesores asignados</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {courseTeacherRows.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Ninguno todavía</span>
                    ) : (
                      courseTeacherRows.map((row) => (
                        <Badge key={row.id} variant="outline">
                          {row.teacherFullName} · {getSubject(row.subjectId).shortName}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
