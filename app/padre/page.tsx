"use client";

import { CalendarClock, Mail, UserRound } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { ProgressChart } from "@/components/ProgressChart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { findMockStudentBySessionName } from "@/lib/legacyStudentBridge";
import { mockLessonPlans } from "@/lib/mockData";
import { MEN_SUBJECTS } from "@/lib/subjects";

export default function PadrePage() {
  const { session } = useSession();
  const student = findMockStudentBySessionName(session.fullName);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Seguimiento de {student.fullName}
        </h1>
        <p className="text-muted-foreground">
          {student.grade} · {student.group}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Avance académico</CardTitle>
            <CardDescription>
              Avance simulado de {student.fullName.split(" ")[0]} por asignatura,
              frente al período anterior.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart studentId={student.id} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Asignaturas y temas actuales</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEN_SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const plan = mockLessonPlans.find(
              (item) => item.subject === subject.id && item.grade === student.grade
            );

            return (
              <Card key={subject.id} className="h-full">
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
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{subject.shortName}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan ? `Tema actual: ${plan.topic}` : "Sin planeación cargada"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Plan Individual de Ajustes Razonables</h2>

        {student.hasPiar && student.piarProfile ? (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>{student.piarProfile.diagnosis}</CardTitle>
                <CardDescription>PIAR activo y en seguimiento</CardDescription>
              </div>
              <Badge className="bg-amber-500 text-white dark:bg-amber-600">
                PIAR
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium">Ajustes aplicados en clase</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {student.piarProfile.adjustmentTypes.map((adjustment) => (
                    <Badge key={adjustment} variant="secondary">
                      {adjustment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Cómo puedes ayudar en casa</p>
                <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                  {student.piarProfile.supportNeeds.map((need) => (
                    <li key={need}>{need}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium">Fortalezas de {student.fullName.split(" ")[0]}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {student.piarProfile.strengths.map((strength) => (
                    <Badge key={strength} variant="outline">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-5">
                <span className="flex items-center gap-1.5">
                  <UserRound className="size-4" />
                  {student.piarProfile.responsibleProfessional}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-4" />
                  Última revisión: {student.piarProfile.lastReview}
                </span>
                {student.guardianContact && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-4" />
                    {student.guardianContact}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              {student.fullName.split(" ")[0]} no tiene un PIAR activo
              actualmente. Si consideras que podría necesitar apoyos
              adicionales, puedes solicitar una valoración con el equipo de
              orientación del colegio.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
