"use client";

import { useState } from "react";
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
import { LEARNING_STYLE_LABEL } from "@/lib/adaptationEngine";
import { mockStudents } from "@/lib/mockData";
import type { Grade, Student } from "@/types";

const GRADE_ORDER: Grade[] = ["8°", "9°", "10°", "11°"];
const availableGrades = GRADE_ORDER.filter((grade) =>
  mockStudents.some((student) => student.grade === grade)
);

const GRADE_FILTERS: Array<{ label: string; value: Grade | "todos" }> = [
  { label: "Todos", value: "todos" },
  ...availableGrades.map((grade) => ({ label: grade, value: grade })),
];

function StudentCard({ student }: { student: Student }) {
  const [expanded, setExpanded] = useState(false);
  const { piarProfile } = student;

  return (
    <Card className={student.hasPiar ? "ring-1 ring-amber-500/40" : undefined}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>{student.fullName}</CardTitle>
          <CardDescription>{student.group}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{student.grade}</Badge>
          {student.hasPiar && (
            <Badge className="bg-amber-500 text-white dark:bg-amber-600">
              PIAR
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {student.hasPiar && piarProfile && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {expanded ? "Ocultar diagnóstico y recomendaciones" : "Ver diagnóstico y recomendaciones"}
            </button>

            {expanded && (
              <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                <p>
                  <span className="font-medium">Diagnóstico: </span>
                  {piarProfile.diagnosis}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {piarProfile.adjustmentTypes.map((adjustment) => (
                    <Badge key={adjustment} variant="secondary">
                      {adjustment}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Aprende mejor: {LEARNING_STYLE_LABEL[piarProfile.learningStyle]}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">Recomendaciones pedagógicas</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {piarProfile.supportNeeds.map((need) => (
                      <li key={need}>{need}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  Última revisión: {piarProfile.lastReview} ·{" "}
                  {piarProfile.responsibleProfessional}
                </p>
              </div>
            )}
          </>
        )}

        <Link
          href={`/estudiantes/${student.id}`}
          className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver perfil completo y avance
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function StudentRoster() {
  const piarCount = mockStudents.filter((student) => student.hasPiar).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Lista de estudiantes</h2>
        <p className="text-sm text-muted-foreground">
          {mockStudents.length} estudiantes registrados · {piarCount} con PIAR
          activo
        </p>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          {GRADE_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GRADE_FILTERS.map((filter) => {
          const students =
            filter.value === "todos"
              ? mockStudents
              : mockStudents.filter((student) => student.grade === filter.value);

          return (
            <TabsContent key={filter.value} value={filter.value}>
              <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
