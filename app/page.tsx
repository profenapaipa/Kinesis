import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Layers,
  PlusCircle,
  Sparkles,
  Users,
} from "lucide-react";
import {
  EmptyState,
  NextStepCard,
  PanelHeader,
  SectionTitle,
  StatStrip,
} from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getTeacherDashboard, type DashboardActivity, type TeacherDashboard } from "@/lib/data/teacherDashboard";
import { getSubject, MEN_SUBJECTS } from "@/lib/subjects";

export const metadata: Metadata = { title: "Inicio" };

const DUA_LABEL = ["Sin DUA", "1 de 3 principios", "2 de 3 principios", "DUA completo"];

function formatToday(): string {
  const text = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

// Una sola recomendación por visita, en orden de lo que más destraba la
// planeación inclusiva: sin actividades no hay nada que cruzar; una
// actividad sin DUA obliga a parchar después estudiante por estudiante.
function nextStep(data: TeacherDashboard) {
  const firstAssigned = MEN_SUBJECTS.find((subject) => data.assignedSubjects.has(subject.id));
  if (data.activityCount === 0) {
    return {
      icon: PlusCircle,
      title: "Crea tu primera actividad",
      description:
        "Escríbela una vez pensando en todo el curso: cómo presentas el tema, cómo pueden responder y qué los engancha.",
      href: firstAssigned ? `/planeacion/${firstAssigned.id}` : "/planeacion",
      cta: "Ir a planeación",
    };
  }
  const pending = data.duaIncomplete[0];
  if (pending) {
    return {
      icon: Layers,
      title: `Completa el DUA de “${pending.topic}”`,
      description: `Tiene ${pending.duaPrinciples} de 3 principios escritos. Con el diseño universal completo, los ajustes individuales se reducen a lo que de verdad hace falta.`,
      href: `/planeacion/${pending.subjectId}`,
      cta: "Abrir la actividad",
    };
  }
  return {
    icon: Sparkles,
    title: "Revisa los ajustes individuales",
    description:
      "Tus actividades ya tienen el diseño universal completo. Mira qué apoyos puntuales necesitan los estudiantes con PIAR.",
    href: "/generador",
    cta: "Ver ajustes PIAR",
  };
}

function ActivityRow({ activity, detail }: { activity: DashboardActivity; detail: string }) {
  const subject = getSubject(activity.subjectId);
  const Icon = subject.icon;
  return (
    <li>
      <Link
        href={`/planeacion/${activity.subjectId}`}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
        >
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-bold">{activity.topic}</span>
          <span className="truncate text-xs text-muted-foreground">
            {subject.shortName} · {activity.courseName}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{detail}</span>
      </Link>
    </li>
  );
}

export default async function Home() {
  const session = await requireRole("docente");
  const data = await getTeacherDashboard(session);
  const firstName = session.fullName.split(" ")[0] ?? session.fullName;
  const step = nextStep(data);
  const duaPercent =
    data.activityCount === 0 ? "—" : `${Math.round((data.duaCompleteCount / data.activityCount) * 100)}%`;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow={formatToday()}
        title={`Hola, ${firstName}`}
        description="Diseña tu clase una vez para todo el curso y deja los ajustes individuales para lo que el diseño universal no alcanza a cubrir."
        aside={<NextStepCard {...step} />}
      />

      <StatStrip
        items={[
          { label: "Estudiantes", value: data.studentCount, hint: `En ${data.courses.length} curso(s)` },
          { label: "Con PIAR", value: data.withProfileCount, hint: "Tienen perfil pedagógico" },
          { label: "Actividades", value: data.activityCount, hint: "Creadas por ti" },
          { label: "Con DUA completo", value: duaPercent, hint: "Los 3 principios escritos" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <SectionTitle title="Próximas clases" description="Actividades con fecha desde hoy." />
          {data.upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin clases programadas"
              description="Cuando le pongas fecha a una actividad aparece aquí, para que la prepares con tiempo."
            />
          ) : (
            <ul className="-mx-3 flex flex-col">
              {data.upcoming.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  detail={formatDay(activity.scheduledDate ?? "")}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <SectionTitle
            title="Diseño universal por completar"
            description="Representación, acción y expresión, participación."
          />
          {data.duaIncomplete.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={data.activityCount === 0 ? "Aún no hay actividades" : "Todo al día"}
              description={
                data.activityCount === 0
                  ? "Al crear una actividad, el formulario te pide los tres principios del DUA."
                  : "Todas tus actividades tienen los tres principios escritos."
              }
            />
          ) : (
            <ul className="-mx-3 flex flex-col">
              {data.duaIncomplete.slice(0, 5).map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  detail={DUA_LABEL[activity.duaPrinciples]}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle
          title="Mis cursos"
          action={
            <Link href="/estudiantes" className="text-sm font-bold text-primary hover:underline">
              Ver estudiantes
            </Link>
          }
        />
        {data.courses.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no tienes cursos asignados"
            description="La administración del colegio asigna cursos y asignaturas. Cuando lo haga, tus estudiantes aparecen aquí."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((course) => (
              <div
                key={course.courseId}
                className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-black tracking-tight">{course.courseName}</span>
                  <span className="text-sm text-muted-foreground">
                    {course.studentCount} estudiante(s)
                  </span>
                </div>
                <p className="text-sm">
                  <span className="font-bold text-primary">{course.withProfileCount}</span> con PIAR
                  activo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {course.subjectIds.map((subjectId) => (
                    <Badge key={subjectId} variant="secondary">
                      {getSubject(subjectId).shortName}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle
          title="Mis asignaturas"
          description="Áreas obligatorias y fundamentales de la Ley 115 de 1994 que tienes asignadas."
        />
        {data.assignedSubjects.size === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin asignaturas asignadas"
            description="Aparecen aquí cuando la administración te asigna una asignatura en un curso."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {MEN_SUBJECTS.filter((subject) => data.assignedSubjects.has(subject.id)).map((subject) => {
              const Icon = subject.icon;
              const count = data.activityCountBySubject.get(subject.id) ?? 0;
              return (
                <Link
                  key={subject.id}
                  href={`/planeacion/${subject.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold">{subject.shortName}</span>
                    <span className="text-xs text-muted-foreground">
                      {count === 0 ? "Sin actividades" : `${count} actividad${count > 1 ? "es" : ""}`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
