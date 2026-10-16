import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, UserRound, Users } from "lucide-react";
import { EmptyState, NextStepCard, PanelHeader, SectionTitle, StatStrip } from "@/components/panel/Panel";
import { requireRole } from "@/lib/auth/session";
import { getSupportDashboard } from "@/lib/data/supportDashboard";

export const metadata: Metadata = { title: "Inicio" };

// Inicio del equipo de apoyo pedagógico. Prioriza perfiles PIAR incompletos:
// un perfil sin barreras ni apoyos registrados deja al docente sin nada que
// cruzar en "Ajustes PIAR".
export default async function OrientacionPage() {
  const session = await requireRole("orientador");
  const data = await getSupportDashboard(session);
  const firstName = session.fullName.split(" ")[0] ?? session.fullName;
  const first = data.profilesToComplete[0];
  const duaPercent =
    data.activityCount === 0 ? "—" : `${Math.round((data.duaCompleteCount / data.activityCount) * 100)}%`;

  const step = first
    ? {
        icon: ClipboardCheck,
        title: `Completa el perfil de ${first.fullName.split(" ")[0]}`,
        description: `Le falta: ${first.missing.join(", ")}. Sin eso, su docente no tiene con qué ajustar la clase.`,
        href: `/estudiantes/${first.studentUserId}`,
        cta: "Abrir su ficha",
      }
    : {
        icon: Users,
        title: "Revisa a los estudiantes del colegio",
        description: "Todos los perfiles PIAR tienen barreras y apoyos registrados.",
        href: "/estudiantes",
        cta: "Ver estudiantes",
      };

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Equipo de apoyo pedagógico"
        title={`Hola, ${firstName}`}
        description="Todo el colegio en una vista: a quién le falta información en su PIAR y cómo van los docentes con el diseño universal."
        aside={<NextStepCard {...step} />}
      />

      <StatStrip
        items={[
          { label: "Estudiantes", value: data.studentCount, hint: `${data.withoutCourseCount} sin curso` },
          { label: "Con PIAR", value: data.withProfileCount, hint: "Perfil pedagógico registrado" },
          { label: "Perfiles por completar", value: data.profilesToComplete.length },
          { label: "Actividades con DUA", value: duaPercent, hint: `De ${data.activityCount} en el colegio` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <SectionTitle
            title="Perfiles PIAR por completar"
            description="Estudiantes con PIAR a los que les falta información para que el docente pueda ajustar."
          />
          {data.profilesToComplete.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Todo al día"
              description="Cada perfil PIAR tiene barreras, apoyos que funcionan y curso."
            />
          ) : (
            <ul className="-mx-3 flex flex-col">
              {data.profilesToComplete.map((profile) => (
                <li key={profile.studentUserId}>
                  <Link
                    href={`/estudiantes/${profile.studentUserId}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-bold">{profile.fullName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {profile.courseName ?? "Sin curso"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Falta: {profile.missing.join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle
            title="Cursos"
            action={
              <Link href="/estudiantes" className="text-sm font-bold text-primary hover:underline">
                Ver estudiantes
              </Link>
            }
          />
          {data.courses.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aún no hay cursos con estudiantes"
              description="La administración crea los cursos y matricula a los estudiantes."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.courses.map((course) => (
                <li
                  key={course.courseName}
                  className="flex items-baseline justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <span className="text-xl font-black tracking-tight">{course.courseName}</span>
                  <span className="text-sm text-muted-foreground">
                    {course.studentCount} estudiante(s) ·{" "}
                    <span className="font-bold text-primary">{course.withProfileCount}</span> con PIAR
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
