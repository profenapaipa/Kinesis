import Link from "next/link";
import { ArrowUpRight, BellRing, Wrench, TrendingUp } from "lucide-react";
import { PanelCard, SectionTitle } from "@/components/panel/Panel";
import { shortDate } from "@/lib/classLogShared";
import type { RoleSummary, SummaryLine } from "@/lib/data/roleSummary";

// Resumen de «herramientas, resultados y novedades» de cada rol. Es el mismo
// componente en las cinco pantallas de inicio: lo que cambia es lo que
// `getRoleSummary` deja pasar para ese rol, no el componente.

function Column({
  icon: Icon,
  title,
  hint,
  lines,
}: {
  icon: typeof Wrench;
  title: string;
  hint: string;
  lines: SummaryLine[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-extrabold">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {lines.length === 0 && <li className="text-sm text-muted-foreground">Nada por ahora.</li>}
        {lines.map((line) => {
          const body = (
            <>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{line.label}</span>
                {line.hint && <span className="text-xs text-muted-foreground">{line.hint}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-lg font-black whitespace-nowrap text-primary tabular-nums">
                {line.value}
                {line.href && <ArrowUpRight className="size-4 opacity-60" aria-hidden />}
              </span>
            </>
          );
          return (
            <li key={line.label}>
              {line.href ? (
                <Link
                  href={line.href}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3 py-2.5">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RoleSummaryCard({
  summary,
  title = "Tu resumen",
  description = "Lo que usaste, lo que salió y lo que cambió, según lo que tu rol puede ver.",
}: {
  summary: RoleSummary;
  title?: string;
  description?: string;
}) {
  return (
    <PanelCard>
      <SectionTitle title={title} description={description} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Column icon={Wrench} title="Herramientas" hint="Lo que tienes a mano" lines={summary.tools} />
        <Column icon={TrendingUp} title="Resultados" hint="Lo que ha salido" lines={summary.results} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BellRing className="size-4" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-extrabold">Novedades</h3>
              <p className="text-xs text-muted-foreground">Lo último que cambió</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {summary.news.length === 0 && (
              <li className="text-sm text-muted-foreground">Todavía no hay novedades.</li>
            )}
            {summary.news.map((item, index) => (
              <li key={index} className="rounded-2xl bg-muted/50 px-3 py-2.5 text-sm">
                {item.href ? (
                  <Link href={item.href} className="outline-none hover:underline focus-visible:underline">
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
                <span className="mt-0.5 block text-xs text-muted-foreground">{shortDate(item.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelCard>
  );
}
