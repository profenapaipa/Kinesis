import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Piezas compartidas de los paneles de inicio (docente, administración, …).
// Responden a las referencias visuales de `referencias visuales/`: un
// titular grande que saluda, las cifras como protagonistas (sin una tarjeta
// por número) y bloques con una sola acción clara. Viven aquí para que todos
// los paneles se lean como el mismo producto.

export function PanelHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow && (
          <span className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl leading-tight font-black tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {aside}
    </header>
  );
}

export interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

// Las cifras se leen de un vistazo: número grande en el color de acción,
// etiqueta corta y, si hace falta, una pista de qué significa.
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-card px-5 py-5 ring-1 ring-foreground/10 sm:grid-cols-4 sm:px-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="order-2 text-sm font-semibold">{item.label}</dt>
          <dd className="order-1 text-3xl font-black tracking-tight text-primary tabular-nums sm:text-4xl">
            {item.value}
          </dd>
          {item.hint && <dd className="order-3 text-xs text-muted-foreground">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-extrabold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// Tarjeta de "siguiente paso": lo único que el panel le pide al usuario hoy.
export function NextStepCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20 transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase opacity-80">
        <Icon className="size-4" />
        Siguiente paso
      </span>
      <span className="text-lg leading-snug font-extrabold">{title}</span>
      <span className="text-sm opacity-90">{description}</span>
      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold">
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="font-bold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
