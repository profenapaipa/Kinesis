"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  KIND_HELP,
  KIND_LABEL,
  LOG_KINDS,
  LOG_MODALITIES,
  LOG_OUTCOMES,
  MAX_BODY_LENGTH,
  MODALITY_LABEL,
  NO_NAMES_WARNING,
  OUTCOME_LABEL,
  suggestFromText,
  type LogKind,
  type LogModality,
  type LogOutcome,
} from "@/lib/classLogShared";
import type { Role } from "@/types";

// Registro rápido. Se escribe a mano o se pide a Niky que ordene la nota; en
// los dos casos la persona confirma antes de guardar: Niky propone, no decide.
//
// Dos modos:
//  - App real: guarda con POST /api/bitacora y refresca la lista.
//  - Demostración estática (NEXT_PUBLIC_DEMO=1): no hay servidor, así que el
//    registro queda SOLO en esta pantalla, rotulado como tal, para poder
//    mostrar el flujo completo en una presentación.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

// Contrato con la plataforma Sinapsis (Niky es la única IA): la plataforma que
// envuelve a Kinesis en un iframe escucha este mensaje. Si Kinesis se abre
// solo, no pasa nada y se usa la sugerencia local de abajo.
const PLATFORM_ORIGIN = "https://profenapaipa.github.io";

interface Option {
  id: string;
  name: string;
}

interface LocalEntry {
  text: string;
  kind: LogKind;
  modality: LogModality | null;
  outcome: LogOutcome | null;
  who: string | null;
  viaNiky: boolean;
}

