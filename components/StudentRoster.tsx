"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RosterStudent } from "@/lib/data/students";

// Orden pedagógico preferido cuando el grado coincide con uno conocido;
// cualquier otro valor real (futuros grupos con otro formato, ej. "8A")
// igual obtiene su propia pestaña, ordenado alfabéticamente al final —
// nunca se pierde un grado por no calzar con esta lista.
const KNOWN_GRADE_ORDER = ["8°", "9°", "10°", "11°"];

function sortGrades(grades: string[]): string[] {
  return [...grades].sort((a, b) => {
    const indexA = KNOWN_GRADE_ORDER.indexOf(a);
    const indexB = KNOWN_GRADE_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
}

function StudentCard({ student }: { student: RosterStudent }) {
  return (
    <Card className={student.hasPedagogicalProfile ? "ring-1 ring-amber-500/40" : undefined}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>{student.fullName}</CardTitle>
          <CardDescription>{student.group}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{student.grade}</Badge>
          {student.hasPedagogicalProfile && (
            <Badge className="bg-amber-500 text-white dark:bg-amber-600">
              PIAR
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Link
          href={`/estudiantes/${student.studentUserId}`}
          className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver perfil completo y avance
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function StudentRoster({ students }: { students: RosterStudent[] }) {
  const piarCount = students.filter((student) => student.hasPedagogicalProfile).length;
  const availableGrades = sortGrades([...new Set(students.map((student) => student.grade))]);
  const gradeFilters: Array<{ label: string; value: string }> = [
    { label: "Todos", value: "todos" },
    ...availableGrades.map((grade) => ({ label: grade, value: grade })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Lista de estudiantes</h2>
        <p className="text-sm text-muted-foreground">
          {students.length} estudiantes registrados · {piarCount} con PIAR
          activo
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No tienes estudiantes matriculados en tus cursos todavía.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todos">
          <TabsList>
            {gradeFilters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {gradeFilters.map((filter) => {
            const filtered =
              filter.value === "todos"
                ? students
                : students.filter((student) => student.grade === filter.value);

            return (
              <TabsContent key={filter.value} value={filter.value}>
                <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((student) => (
                    <StudentCard key={student.studentUserId} student={student} />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
