import type { Metadata } from "next";
import { BookOpen, Home, Sparkles, UserRound } from "lucide-react";
import {
  EmptyState,
  PanelCard,
  PanelHeader,
  SectionTitle,
  StatStrip,
  type StatItem,
} from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { requireRole, type Session } from "@/lib/auth/session";
import { listLatestActivityPerSubject, type StudentActivityView } from "@/lib/data/activities";
import {
  getChildPedagogicalSummary,
  getChildProfile,
  getGuardianChildren,
  type GuardianChild,
} from "@/lib/data/students";
import { firstName, formatToday } from "@/lib/format";
import { LEARNING_STYLE_LABEL } from "@/lib/studentFriendlyText";
import { MEN_SUBJECTS } from "@/lib/subjects";
import type { SubjectId } from "@/types";

export const metadata: Metadata = { title: "Mi panel" };

// Panel de la familia. Tono cálido y sin tecnicismos (ver "Tono por público"
// en docs/IDENTIDAD_DE_MARCA.md). Muestra qué está aprendiendo su hijo o hija,
// qué ajustes recibe en clase y cómo acompañar desde casa. No muestra el
// diagnóstico: la capa de datos (lib/data/students.ts) no lo lee, y solo
// trae a los estudiantes vinculados a esta cuenta.

async function loadChild(session: Session, child: GuardianChild) {
  const profile = await getChildProfile(session, child.studentUserId);
  const pedagogical = await getChildPedagogicalSummary(session, child.studentUserId);
  const latestActivityBySubject = profile.courseId
    ? await listLatestActivityPerSubject(profile.courseId)
    : new Map<SubjectId, StudentActivityView>();
  const currentTopics = MEN_SUBJECTS.flatMap((subject) => {
    const plan = latestActivityBySubject.get(subject.id);
    return plan ? [{ subject, topic: plan.topic }] : [];
  });
  return { child, profile, pedagogical, currentTopics };
}

type ChildData = Awaited<ReturnType<typeof loadChild>>;

function childStats({ pedagogical, currentTopics }: ChildData): StatItem[] {
  return [
    {
      label: "Asignaturas con tema",
      value: `${currentTopics.length}/${MEN_SUBJECTS.length}`,
      hint: "Con actividad cargada por el docente",
    },
    {
      label: "Ajustes en clase",
      value: pedagogical?.effectiveSupports.length ?? 0,
      hint: pedagogical ? "Apoyos que le funcionan" : "Sin PIAR activo",
    },
    {
      label: "Fortalezas",
      value: pedagogical?.strengths.length ?? 0,
      hint: "Registradas por el colegio",
    },
  ];
}

function ChildSection({ data, showStats }: { data: ChildData; showStats: boolean }) {
  const { profile, pedagogical, currentTopics } = data;
  const name = firstName(profile.fullName);
  const course = profile.grade
    ? `${profile.grade}${profile.group ? ` ${profile.group}` : ""}`
    : "Sin curso activo";

  return (
    <div className="flex flex-col gap-6">
      {showStats && (
        <div className="flex flex-col gap-3">
          <SectionTitle title={profile.fullName} description={`Curso ${course}`} />
          <StatStrip items={childStats(data)} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <PanelCard>
          <SectionTitle
            title={`Lo que está aprendiendo ${name}`}
            description="El tema más reciente que cargó cada docente."
          />
          {currentTopics.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Aún no hay temas cargados"
              description="Cuando los docentes carguen sus actividades, aquí verás de qué se trata cada clase."
            />
          ) : (
            <ul className="-mx-2 flex flex-col">
              {currentTopics.map(({ subject, topic }) => {
                const Icon = subject.icon;
                return (
                  <li key={subject.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${subject.color}1f`, color: subject.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs font-bold text-muted-foreground">
                        {subject.shortName}
                      </span>
                      <span className="truncate font-semibold">{topic}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelCard>

        <PanelCard>
          <SectionTitle
            title="Su plan de apoyos"
            description="Los ajustes razonables que el colegio aplica en clase."
          />
          {pedagogical ? (
            <div className="flex flex-col gap-4">
              {pedagogical.learningStyle && (
                <p className="text-sm text-muted-foreground">
                  Prefiere aprender por el canal{" "}
                  <span className="font-semibold text-foreground">
                    {LEARNING_STYLE_LABEL[pedagogical.learningStyle].toLowerCase()}
                  </span>
                  . Es una preferencia, no un límite: en clase recibe los
                  contenidos de varias formas.
                </p>
              )}
              {pedagogical.effectiveSupports.length > 0 && (
                <div>
                  <p className="text-sm font-bold">Ajustes en clase</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pedagogical.effectiveSupports.map((support, index) => (
                      <Badge key={index} variant="secondary">
                        {support.categoryName ?? support.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {pedagogical.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-bold">Fortalezas de {name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pedagogical.strengths.map((strength, index) => (
                      <Badge key={index} variant="outline">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title={`${name} no tiene un PIAR activo`}
              description="Si crees que podría necesitar apoyos adicionales, puedes pedir una valoración al equipo de orientación del colegio."
            />
          )}
        </PanelCard>
      </div>

      {pedagogical && pedagogical.effectiveSupports.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-white shadow-card">
          <span
            aria-hidden
            className="kn-orb pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/8"
          />
          <p className="relative flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-white/80 uppercase">
            <Home className="size-4" />
            Para la casa
          </p>
          <h2 className="relative mt-1 text-2xl font-black">Cómo puedes acompañar</h2>
          <ul className="relative mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {pedagogical.effectiveSupports.map((support, index) => (
              <li key={index} className="flex flex-col gap-0.5 rounded-2xl bg-white/12 px-4 py-3 text-sm">
                {support.categoryName && <span className="font-bold">{support.categoryName}</span>}
                <span className="text-white/85">{support.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default async function PadrePage() {
  const session = await requireRole("padre");
  const children = await getGuardianChildren(session);
  const loaded = await Promise.all(children.map((child) => loadChild(session, child)));
  const only = loaded.length === 1 ? loaded[0] : null;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow={formatToday()}
        title={`Hola, ${firstName(session.fullName)}`}
        description={
          only
            ? `Así va ${firstName(only.profile.fullName)} en el colegio: lo que está aprendiendo, los apoyos que recibe en clase y cómo acompañar desde casa.`
            : "Así van tus hijos en el colegio: lo que están aprendiendo, los apoyos que reciben en clase y cómo acompañarlos desde casa."
        }
        footer={only ? <StatStrip items={childStats(only)} /> : undefined}
      />

      {loaded.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Aún no tienes estudiantes vinculados"
          description="El colegio vincula tu cuenta con la de tu hijo o hija. Si crees que es un error, comunícate con la secretaría."
        />
      ) : (
        loaded.map((data) => (
          <ChildSection key={data.child.studentUserId} data={data} showStats={!only} />
        ))
      )}
    </div>
  );
}
