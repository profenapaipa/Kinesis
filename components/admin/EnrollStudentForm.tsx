"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AcademicPeriod } from "@/lib/data/academicPeriods";
import type { Course } from "@/lib/data/courses";
import type { SafeUser } from "@/lib/data/users";

export function EnrollStudentForm({
  courses,
  students,
  periods,
}: {
  courses: Course[];
  students: SafeUser[];
  periods: AcademicPeriod[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [studentUserId, setStudentUserId] = useState(students[0]?.id ?? "");
  const [academicPeriodId, setAcademicPeriodId] = useState(
    periods.find((period) => period.isActive)?.id ?? periods[0]?.id ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!courseId || !studentUserId || !academicPeriodId) {
      setError("Faltan datos por seleccionar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentUserId, academicPeriodId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo matricular al estudiante.");
        return;
      }
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (courses.length === 0 || students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matricular estudiante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Crea primero un curso y al menos un usuario con rol Estudiante.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matricular estudiante</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Estudiante</label>
            <Select value={studentUserId} onValueChange={(value) => value && setStudentUserId(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Curso</label>
            <Select value={courseId} onValueChange={(value) => value && setCourseId(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Periodo</label>
            <Select
              value={academicPeriodId}
              onValueChange={(value) => value && setAcademicPeriodId(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Matriculando..." : "Matricular"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
