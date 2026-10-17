import Link from "next/link";
import { ClipboardList, Layers, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { EmptyState, PanelHeader, SectionTitle } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/auth/session";
import { getMyActivity, listMyActivities } from "@/lib/data/activities";
import { listCourseStudentsWithSummaryForTeacher } from "@/lib/data/students";
import { getSubject } from "@/lib/subjects";
import { cn } from "@/lib/utils";

// Vista compartida por app/generador (primera actividad) y
// app/generador/[activityId] (la elegida). Va en una ruta y no en
// ?actividad= porque la demostración es un export estático, que no admite
// searchParams (ver lib/demo/params.ts).
//
// Cruce real entre una actividad del docente y los perfiles pedagógicos de
// su curso. Reemplaza al generador sobre lib/mockData.ts (estudiantes
// ficticios, con diagnóstico, visible para cualquier rol con sesión).
//
// No redacta ajustes automáticamente: pone lado a lado lo que el diseño
// universal ya ofrece a todo el curso y lo que cada estudiante necesita, para
// que el docente decida qué falta. La generación asistida es la Fase 5
// (docs/HOJA_DE_RUTA.md) y debe partir de aquí, no de reglas fijas.

const DUA_PRINCIPLES = [
  { key: "representationNotes", label: "Representación", question: "¿Cómo presento el tema?" },
  { key: "expressionNotes", label: "Acción y expresión", question: "¿Cómo pueden responder?" },
  { key: "engagementNotes", label: "Participación", question: "¿Qué los engancha?" },
] as const;

export async function AdjustmentsView({
  session,
  activityId,
}: {
  session: Session;
  activityId?: string;
}) {
  const options = await listMyActivities(session);

  if (options.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <PanelHeader
          eyebrow="Ajustes PIAR"
          title="Primero, una actividad"
          description="Los ajustes individuales se piensan sobre una clase concreta. Crea una actividad con su diseño universal y vuelve aquí."
        />
        <EmptyState
          icon={ClipboardList}
          title="Aún no tienes actividades"
          description="En Planeación eliges la asignatura y el curso, y el formulario te guía por los tres principios del DUA."
          action={
            <Link href="/planeacion" className="mt-2 text-sm font-bold text-primary hover:underline">
              Ir a planeación
            </Link>
          }
        />
      </div>
    );
  }

  const selectedId = activityId ?? options[0].id;
  const activity = await getMyActivity(session, selectedId);
  const students = activity
    ? await listCourseStudentsWithSummaryForTeacher(session, activity.courseId, activity.subjectId)
    : [];
  const subject = activity ? getSubject(activity.subjectId) : null;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Ajustes PIAR"
        title="Lo que el diseño universal no alcanza"
        description="Elige una actividad. A la izquierda, lo que ya ofreces a todo el curso; a la derecha, lo que cada estudiante con PIAR necesita. El ajuste individual es la diferencia entre los dos."
      />

      <nav aria-label="Actividades" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <Link
              key={option.id}
              href={`/generador/${option.id}`}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-muted-foreground ring-border hover:text-foreground"
              )}
            >
              {getSubject(option.subjectId).shortName} · {option.topic}
            </Link>
          );
        })}
      </nav>

      {!activity || !subject ? (
        <EmptyState
          icon={ShieldCheck}
          title="Esta actividad ya no está disponible"
          description="Puede que la administración te haya retirado la asignación de ese curso o asignatura."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section className="flex flex-col gap-4 self-start rounded-2xl bg-card p-5 shadow-card ring-1 ring-border lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
              >
                <subject.icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-extrabold">{activity.topic}</span>
                <span className="text-xs text-muted-foreground">
                  {subject.shortName} · {activity.courseName}
                </span>
              </div>
            </div>
            <p className="text-sm">
              <span className="font-bold">Objetivo: </span>
              {activity.objective}
            </p>

            <div className="flex flex-col gap-3">
              <SectionTitle title="Para todo el curso" description="Diseño Universal de Aprendizaje" />
              {DUA_PRINCIPLES.map((principle) => {
                const text = activity[principle.key];
                return (
                  <div key={principle.key} className="rounded-xl bg-muted/60 p-3">
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      {principle.label}
                    </p>
                    {text?.trim() ? (
                      <p className="mt-1 text-sm whitespace-pre-line">{text}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground italic">
                        Sin escribir — {principle.question}
                      </p>
                    )}
                  </div>
                );
              })}
              <Link
                href={`/planeacion/${activity.subjectId}`}
                className="text-sm font-bold text-primary hover:underline"
              >
                Editar en planeación
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle
              title="Estudiantes con PIAR en este curso"
              description="Barreras activas y apoyos que ya les han funcionado. Sin diagnóstico: para ajustar la clase no hace falta."
            />
            {students.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Nadie en este curso tiene PIAR registrado"
                description="Con el diseño universal de la actividad basta. Si un estudiante lo necesita, el equipo de apoyo registra su perfil."
              />
            ) : (
              students.map((student) => (
                <article
                  key={student.studentUserId}
                  className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-4" />
                      </span>
                      <span className="font-extrabold">{student.fullName}</span>
                    </span>
                    <Link
                      href={`/estudiantes/${student.studentUserId}`}
                      className="shrink-0 text-sm font-bold text-primary hover:underline"
                    >
                      Ver perfil
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        Barreras en el aula
                      </p>
                      {student.summary.barriers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin barreras activas registradas.</p>
                      ) : (
                        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                          {student.summary.barriers.map((barrier) => (
                            <li key={barrier}>{barrier}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        Apoyos que le han funcionado
                      </p>
                      {student.summary.effectiveSupports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aún no hay apoyos registrados.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {student.summary.effectiveSupports.map((support, index) => (
                            <Badge key={`${support.categoryName}-${index}`} variant="secondary">
                              {support.categoryName ?? support.description}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {student.summary.strengths.length > 0 && (
                    <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>
                        <span className="font-bold">Para apoyarse en: </span>
                        {student.summary.strengths.join(" · ")}
                      </span>
                    </p>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
