import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, ShieldAlert, UserRound } from "lucide-react";
import { PanelHeader } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { LEARNING_STYLE_LABEL } from "@/lib/studentFriendlyText";
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
import {
  getPedagogicalSummaryForSupport,
  getPedagogicalSummaryForTeacher,
  getStudentProfileForSupport,
  getStudentProfileForTeacher,
} from "@/lib/data/students";
import { canViewDiagnosis, PermissionError } from "@/lib/permissions";

export const metadata: Metadata = { title: "Estudiante" };

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;
  const session = await requireRole("docente", "orientador");
  const isSupport = session.role === "orientador";

  let profile;
  try {
    profile = isSupport
      ? await getStudentProfileForSupport(session, studentId)
      : await getStudentProfileForTeacher(session, studentId);
  } catch (error) {
    // PermissionError (docente no asignado) o "no encontrado" (id inválido,
    // solo alcanzable por orientador ya que el docente nunca llega aquí sin
    // antes fallar la verificación de asignación) — ambos son 404 para esta
    // página, nunca un error sin manejar.
    if (error instanceof PermissionError || error instanceof Error) notFound();
    throw error;
  }

  const pedagogical = isSupport
    ? await getPedagogicalSummaryForSupport(session, studentId)
    : await getPedagogicalSummaryForTeacher(session, studentId);
  const canSeeDiagnosis = await canViewDiagnosis(session, studentId);
  const diagnosis = canSeeDiagnosis ? await getClinicalDiagnosis(session, studentId) : null;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        size="compact"
        back={{ href: "/estudiantes", label: "Volver al listado" }}
        eyebrow={pedagogical ? "PIAR activo" : "Sin PIAR activo"}
        title={profile.fullName}
        description={`${profile.grade ?? "Sin curso activo"}${profile.group ? ` · ${profile.group}` : ""}`}
      />

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
