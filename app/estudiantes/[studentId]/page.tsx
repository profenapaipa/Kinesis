import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ShieldAlert, UserRound } from "lucide-react";
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
import { requireRole } from "@/lib/auth/session";
import { getClinicalDiagnosis } from "@/lib/data/clinicalInfo";
import { getPedagogicalSummaryForTeacher, getStudentProfileForTeacher } from "@/lib/data/students";
import { canViewDiagnosis, PermissionError } from "@/lib/permissions";

export const metadata: Metadata = { title: "Estudiante · Planeación Inclusiva" };

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;
  const session = await requireRole("docente");

  let profile;
  try {
    profile = await getStudentProfileForTeacher(session, studentId);
  } catch (error) {
    if (error instanceof PermissionError) notFound();
    throw error;
  }

  const pedagogical = await getPedagogicalSummaryForTeacher(session, studentId);
  const canSeeDiagnosis = await canViewDiagnosis(session, studentId);
  const diagnosis = canSeeDiagnosis ? await getClinicalDiagnosis(session, studentId) : null;

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
          <h2 className="text-xl font-semibold">{profile.fullName}</h2>
          <p className="text-sm text-muted-foreground">
            {profile.grade ?? "Sin curso activo"}
            {profile.group ? ` · ${profile.group}` : ""}
          </p>
        </div>
        {pedagogical && (
          <Badge className="bg-amber-500 text-white dark:bg-amber-600">PIAR activo</Badge>
        )}
      </div>

      {pedagogical ? (
        <Card>
          <CardHeader>
            <CardTitle>PIAR activo</CardTitle>
            <CardDescription>
              Plan Individual de Ajustes Razonables — resumen pedagógico
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {pedagogical.learningStyle && (
              <p className="text-sm text-muted-foreground">
                Prefiere aprender:{" "}
                <span className="font-medium text-foreground">
                  {LEARNING_STYLE_LABEL[pedagogical.learningStyle]}
                </span>{" "}
                — úsalo como una señal de motivación, no como regla para
                limitar el formato de tus actividades: el diseño universal
                (ver Planeación) ya ofrece varios formatos a todo el curso.
              </p>
            )}

            {pedagogical.effectiveSupports.length > 0 && (
              <div>
                <p className="text-sm font-medium">Ajustes aplicados en clase</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {pedagogical.effectiveSupports.map((support, index) => (
                    <Badge key={index} variant="secondary">
                      {support.categoryName ?? support.description}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {pedagogical.effectiveSupports.length > 0 && (
              <div>
                <p className="text-sm font-medium">Apoyos que han funcionado</p>
                <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                  {pedagogical.effectiveSupports.map((support, index) => (
                    <li key={index}>{support.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {pedagogical.barriers.length > 0 && (
              <div>
                <p className="text-sm font-medium">Barreras a tener en cuenta</p>
                <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                  {pedagogical.barriers.map((barrier, index) => (
                    <li key={index}>{barrier}</li>
                  ))}
                </ul>
              </div>
            )}

            {pedagogical.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium">Fortalezas</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {pedagogical.strengths.map((strength, index) => (
                    <Badge key={index} variant="outline">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {diagnosis ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Información clínica</p>
                <p className="text-sm text-muted-foreground">{diagnosis.diagnosis}</p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-5">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="size-4" />
                    {diagnosis.responsibleProfessional}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="size-4" />
                    Última revisión: {diagnosis.lastReviewDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                Información clínica no disponible para tu perfil en este
                estudiante.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {profile.fullName.split(" ")[0]} no tiene un PIAR activo actualmente.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Avance del estudiante</CardTitle>
          <CardDescription>Seguimiento por asignatura frente al período anterior.</CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-sm text-muted-foreground">
          El seguimiento de avance estará disponible próximamente.
        </CardContent>
      </Card>
    </div>
  );
}
