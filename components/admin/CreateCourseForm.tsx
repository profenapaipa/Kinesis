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
import type { Grade } from "@/types";

const GRADE_OPTIONS: Grade[] = ["8°", "9°", "10°", "11°"];

export function CreateCourseForm({ periods }: { periods: AcademicPeriod[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>("8°");
  const [group, setGroup] = useState("A");
  const [academicPeriodId, setAcademicPeriodId] = useState(periods[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!academicPeriodId) {
      setError("Primero crea un periodo académico.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, group, academicPeriodId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo crear el curso.");
        return;
      }
      setName("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear curso</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="courseName">
              Nombre
            </label>
            <input
              id="courseName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: 8°-A"
              required
              className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Grado</label>
            <Select value={grade} onValueChange={(value) => value && setGrade(value as Grade)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="courseGroup">
              Grupo
            </label>
            <input
              id="courseGroup"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              required
              className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Periodo académico</label>
            <Select
              value={academicPeriodId}
              onValueChange={(value) => value && setAcademicPeriodId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un periodo" />
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
            {isSubmitting ? "Creando..." : "Crear curso"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
