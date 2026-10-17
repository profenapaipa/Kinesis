import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { CreateActivityForm } from "@/components/CreateActivityForm";
import { PanelHeader } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireRole } from "@/lib/auth/session";
import { listActivitiesForSubject, listMyCoursesForSubject } from "@/lib/data/activities";
import { MEN_SUBJECTS, getSubject } from "@/lib/subjects";
import type { SubjectId } from "@/types";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

function isSubjectId(value: string): value is SubjectId {
  return MEN_SUBJECTS.some((subject) => subject.id === value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subjectId } = await params;
  if (!isSubjectId(subjectId)) return {};
  return { title: `${getSubject(subjectId).shortName}` };
}

export default async function SubjectPlanningPage({ params }: PageProps) {
  const { subjectId } = await params;
  if (!isSubjectId(subjectId)) notFound();

  const session = await requireRole("docente");
  const subject = getSubject(subjectId);
  const Icon = subject.icon;

  const courses = await listMyCoursesForSubject(session, subjectId);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PanelHeader
          size="compact"
          back={{ href: "/planeacion", label: "Planeación" }}
          icon={<Icon className="size-5" style={{ color: subject.color }} />}
          title={subject.name}
        />
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No tienes la asignatura {subject.shortName} asignada en ningún curso.
          </CardContent>
        </Card>
      </div>
    );
  }

  const plans = await listActivitiesForSubject(session, subjectId);

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        size="compact"
        back={{ href: "/planeacion", label: "Planeación" }}
        icon={<Icon className="size-5" style={{ color: subject.color }} />}
        title={subject.name}
        description={
          plans.length > 0
            ? `${plans.length} actividad${plans.length > 1 ? "es" : ""} cargada${
                plans.length > 1 ? "s" : ""
              }`
            : "Aún no hay actividades cargadas para esta asignatura"
        }
      />

      <CreateActivityForm subjectId={subjectId} courses={courses} />

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Cuando cargues una actividad de {subject.shortName}, aparecerá
            aquí y quedará disponible en el Generador PIAR.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>{plan.topic}</CardTitle>
                  <CardDescription>
                    {plan.courseName} · {plan.scheduledDate ?? "Sin fecha programada"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <ClipboardList className="size-3.5" />
                  {plan.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-sm text-muted-foreground">{plan.objective}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Instrucciones</p>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {plan.instructions}
                  </p>
                </div>

                {(plan.representationNotes || plan.expressionNotes || plan.engagementNotes) && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3">
                      <p className="text-sm font-medium">Diseño universal para todo el curso</p>
                      {plan.representationNotes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Más de una forma de presentar
                          </p>
                          <p className="text-sm">{plan.representationNotes}</p>
                        </div>
                      )}
                      {plan.expressionNotes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Más de una forma de expresar lo aprendido
                          </p>
                          <p className="text-sm">{plan.expressionNotes}</p>
                        </div>
                      )}
                      {plan.engagementNotes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Cómo se sostiene el interés
                          </p>
                          <p className="text-sm">{plan.engagementNotes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {plan.resources.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Recursos</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {plan.resources.map((resource) => (
                          <Badge key={resource} variant="outline">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {plan.evidenceRequested && (
                  <div>
                    <p className="text-sm font-medium">Evidencia solicitada</p>
                    <p className="text-sm text-muted-foreground">{plan.evidenceRequested}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