const fieldClass =
  "h-10 rounded-xl border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function QuickLogForm({
  role,
  students = [],
  activities = [],
}: {
  role: Role;
  /** Docente: sus estudiantes. Padre: sus hijos. Estudiante: vacío. */
  students?: Option[];
  activities?: Option[];
}) {
  const router = useRouter();
  const kinds: LogKind[] =
    role === "docente" ? [...LOG_KINDS] : role === "padre" ? ["novedad", "lo_que_funciono"] : ["lo_que_funciono"];

  const [kind, setKind] = useState<LogKind>(kinds.includes("lo_que_funciono") ? "lo_que_funciono" : kinds[0]);
  const [body, setBody] = useState("");
  const [studentUserId, setStudentUserId] = useState(role === "padre" ? (students[0]?.id ?? "") : "");
  const [activityId, setActivityId] = useState("");
  const [modality, setModality] = useState<LogModality | "">("");
  const [outcome, setOutcome] = useState<LogOutcome | "">("");
  const [share, setShare] = useState(false);
  const [viaNiky, setViaNiky] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);

  const showsResult = kind === "lo_que_funciono";

  function askNiky() {
    setError(null);
    if (body.trim().length < 3) {
      setHint("Escribe primero tu nota, aunque sea desordenada, y Niky la ordena.");
      return;
    }
    // Con la plataforma: se le pide a Niky que abra el panel con la tarea.
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        {
          tipo: "niky:abrir",
          portal: "kinesis",
          tarea: "ordenar-nota-bitacora",
          contexto: { rol: role, pantalla: "bitacora", borrador: body.trim().slice(0, MAX_BODY_LENGTH) },
        },
        PLATFORM_ORIGIN
      );
    }
    // Sin modelo conectado: reglas de palabras. Se dice en pantalla.
    const suggestion = suggestFromText(body);
    if (suggestion.kind && kinds.includes(suggestion.kind)) setKind(suggestion.kind);
    if (suggestion.modality) setModality(suggestion.modality);
    if (suggestion.outcome) setOutcome(suggestion.outcome);
    setViaNiky(true);
    setHint(
      suggestion.modality || suggestion.outcome
        ? "Niky propone: revisa el tipo de actividad y el resultado, cámbialos si no es así, y guarda."
        : "Niky no encontró tipo de actividad ni resultado en tu nota. Puedes elegirlos tú."
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (body.trim().length < 3) {
      setError("Escribe al menos una frase.");
      return;
    }
    if (role === "padre" && !studentUserId) {
      setError("Elige a quién se refiere.");
      return;
    }
    setBusy(true);
    try {
      if (IS_DEMO) {
        setLocalEntries((current) => [
          {
            text: body.trim(),
            kind,
            modality: showsResult && modality ? modality : null,
            outcome: showsResult && outcome ? outcome : null,
            who: students.find((student) => student.id === studentUserId)?.name ?? null,
            viaNiky,
          },
          ...current,
        ]);
      } else {
        const response = await fetch("/api/bitacora", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            body,
            studentUserId: studentUserId || null,
            activityId: activityId || null,
            modality: showsResult && modality ? modality : null,
            outcome: showsResult && outcome ? outcome : null,
            sharedWithGuardian: share,
            source: viaNiky ? "niky" : "manual",
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "No se pudo guardar el registro.");
          return;
        }
        router.refresh();
      }
      setBody("");
      setModality("");
      setOutcome("");
      setShare(false);
      setViaNiky(false);
      setHint(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {kinds.length > 1 && (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium">¿Qué quieres registrar?</legend>
            <div className="flex flex-wrap gap-2">
              {kinds.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  aria-pressed={kind === option}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    kind === option
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-muted/60 text-foreground ring-border hover:bg-muted"
                  }`}
                >
                  {KIND_LABEL[option]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{KIND_HELP[kind]}</p>
          </fieldset>
        )}

        {students.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="logStudent">
              {role === "padre" ? "¿De quién?" : "¿De qué estudiante? (opcional)"}
            </label>
            <select
              id="logStudent"
              value={studentUserId}
              onChange={(event) => setStudentUserId(event.target.value)}
              className={fieldClass}
            >
              {role !== "padre" && <option value="">Toda la clase</option>}
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {role === "docente" && activities.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="logActivity">
              Actividad (opcional)
            </label>
            <select
              id="logActivity"
              value={activityId}
              onChange={(event) => setActivityId(event.target.value)}
              className={fieldClass}
            >
              <option value="">Ninguna en particular</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="logBody">
            {role === "estudiante" ? "¿Qué te ayudó hoy?" : "¿Qué pasó?"}
          </label>
          <textarea
            id="logBody"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={MAX_BODY_LENGTH}
            rows={3}
            aria-describedby="logHint"
            placeholder={
              role === "estudiante"
                ? "Ej.: con las tarjetas de imágenes entendí mejor los pasos."
                : "Ej.: con una tarjeta por paso terminó la tarea; no se le pidió leer al curso."
            }
            className="min-h-24 rounded-xl border border-input bg-muted/60 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p id="logHint" className="text-xs text-muted-foreground">
            {NO_NAMES_WARNING}
          </p>
        </div>

        {showsResult && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="logModality">
                Tipo de actividad
              </label>
              <select
                id="logModality"
                value={modality}
                onChange={(event) => setModality(event.target.value as LogModality | "")}
                className={fieldClass}
              >
                <option value="">Sin indicar</option>
                {LOG_MODALITIES.map((option) => (
                  <option key={option} value={option}>
                    {MODALITY_LABEL[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="logOutcome">
                ¿Cómo salió?
              </label>
              <select
                id="logOutcome"
                value={outcome}
                onChange={(event) => setOutcome(event.target.value as LogOutcome | "")}
                className={fieldClass}
              >
                <option value="">Sin indicar</option>
                {LOG_OUTCOMES.map((option) => (
                  <option key={option} value={option}>
                    {OUTCOME_LABEL[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === "docente" && kind !== "observacion" && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={share}
              onChange={(event) => setShare(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span>Compartir este registro con la familia del estudiante</span>
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando..." : "Guardar registro"}
          </Button>
          <Button type="button" variant="outline" onClick={askNiky}>
            <Sparkles className="size-4" aria-hidden />
            Ordenar con Niky
          </Button>
        </div>
        {hint && (
          <p role="status" className="rounded-xl bg-primary/10 px-3 py-2 text-sm">
            {hint}{" "}
            <span className="text-xs text-muted-foreground">
              (Sugerencia de ejemplo por palabras clave: Niky todavía no está conectada a este botón.)
            </span>
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      {IS_DEMO && (
        <p className="rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
          En la demostración los registros no se guardan: se ven aquí hasta que recargues la página. En la
          aplicación real quedan en la bitácora.
        </p>
      )}
      {localEntries.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Registros de esta sesión de demostración">
          {localEntries.map((entry, index) => (
            <li key={index} className="rounded-2xl bg-primary/5 px-4 py-3 text-sm ring-1 ring-primary/20">
              <p className="font-semibold">
                {KIND_LABEL[entry.kind]}
                {entry.who ? ` · ${entry.who}` : ""}
                {entry.viaNiky ? " · ordenado con Niky" : ""}
              </p>
              <p>{entry.text}</p>
              {(entry.modality || entry.outcome) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.modality ? MODALITY_LABEL[entry.modality] : ""}
                  {entry.modality && entry.outcome ? " · " : ""}
                  {entry.outcome ? OUTCOME_LABEL[entry.outcome] : ""} · Registro de demostración
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
