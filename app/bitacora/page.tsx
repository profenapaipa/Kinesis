import type { Metadata } from "next";
import { BookOpenCheck, NotebookPen } from "lucide-react";
import { PreferencesEditor } from "@/components/bitacora/PreferencesEditor";
import { QuickLogForm } from "@/components/bitacora/QuickLogForm";
import { WorkedSummaryCard } from "@/components/bitacora/WorkedSummaryCard";
import { EmptyState, PanelCard, PanelHeader, SectionTitle } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { KIND_LABEL, MODALITY_LABEL, OUTCOME_LABEL, SOURCE_LABEL, shortDate } from "@/lib/classLogShared";
import { listClassLog, listLogTargetsForTeacher, summarizeWorked } from "@/lib/data/classLog";
import { getGuardianChildren, getMyStudentProfile } from "@/lib/data/students";
import { listStatedPreferences } from "@/lib/data/studentPreferences";

export const metadata: Metadata = { title: "Bitácora" };

// Bitácora de clase: registros rápidos, a mano o con ayuda de Niky, durante la
// clase o después. Una sola pantalla para cuatro roles; lo que cada uno ve lo
// decide lib/data/classLog.ts (el administrador no tiene acceso).

const COPY = {
  docente: {
    title: "Bitácora de clase",
    description:
      "Anota lo que pasó y lo que funcionó, durante la clase o después. Tú escribes o Niky ordena tu nota; tú confirmas.",
  },
  orientador: {
    title: "Bitácora del colegio",
    description:
      "Lo que los docentes y las familias han registrado como novedad o como «lo que funcionó». Las observaciones privadas del docente no llegan aquí.",
  },
  padre: {
    title: "Lo que vemos en casa y en clase",
    description:
      "Cuenta lo que notas en casa y lee lo que el docente decidió compartir contigo sobre tu hija o hijo.",
  },
  estudiante: {
    title: "Lo que me ayuda",
    description: "Cuéntanos qué te ayudó hoy y cómo te gusta aprender. Tu docente lo lee.",
  },
} as const;

export default async function BitacoraPage() {
  const session = await requireRole("docente", "orientador", "padre", "estudiante");
  const role = session.role as keyof typeof COPY;
  const copy = COPY[role];

  const entries = await listClassLog(session);
  const groups = summarizeWorked(entries);

  const teacherTargets = role === "docente" ? await listLogTargetsForTeacher(session) : null;
  const children = role === "padre" ? await getGuardianChildren(session) : [];
  const studentProfile = role === "estudiante" ? await getMyStudentProfile(session) : null;

  const nameById: Record<string, string> = {};
  for (const student of teacherTargets?.students ?? []) nameById[student.id] = student.name;
  for (const child of children) nameById[child.studentUserId] = child.fullName;

  const stated =
    role === "estudiante"
      ? {}
      : await listStatedPreferences(session, [
          ...new Set([
            ...groups.map((group) => group.studentUserId),
            ...Object.keys(nameById),
          ]),
        ]);

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Registros rápidos"
        title={copy.title}
        description={copy.description}
        icon={<NotebookPen className="size-6" aria-hidden />}
      />

      {role !== "orientador" && (
        <PanelCard>
          <SectionTitle
            title={role === "estudiante" ? "Cuéntanos" : "Nuevo registro"}
            description={
              role === "docente"
                ? "Sirve para una nota de dos líneas en medio de la clase."
                : role === "padre"
                  ? "Llegará al docente y al equipo de apoyo."
                  : "Una frase basta."
            }
          />
          <QuickLogForm
            role={session.role}
            students={
              role === "docente"
                ? (teacherTargets?.students ?? [])
                : children.map((child) => ({ id: child.studentUserId, name: child.fullName }))
            }
            activities={teacherTargets?.activities ?? []}
          />
        </PanelCard>
      )}

      {role === "estudiante" && studentProfile && (
        <PanelCard>
          <SectionTitle
            title="Tu forma de aprender"
            description="Marca lo que te gusta. Puedes cambiarlo cuando quieras."
          />
          <div id="mi-forma-de-aprender">
            <PreferencesEditor initial={studentProfile.learningPreferences} />
          </div>
        </PanelCard>
      )}

      {role !== "estudiante" && <WorkedSummaryCard groups={groups} stated={stated} names={nameById} />}

      <section className="flex flex-col gap-3">
        <SectionTitle
          title={role === "estudiante" ? "Lo que has contado" : "Registros recientes"}
          description={
            role === "orientador"
              ? "Solo novedades y «lo que funcionó»."
              : "Lo más reciente primero."
          }
        />
        {entries.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title="Todavía no hay registros"
            description="Escribe el primero arriba: una frase basta."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{KIND_LABEL[entry.kind]}</Badge>
                  {entry.modality && <Badge variant="outline">{MODALITY_LABEL[entry.modality]}</Badge>}
                  {entry.outcome && <Badge variant="outline">{OUTCOME_LABEL[entry.outcome]}</Badge>}
                  {entry.source === "niky" && <Badge variant="outline">{SOURCE_LABEL.niky}</Badge>}
                  {entry.sharedWithGuardian && role === "docente" && (
                    <Badge variant="outline">Compartido con la familia</Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{shortDate(entry.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm">{entry.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {role !== "estudiante" && entry.studentName ? `${entry.studentName} · ` : ""}
                  {entry.activityTopic ? `${entry.activityTopic} · ` : ""}
                  {entry.courseName ? `${entry.courseName} · ` : ""}
                  Escribió {entry.authorRole === "padre" ? "la familia" : entry.authorRole === "estudiante" ? "el estudiante" : entry.authorName || "el docente"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
