"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatScore,
  MAX_FEEDBACK,
  SCORE_MAX,
  SCORE_MIN,
  STATUS_TEXT,
  type ProgressStatus,
} from "@/lib/progressShared";

// Progreso por actividad. El docente califica aquí mismo; el estudiante y la
// familia solo leen. En la demostración estática no hay dónde guardar: la nota
// queda SOLO en esta pantalla (y lo dice). La "evidencia" (p. ej. un quiz de
// Wisfox) respalda el avance pero no es la nota.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export interface BoardRow {
  activityId: string;
  topic: string;
  courseName: string;
  studentUserId: string;
  studentName: string;
  status: ProgressStatus;
  evidence: string | null;
  score: number | null;
  feedback: string | null;
}

const STATUS_STYLE: Record<ProgressStatus, string> = {
  sin_empezar: "bg-muted text-muted-foreground",
  en_curso: "bg-amber-100 text-amber-900",
  entregada: "bg-sky-100 text-sky-900",
  calificada: "bg-primary/15 text-primary",
};

function GradeForm({
  row,
  onSaved,
  onCancel,
}: {
  row: BoardRow;
  onSaved: (patch: Partial<BoardRow>) => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [score, setScore] = useState(row.score === null ? "" : String(row.score).replace(".", ","));
  const [feedback, setFeedback] = useState(row.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError(null);
    const parsed = score.trim() === "" ? null : Number(score.replace(",", "."));
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < SCORE_MIN || parsed > SCORE_MAX)) {
      setError("La nota debe estar entre 1,0 y 5,0.");
      return;
    }
    const patch: Partial<BoardRow> = {
      score: parsed,
      feedback: feedback.trim() || null,
      status: parsed === null ? "entregada" : "calificada",
    };
    setBusy(true);
    try {
      if (!IS_DEMO) {
        const response = await fetch("/api/progreso", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityId: row.activityId,
            studentUserId: row.studentUserId,
            score: parsed,
            feedback,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "No se pudo guardar.");
          return;
        }
        router.refresh();
      }
      onSaved(patch);
    } finally {
      setBusy(false);
    }
  }

  const id = `${row.activityId}-${row.studentUserId}`;
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr]">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={`score-${id}`}>
            Nota (1,0 a 5,0)
          </label>
          <input
            id={`score-${id}`}
            inputMode="decimal"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="4,2"
            className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={`fb-${id}`}>
            Comentario para el estudiante
          </label>
          <input
            id={`fb-${id}`}
            value={feedback}
            maxLength={MAX_FEEDBACK}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Qué hizo bien y qué sigue"
            className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        La escala es la del sistema institucional. Los ajustes del PIAR cambian el tiempo o el formato, no
        la escala ni lo que se evalúa. Deja la nota vacía para marcar solo «entregada».
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={save} disabled={busy}>
          {busy ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {error && (
          <span role="alert" className="text-sm text-destructive">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProgressBoard({ rows, canGrade }: { rows: BoardRow[]; canGrade: boolean }) {
  const [local, setLocal] = useState<Record<string, Partial<BoardRow>>>({});
  const [editing, setEditing] = useState<string | null>(null);
  // Por defecto solo se ven quienes ya tienen avance; el resto se abre con un botón.
  // Así la pantalla del docente no es una lista de diez filas vacías por actividad.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const merged = rows.map((row) => ({ ...row, ...(local[`${row.activityId}|${row.studentUserId}`] ?? {}) }));
  const activities = [...new Map(merged.map((row) => [row.activityId, row.topic])).entries()];

  return (
    <div className="flex flex-col gap-5">
      {IS_DEMO && canGrade && (
        <p className="rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
          En la demostración las notas que escribas se ven aquí hasta que recargues la página; no se
          guardan. En la aplicación real quedan registradas.
        </p>
      )}
      {activities.map(([activityId, topic]) => {
        const list = merged.filter((row) => row.activityId === activityId);
        const active = list.filter((row) => row.status !== "sin_empezar" || editing === `${row.activityId}|${row.studentUserId}`);
        const shown = expanded[activityId] || active.length === 0 ? list : active;
        const hidden = list.length - shown.length;
        const graded = list.filter((row) => row.score !== null);
        const avg = graded.length ? graded.reduce((sum, row) => sum + (row.score ?? 0), 0) / graded.length : null;
        return (
          <section key={activityId} className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-extrabold">{topic}</h3>
              <p className="text-sm text-muted-foreground">
                {graded.length} de {list.length} calificadas
                {avg !== null && canGrade ? ` · promedio ${formatScore(avg)}` : ""}
              </p>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {shown.map((row) => {
                const key = `${row.activityId}|${row.studentUserId}`;
                const open = editing === key;
                return (
                  <li key={key} className="rounded-2xl bg-muted/40 p-3 ring-1 ring-border">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="min-w-0 flex-1 font-semibold">{row.studentName}</span>
                      <Badge className={STATUS_STYLE[row.status]} variant="secondary">
                        {STATUS_TEXT[row.status]}
                      </Badge>
                      <span className="w-12 text-right text-lg font-black text-primary tabular-nums">
                        {formatScore(row.score)}
                      </span>
                      {canGrade && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-expanded={open}
                          onClick={() => setEditing(open ? null : key)}
                        >
                          {row.score === null ? "Calificar" : "Editar"}
                        </Button>
                      )}
                    </div>
                    {(row.evidence || row.feedback) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.evidence ? `Evidencia: ${row.evidence}` : ""}
                        {row.evidence && row.feedback ? " · " : ""}
                        {row.feedback ? `Comentario: ${row.feedback}` : ""}
                      </p>
                    )}
                    {open && (
                      <GradeForm
                        row={row}
                        onCancel={() => setEditing(null)}
                        onSaved={(patch) => {
                          setLocal((current) => ({ ...current, [key]: patch }));
                          setEditing(null);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            {(hidden > 0 || expanded[activityId]) && list.length > active.length && active.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                aria-expanded={Boolean(expanded[activityId])}
                onClick={() => setExpanded((current) => ({ ...current, [activityId]: !current[activityId] }))}
              >
                {expanded[activityId] ? "Ver solo con avance" : `Ver los ${hidden} que no han empezado`}
              </Button>
            )}
          </section>
        );
      })}
      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay actividades con progreso.</p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5" aria-hidden /> La evidencia (por ejemplo, un quiz de Wisfox) respalda el
        avance; la nota la pone el docente.
      </p>
    </div>
  );
}
