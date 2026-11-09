"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FOLLOW_HELP,
  FOLLOW_KINDS,
  FOLLOW_LABEL,
  FOLLOW_WARNING,
  MAX_FOLLOW_BODY,
  type FollowKind,
} from "@/lib/followUpShared";

// Seguimiento de UN estudiante: síntesis de las recomendaciones de orientación,
// acuerdos y seguimiento por periodo. Orientación y docente pueden agregar; la
// familia ve solo lo compartido. En la demostración estática lo que se escribe
// queda solo en esta pantalla y se dice.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export interface FollowNoteView {
  id: string;
  kind: FollowKind;
  body: string;
  authorRole: "orientador" | "docente";
  authorName: string;
  sharedWithGuardian: boolean;
  reviewDate: string | null;
  createdAt: string;
}

export interface FollowSummaryView {
  /** Cuántas actividades calificadas y su promedio (de lib/data/progress). */
  gradedCount: number;
  totalActivities: number;
  average: string;
  /** Líneas ya redactadas de «lo que ha funcionado», con fecha. */
  worked: string[];
}

function fmt(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" })
    .format(new Date(iso))
    .replace(".", "");
}

export function FollowUpCard({
  studentUserId,
  notes,
  summary,
  role,
}: {
  studentUserId: string;
  notes: FollowNoteView[];
  summary: FollowSummaryView | null;
  role: "orientador" | "docente" | "padre";
}) {
  const router = useRouter();
  const canWrite = role === "orientador" || role === "docente";
  const kinds = FOLLOW_KINDS.filter((kind) => kind !== "recomendacion" || role === "orientador");
  const [local, setLocal] = useState<FollowNoteView[]>([]);
  const [kind, setKind] = useState<FollowKind>(kinds[0]);
  const [body, setBody] = useState("");
  const [review, setReview] = useState("");
  const [share, setShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const all = [...local, ...notes];
  const recs = all.filter((note) => note.kind === "recomendacion");
  const rest = all.filter((note) => note.kind !== "recomendacion");
  const nextReview = all
    .map((note) => note.reviewDate)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (body.trim().length < 3) {
      setError("Escribe al menos una frase.");
      return;
    }
    setBusy(true);
    try {
      if (IS_DEMO) {
        setLocal((current) => [
          {
            id: `local-${current.length}`,
            kind,
            body: body.trim(),
            authorRole: role === "orientador" ? "orientador" : "docente",
            authorName: "Tú (demostración)",
            sharedWithGuardian: share,
            reviewDate: review || null,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      } else {
        const response = await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentUserId, kind, body, sharedWithGuardian: share, reviewDate: review || null }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "No se pudo guardar.");
          return;
        }
        router.refresh();
      }
      setBody("");
      setReview("");
      setShare(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {summary && role !== "padre" && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Actividades calificadas</dt>
            <dd className="text-2xl font-black text-primary tabular-nums">
              {summary.gradedCount}/{summary.totalActivities}
            </dd>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Promedio (1,0 a 5,0)</dt>
            <dd className="text-2xl font-black text-primary tabular-nums">{summary.average}</dd>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden /> Próxima revisión
            </dt>
            <dd className="text-lg font-bold">{nextReview ? fmt(nextReview) : "Sin fecha"}</dd>
          </div>
        </dl>
      )}

      <section aria-labelledby={`recs-${studentUserId}`}>
        <h3 id={`recs-${studentUserId}`} className="flex items-center gap-2 text-sm font-bold">
          <ClipboardCheck className="size-4 text-primary" aria-hidden />
          {role === "padre" ? "Recomendaciones para acompañar" : "Síntesis de recomendaciones de orientación"}
        </h3>
        {recs.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted-foreground">Aún no hay recomendaciones.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {recs.map((note) => (
              <li key={note.id} className="rounded-2xl bg-primary/5 p-3 text-sm ring-1 ring-primary/15">
                {note.body}
                <span className="mt-1 block text-xs text-muted-foreground">
                  {note.authorName} · {fmt(note.createdAt)}
                  {note.sharedWithGuardian && role !== "padre" ? " · compartida con la familia" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {summary && summary.worked.length > 0 && role !== "padre" && (
        <section>
          <h3 className="text-sm font-bold">Lo que ha funcionado (de la bitácora)</h3>
          <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
            {summary.worked.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-sm font-bold">{role === "padre" ? "Acuerdos y seguimiento" : "Seguimiento y acuerdos"}</h3>
        {rest.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted-foreground">Aún no hay notas de seguimiento.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {rest.map((note) => (
              <li key={note.id} className="rounded-2xl bg-muted/40 p-3 text-sm ring-1 ring-border">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{FOLLOW_LABEL[note.kind]}</Badge>
                  {note.reviewDate && <Badge variant="outline">Revisar: {fmt(note.reviewDate)}</Badge>}
                </div>
                <p className="mt-1.5">{note.body}</p>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {note.authorName} · {fmt(note.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canWrite && (
        <form onSubmit={submit} className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-sm font-bold">Agregar una nota</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de nota">
            {kinds.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={kind === option}
                onClick={() => setKind(option)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  kind === option ? "bg-primary text-primary-foreground ring-primary" : "bg-muted/60 ring-border hover:bg-muted"
                }`}
              >
                {FOLLOW_LABEL[option]}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {FOLLOW_HELP[kind]} {FOLLOW_WARNING}
          </p>
          <label className="sr-only" htmlFor={`fu-body-${studentUserId}`}>
            Nota
          </label>
          <textarea
            id={`fu-body-${studentUserId}`}
            value={body}
            maxLength={MAX_FOLLOW_BODY}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            className="min-h-20 rounded-xl border border-input bg-muted/60 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm">
              Próxima revisión
              <input
                type="date"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={share}
                onChange={(event) => setShare(event.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Compartir con la familia
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Guardando..." : "Guardar nota"}
            </Button>
            {error && (
              <span role="alert" className="text-sm text-destructive">
                {error}
              </span>
            )}
          </div>
          {IS_DEMO && (
            <p className="rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
              En la demostración las notas se ven aquí hasta que recargues; no se guardan.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
