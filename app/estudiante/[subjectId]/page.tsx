import Link from "next/link";
import { ArrowLeft, Clock, MessageCircle, Puzzle } from "lucide-react";
import { MemoryPuzzle } from "@/components/MemoryPuzzle";
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
import { listActivitiesForCourseSubject } from "@/lib/data/activities";
import { getMyPedagogicalSummary, getMyStudentProfile } from "@/lib/data/students";
import { MEN_SUBJECTS, getSubject } from "@/lib/subjects";
import {
  generateAdaptedTest,
  type ActivityContent,
  type AdaptedTestStudentInput,
} from "@/lib/testGenerator";
import type { SubjectId, TestQuestionFormat } from "@/types";

function isSubjectId(value: string): value is SubjectId {
  return MEN_SUBJECTS.some((subject) => subject.id === value);
}

const FORMAT_LABEL: Record<TestQuestionFormat, string> = {
  abierta: "Respuesta abierta",
  "opción múltiple": "Opción múltiple",
  oral: "Respuesta oral",
  visual: "Apoyo visual",
};

function AdaptedTestCard({
  plan,
  student,
}: {
  plan: ActivityContent;
  student: AdaptedTestStudentInput;
}) {
  const test = generateAdaptedTest(plan, student);

  return (
    <Card className="ring-1 ring-primary/30">
      <CardHeader>
        <CardTitle>{test.title}</CardTitle>
        <CardDescription>{test.instructions}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" />
          Tiempo estimado: {test.estimatedMinutes} minutos
        </div>
        <div className="flex flex-col gap-3">
          {test.questions.map((question, index) => (
            <div
              key={question.id}
              className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  {index + 1}. {question.prompt}
                </p>
                <Badge variant="secondary" className="shrink-0">
                  {FORMAT_LABEL[question.format]}
                </Badge>
              </div>
              {question.supportNote && (
                <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0" />
                  {question.supportNote}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function EstudianteSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const session = await requireRole("estudiante");
  const profile = await getMyStudentProfile(session);
  const pedagogical = await getMyPedagogicalSummary(session);

  if (!isSubjectId(subjectId)) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Esta asignatura no existe.
        </CardContent>
      </Card>
    );
  }

  const subject = getSubject(subjectId);
  const Icon = subject.icon;
  const activitiesForSubject = profile.courseId
    ? await listActivitiesForCourseSubject(profile.courseId, subjectId)
    : [];
  const plan = activitiesForSubject[0];

  const adaptedTestStudent: AdaptedTestStudentInput = {
    id: session.userId,
    hasPiar: pedagogical !== null,
    adjustmentTypes:
      pedagogical?.effectiveSupports
        .map((support) => support.categoryName)
        .filter((name): name is string => Boolean(name)) ?? [],
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/estudiante"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a mis asignaturas
      </Link>

      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
        >
          <Icon className="size-5" />
        </span>
        <h2 className="text-xl font-bold">{subject.name}</h2>
      </div>

      {!plan ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Tu docente aún no ha cargado actividades para esta asignatura.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{plan.topic}</CardTitle>
              <CardDescription>Lo que vamos a trabajar en clase</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium">Qué vamos a hacer</p>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {plan.instructions}
                </p>
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
            </CardContent>
          </Card>

          <AdaptedTestCard plan={plan} student={adaptedTestStudent} />

          {pedagogical !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="size-4 text-primary" />
                  Actividad interactiva de repaso
                </CardTitle>
                <CardDescription>
                  Una pausa activa para todos los estudiantes con PIAR — encuentra
                  las parejas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemoryPuzzle seed={`${session.userId}-${subjectId}`} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
