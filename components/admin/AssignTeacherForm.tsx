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
import type { Course } from "@/lib/data/courses";
import type { SafeUser } from "@/lib/data/users";
import { MEN_SUBJECTS } from "@/lib/subjects";
import type { SubjectId } from "@/types";

export function AssignTeacherForm({
  courses,
  teachers,
}: {
  courses: Course[];
  teachers: SafeUser[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [teacherUserId, setTeacherUserId] = useState(teachers[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState<SubjectId>(MEN_SUBJECTS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!courseId || !teacherUserId) {
      setError("Faltan datos por seleccionar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherUserId, subjectId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo asignar el profesor.");
        return;
      }
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (courses.length === 0 || teachers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asignar profesor a curso y asignatura</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Crea primero un curso y al menos un usuario con rol Profesor.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignar profesor a curso y asignatura</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Profesor</label>
            <Select
              value={teacherUserId}
              onValueChange={(value) => value && setTeacherUserId(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
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
            <label className="text-sm font-medium">Asignatura</label>
            <Select
              value={subjectId}
              onValueChange={(value) => value && setSubjectId(value as SubjectId)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEN_SUBJECTS.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
