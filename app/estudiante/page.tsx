"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findMockStudentBySessionName } from "@/lib/legacyStudentBridge";
import { mockLessonPlans } from "@/lib/mockData";
import { STUDENT_FRIENDLY_ADJUSTMENTS } from "@/lib/studentFriendlyText";
import { MEN_SUBJECTS } from "@/lib/subjects";

export default function EstudiantePage() {
  const { session } = useSession();
  const student = findMockStudentBySessionName(session.fullName);
  const firstName = student.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
        <p className="text-muted-foreground">
          {student.grade} · {student.group}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mis asignaturas</h2>
        <p className="text-sm text-muted-foreground">
          Entra a una asignatura para ver las actividades que cargó tu docente
          y tu prueba adaptada.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEN_SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const plan = mockLessonPlans.find(
              (item) => item.subject === subject.id && item.grade === student.grade
            );

            const cardContent = (
              <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardContent className="flex items-start gap-3 py-4">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${subject.color}1a`,
                      color: subject.color,
                    }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{subject.shortName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {plan ? `Tema actual: ${plan.topic}` : "Sin planeación cargada"}
                    </span>
                  </div>
                  {plan && (
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  )}
                </CardContent>
              </Card>
            );

            return plan ? (
              <Link
                key={subject.id}
                href={`/estudiante/${subject.id}`}
                className="group focus-visible:outline-none"
              >
                {cardContent}
              </Link>
            ) : (
              <div key={subject.id} className="opacity-70">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mis apoyos</h2>

        {student.hasPiar && student.piarProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Así te acompañamos en clase</CardTitle>
              <CardDescription>
                Estos son los ajustes que tu colegio tiene preparados para ti,
                de acuerdo con tu PIAR.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ul className="flex flex-col gap-2.5">
                {student.piarProfile.adjustmentTypes.map((adjustment) => (
                  <li key={adjustment} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{STUDENT_FRIENDLY_ADJUSTMENTS[adjustment]}</span>
                  </li>
                ))}
              </ul>

              <div>
                <p className="text-sm font-medium">Recursos que puedes usar</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {student.piarProfile.recommendedResources.map((resource) => (
                    <Badge key={resource} variant="secondary">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Si tienes dudas sobre tus apoyos, puedes hablar con{" "}
                {student.piarProfile.responsibleProfessional}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Actualmente no tienes un PIAR activo. Si tú o tu familia creen
              que podrías necesitar apoyos adicionales, hablen con el
              orientador o coordinador de tu colegio.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
