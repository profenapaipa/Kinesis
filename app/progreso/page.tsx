import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { ProgressBoard } from "@/components/progress/ProgressBoard";
import { PanelHeader, StatStrip } from "@/components/panel/Panel";
import { requireRole } from "@/lib/auth/session";
import { listProgress } from "@/lib/data/progress";
import { formatScore } from "@/lib/progressShared";

export const metadata: Metadata = { title: "Progreso" };

// Progreso y notas por actividad. Una sola pantalla para tres roles: el docente
// califica; el estudiante y la familia leen lo suyo (lib/data/progress.ts ya lo
// recorta). Wisfox aporta la evidencia; la nota es del docente.

const COPY = {
  docente: { title: "Progreso y notas", description: "El avance de tu curso en cada actividad. Califica aquí mismo y deja un comentario." },
  estudiante: { title: "Mi progreso", description: "Cómo vas en cada actividad, con la nota y el comentario de tu docente." },
  padre: { title: "Progreso", description: "Cómo va tu hija o hijo en cada actividad, con la nota y el comentario del docente." },
} as const;

export default async function ProgresoPage() {
  const session = await requireRole("docente", "estudiante", "padre");
  const role = session.role as keyof typeof COPY;
  const rows = await listProgress(session);

  const graded = rows.filter((row) => row.score !== null);
  const avg = graded.length ? graded.reduce((sum, row) => sum + (row.score ?? 0), 0) / graded.length : null;
  const waiting = rows.filter((row) => row.status === "entregada").length;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Seguimiento"
        title={COPY[role].title}
        description={COPY[role].description}
        icon={<LineChart className="size-6" aria-hidden />}
        footer={
          <StatStrip
            items={[
              { label: "Calificadas", value: `${graded.length}/${rows.length}`, hint: "Con nota del docente" },
              { label: "Por calificar", value: waiting, hint: "Entregadas sin nota" },
              { label: "Promedio", value: formatScore(avg), hint: "Escala de 1,0 a 5,0" },
            ]}
          />
        }
      />
      <ProgressBoard rows={rows} canGrade={role === "docente"} />
    </div>
  );
}
