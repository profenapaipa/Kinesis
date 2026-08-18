import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockLessonPlans } from "@/lib/mockData";
import { MEN_SUBJECTS, getSubject } from "@/lib/subjects";
import type { SubjectId } from "@/types";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

function isSubjectId(value: string): value is SubjectId {
  return MEN_SUBJECTS.some((subject) => subject.id === value);
}

export function generateStaticParams() {
  return MEN_SUBJECTS.map((subject) => ({ subjectId: subject.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subjectId } = await params;
  if (!isSubjectId(subjectId)) return {};
  return { title: `${getSubject(subjectId).shortName} · Planeación Inclusiva` };
}

export default async function SubjectPlanningPage({ params }: PageProps) {
  const { subjectId } = await params;
  if (!isSubjectId(subjectId)) notFound();

  const subject = getSubject(subjectId);
  const Icon = subject.icon;
  const plans = mockLessonPlans.filter((plan) => plan.subject === subjectId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold">{subject.name}</h2>
          <p className="text-sm text-muted-foreground">
            {plans.length > 0
              ? `${plans.length} planeación${plans.length > 1 ? "es" : ""} cargada${
                  plans.length > 1 ? "s" : ""
                }`
              : "Aún no hay planeaciones cargadas para esta asignatura"}
          </p>
        </div>
      </div>

      <FileUploadDropzone subjectId={subjectId} />

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Cuando cargues una planeación de {subject.shortName}, aparecerá
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
                    {plan.grade} · {plan.date}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <ClipboardList className="size-3.5" />
                  {plan.activities.length} actividades
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-sm text-muted-foreground">{plan.objective}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Actividades</p>
                  {plan.activities.map((activity, index) => (
                    <div key={activity.id} className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">
                        {index + 1}. {activity.title}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({activity.durationMinutes} min)
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>

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

                <div>
                  <p className="text-sm font-medium">Evaluación</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.evaluationMethod}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
