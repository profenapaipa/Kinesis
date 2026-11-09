"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Lightbulb, ListChecks, MessageCircleQuestion, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callNiky } from "@/lib/nikyBridge";
import type { InsightAction, InsightKind, NikyInsights as NikyInsightsData, QuickAnswer } from "@/lib/data/nikyInsights";
import { cn } from "@/lib/utils";

// Panel «Niky sugiere» del inicio de cada rol.
//
// Lo que ve la persona sale de `getNikyInsights` (lib/data/nikyInsights.ts):
// cuentas y reglas sobre lo registrado en Kinesis cuando se abre la pantalla.
// Por eso el panel dice lo que es: NO afirma que Niky esté generando algo en
// vivo. La conversación sí es de Niky y vive en la plataforma Sinapsis: los
// botones solo le avisan con `callNiky`; si Kinesis está abierto solo, se dice
// con claridad en vez de fingir una respuesta (misma regla que NikyButton).
//
// Nada de lo que hay aquí modifica datos. Las acciones son enlaces a la pantalla
// donde se actúa o un aviso a Niky.

const KIND: Record<InsightKind, { label: string; icon: typeof Lightbulb; badge: string }> = {
  alerta: { label: "Alerta", icon: AlertTriangle, badge: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
  sugerencia: { label: "Sugerencia", icon: Lightbulb, badge: "bg-primary/10 text-primary" },
  resumen: { label: "Resumen", icon: ListChecks, badge: "bg-muted text-foreground" },
};

const GENERAL_QUESTION: Record<string, string> = {
  docente: "¿Qué debería mirar hoy en mis actividades y mi bitácora?",
  orientador: "¿Qué debería revisar hoy en los perfiles y la bitácora?",
  administrador: "¿Qué debería cargar o revisar hoy en los documentos?",
  padre: "¿Cómo puedo acompañar desde casa esta semana?",
  estudiante: "¿Por dónde empiezo hoy?",
};

const LINK_CLASS =
  "inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50";

export function NikyInsights({ data }: { data: NikyInsightsData }) {
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const open = data.quick.find((quick) => quick.id === openId) ?? null;

  function ask(task: InsightAction["task"], context: string) {
    const sent = callNiky(task, context);
    setNote(
      sent
        ? "Niky abrió la conversación en la plataforma."
        : "Niky vive en la plataforma Sinapsis. Ábrela desde allí para conversar con ella."
    );
  }

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="flex min-w-0 flex-col gap-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={`${uid}-title`} className="text-lg font-extrabold">
              Niky sugiere
            </h2>
            <p className="text-sm font-semibold">Niky propone; quien enseña decide.</p>
            <p className="text-xs text-muted-foreground">
              Sale de lo que ya está registrado en Kinesis al abrir esta pantalla. No cambia nada por sí solo.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => ask("explicar", GENERAL_QUESTION[data.role] ?? GENERAL_QUESTION.docente)}
        >
          <MessageCircleQuestion className="size-4" aria-hidden />
          Pregúntale a Niky
        </Button>
      </div>

      <ul className="flex flex-col gap-2.5">
        {data.items.map((item) => {
          const kind = KIND[item.kind];
          const Icon = kind.icon;
          return (
            <li key={item.id} className="flex min-w-0 flex-col gap-2 rounded-2xl bg-muted/50 p-3">
              <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", kind.badge)}>
                <Icon className="size-3.5" aria-hidden />
                {kind.label}
              </span>
              <p className="text-sm leading-relaxed break-words">{item.text}</p>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                <Link href={item.href} className={LINK_CLASS}>
                  {item.hrefLabel}
                  <ArrowUpRight className="size-4 opacity-70" aria-hidden />
                </Link>
                {item.action && (
                  <button
                    type="button"
                    onClick={() => ask(item.action!.task, item.action!.context)}
                    className={cn(LINK_CLASS, "text-foreground hover:bg-muted")}
                  >
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    {item.action.label}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-extrabold">Preguntas rápidas</h3>
        <div role="group" aria-label="Preguntas rápidas" className="flex flex-wrap gap-2">
          {data.quick.map((quick) => {
            const active = quick.id === openId;
            return (
              <button
                key={quick.id}
                type="button"
                aria-expanded={active}
                aria-controls={`${uid}-answer`}
                onClick={() => setOpenId(active ? null : quick.id)}
                className={cn(
                  "min-h-9 max-w-full rounded-full px-3.5 py-1.5 text-left text-sm font-semibold ring-1 ring-border outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "bg-primary text-primary-foreground ring-primary" : "bg-card hover:bg-muted"
                )}
              >
                {quick.question}
              </button>
            );
          })}
        </div>
        <div id={`${uid}-answer`} aria-live="polite">
          {open && <Answer quick={open} onAsk={() => ask("explicar", open.question)} />}
        </div>
      </div>

      {data.templates.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-extrabold">
              <PlusCircle className="size-4 text-primary" aria-hidden />
              Preparar una actividad nueva
            </h3>
            <p className="text-xs text-muted-foreground">
              Parte de una actividad con DUA completo: duplica el tema y cambia la fecha. Tú revisas y guardas.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {data.templates.map((template) => (
              <li key={template.id} className="min-w-0">
                <Link
                  href={template.href}
                  className="flex h-full min-w-0 flex-col gap-1 rounded-2xl bg-muted/50 p-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="text-xs font-bold text-primary">{template.subjectName}</span>
                  <span className="text-sm font-semibold break-words">{template.topic}</span>
                  <span className="text-xs text-muted-foreground">{template.why}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    Usar como base
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {note && (
        <p role="status" className="text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </section>
  );
}

// La respuesta ya calculada de una pregunta rápida. Es real (sale de la base);
// lo que se le ofrece a Niky es la misma pregunta, para conversarla.
function Answer({ quick, onAsk }: { quick: QuickAnswer; onAsk: () => void }) {
  return (
    <div className="mt-1 flex min-w-0 flex-col gap-3 rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/15">
      <p className="text-sm font-semibold">{quick.summary}</p>
      {quick.table && (
        // El contenedor desplaza la tabla por dentro si no cabe: nunca agranda la página en pantallas de 320 px.
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-0 text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-muted-foreground">
                {quick.table.head.map((cell) => (
                  <th key={cell} scope="col" className="px-2 py-1.5 font-bold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quick.table.rows.map((row, index) => (
                <tr key={index} className="border-t border-border/70">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={cn("px-2 py-1.5 align-top break-words", cellIndex > 0 && "tabular-nums")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {quick.lines && quick.lines.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          {quick.lines.map((line, index) => (
            <li key={index} className="break-words">
              {line}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-1">
        {quick.href && (
          <Link href={quick.href} className={LINK_CLASS}>
            {quick.hrefLabel ?? "Abrir"}
            <ArrowUpRight className="size-4 opacity-70" aria-hidden />
          </Link>
        )}
        <button type="button" onClick={onAsk} className={cn(LINK_CLASS, "text-foreground hover:bg-muted")}>
          <Sparkles className="size-4 text-primary" aria-hidden />
          Enviar esta pregunta a Niky
        </button>
      </div>
    </div>
  );
}
