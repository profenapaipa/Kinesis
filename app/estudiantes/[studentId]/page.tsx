import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Mail, UserRound } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";
import { Badge } from "@/components/ui/badge";
import { LEARNING_STYLE_LABEL } from "@/lib/adaptationEngine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockStudents } from "@/lib/mockData";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export function generateStaticParams() {
  return mockStudents.map((student) => ({ studentId: student.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { studentId } = await params;
  const student = mockStudents.find((item) => item.id === studentId);
  return { title: student ? `${student.fullName} · Planeación Inclusiva` : "Estudiante" };
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;
  const student = mockStudents.find((item) => item.id === studentId);
  if (!student) notFound();

  const { piarProfile } = student;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/estudiantes"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al listado
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{student.fullName}</h2>
          <p className="text-sm text-muted-foreground">
            {student.grade} · {student.group}
          </p>
        </div>
        {student.hasPiar && (
          <Badge className="bg-amber-500 text-white dark:bg-amber-600">PIAR activo</Badge>
        )}
      </div>

      {student.hasPiar && piarProfile ? (
        <Card>
          <CardHeader>
            <CardTitle>{piarProfile.diagnosis}</CardTitle>
            <CardDescription>
              Plan Individual de Ajustes Razonables — diagnóstico y recomendaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium">Ajustes aplicados en clase</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {piarProfile.adjustmentTypes.map((adjustment) => (
                  <Badge key={adjustment} variant="secondary">
                    {adjustment}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Estilo de aprendizaje predominante</p>
              <Badge variant="outline" className="mt-1.5 border-primary/40 text-primary">
                {LEARNING_STYLE_LABEL[piarProfile.learningStyle]}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium">Recomendaciones pedagógicas</p>
              <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                {piarProfile.supportNeeds.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium">Recursos recomendados</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {piarProfile.recommendedResources.map((resource) => (
                  <Badge key={resource} variant="outline">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Fortalezas</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {piarProfile.strengths.map((strength) => (
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
                {piarProfile.responsibleProfessional}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                Última revisión: {piarProfile.lastReview}
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
            {student.fullName.split(" ")[0]} no tiene un PIAR activo actualmente.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Avance del estudiante</CardTitle>
          <CardDescription>
            Avance simulado por asignatura frente al período anterior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart studentId={student.id} />
        </CardContent>
      </Card>
    </div>
  );
}
