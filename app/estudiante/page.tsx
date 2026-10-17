import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronRight, HeartHandshake } from "lucide-react";
import { EmptyState, PanelCard, PanelHeader, SectionTitle } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { listLatestActivityPerSubject } from "@/lib/data/activities";
import { getMyPedagogicalSummary, getMyStudentProfile } from "@/lib/data/students";
import { firstName } from "@/lib/format";
import { LEARNING_PREFERENCE_LABEL } from "@/lib/studentFriendlyText";
import { MEN_SUBJECTS } from "@/lib/subjects";

export const metadata: Metadata = { title: "Mi panel" };

// Panel del estudiante. Tono cercano y frases cortas (ver "Tono por público"
// en docs/IDENTIDAD_DE_MARCA.md): lo primero es qué está aprendiendo y luego
// cómo lo acompañan. Nunca muestra diagnóstico ni la palabra "PIAR" como
// etiqueta sobre la persona; solo los apoyos, en lenguaje de estudiante.
export default async function EstudiantePage() {
  const session = await requireRole("estudiante");
  const profile = await getMyStudentProfile(session);
  const pedagogical = await getMyPedagogicalSummary(session);
  const latestActivityBySubject = profile.courseId
    ? await listLatestActivityPerSubject(profile.courseId)
    : new Map();

  // Primero las asignaturas que ya tienen tema: es lo que el estudiante
  // puede abrir hoy.
  const subjects = [...MEN_SUBJECTS].sort(
    (a, b) =>
      Number(latestActivityBySubject.has(b.id)) - Number(latestActivityBySubject.has(a.id))
  );
  const friendlySupports =
    pedagogical?.effectiveSupports.filter((support) => support.studentFriendlyText) ?? [];
  const courseLabel = profile.grade
    ? `Curso ${profile.grade}${profile.group ? ` ${profile.group}` : ""}`
    : "Sin curso activo";

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow={courseLabel}
        title={`Hola, ${firstName(profile.fullName)}`}
        description="Aquí ves lo que estás aprendiendo en cada asignatura y cómo te acompañamos en clase."
        footer={
          friendlySupports.length > 0 ? (
            <section className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border">
              <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                Tu plan de aprendizaje
              </p>
              <h2 className="mt-1 text-2xl font-black">Hecho para ti</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {friendlySupports.map((support, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{support.studentFriendlyText}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : undefined
        }
      />

      <section className="flex flex-col gap-3">
        <SectionTitle
          title="Mis asignaturas"
          description="Entra a una asignatura para ver la actividad de tu docente y tu prueba adaptada."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            const plan = latestActivityBySubject.get(subject.id);

            const content = (
              <>
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${subject.color}1f`, color: subject.color }}
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{subject.shortName}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {plan ? plan.topic : "Todavía sin tema"}
                  </span>
                </span>
                {plan && (
                  <ChevronRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                )}
              </>
            );

            return plan ? (
              <Link
                key={subject.id}
                href={`/estudiante/${subject.id}`}
                className="group flex items-center gap-3 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border outline-none transition-[translate,box-shadow] hover:-translate-y-1 hover:ring-primary focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0"
              >
                {content}
              </Link>
            ) : (
              <div
                key={subject.id}
                className="flex items-center gap-3 rounded-3xl bg-muted/60 p-4 opacity-75"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PanelCard>
          <SectionTitle
            title="Apoyos que puedes pedir"
            description="Si los necesitas, pídeselos a tu docente: son tuyos."
          />
          {pedagogical && pedagogical.effectiveSupports.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pedagogical.effectiveSupports.map((support, index) => (
                <Badge key={index} variant="secondary">
                  {support.categoryName ?? support.description}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HeartHandshake}
              title="Aún no hay apoyos registrados"
              description="Si sientes que algo te cuesta en clase, cuéntaselo a tu docente o al orientador del colegio."
            />
          )}
        </PanelCard>

        <PanelCard>
          <SectionTitle
            title="Tu forma de aprender"
            description="Así dijiste que aprendes mejor. Igual vas a aprender de muchas formas."
          />
          {profile.learningPreferences.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.learningPreferences.map((option) => (
                <Badge key={option} variant="secondary">
                  {LEARNING_PREFERENCE_LABEL[option] ?? option}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Todavía no lo has contado"
              description="Con tu docente puedes decir si aprendes mejor viendo, escuchando o haciendo."
            />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
