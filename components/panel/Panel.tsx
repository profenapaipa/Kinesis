import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/panel/CountUp";
import { cn } from "@/lib/utils";

// Piezas compartidas de los paneles. Siguen la referencia final de diseño
// (`referencias visuales/Referencia final diseño.html`): un encabezado en
// degradado que saluda, una "hoja" de tarjetas que se monta sobre él, las
// cifras como protagonistas y bloques con una sola acción clara. Viven aquí
// para que todas las pantallas se lean como el mismo producto.

// Encabezado de cada pantalla. El degradado sale del color principal que la
// persona elija en "Apariencia" (ver --hero en app/globals.css); el texto va
// en blanco sobre la mitad oscura, con contraste AA en todos los colores.
//
// Como en la referencia, el degradado ocupa todo el ancho de la columna y
// sube por detrás de la barra superior (components/AppShell.tsx, que se pone
// en blanco cuando detecta `.kn-hero`). Para medir ese ancho usa `100cqw`:
// la columna principal del shell es un contenedor (`@container`).
//
// - `footer`: lo que se monta sobre el borde inferior del degradado (las
//   cifras del panel, como el saldo de la referencia).
// - `compact`: para pantallas internas (listas, formularios), más bajo.
// - `back`: enlace para volver, arriba del título.
export function PanelHeader({
  eyebrow,
  title,
  description,
  aside,
  footer,
  back,
  icon,
  size = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  back?: { href: string; label: string };
  icon?: ReactNode;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";
  return (
    <div className="kn-hero relative isolate flex flex-col">
      <header
        className={cn(
          "relative text-white",
          compact ? "pt-2 pb-9 sm:pt-4 sm:pb-10" : "pt-4 pb-10 sm:pt-6 sm:pb-12",
          footer && "pb-20 sm:pb-20"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 bottom-0 left-1/2 -z-10 w-[100cqw] -translate-x-1/2 overflow-hidden rounded-b-[2.25rem] bg-hero"
        >
          <span className="kn-orb absolute -top-24 -right-16 size-72 rounded-full bg-white/8" />
          <span className="kn-orb absolute -bottom-20 -left-12 size-48 rounded-full bg-white/8 [animation-delay:-4s]" />
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            {back && (
              <Link
                href={back.href}
                className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white outline-none hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/60"
              >
                <ArrowLeft className="size-3.5" />
                {back.label}
              </Link>
            )}
            {eyebrow && (
              <span className="text-xs font-bold tracking-[0.14em] text-white/80 uppercase">
                {eyebrow}
              </span>
            )}
            <div className="flex items-center gap-3">
              {icon && (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                  {icon}
                </span>
              )}
              <h1
                className={cn(
                  "leading-tight font-black tracking-tight",
                  compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                )}
              >
                {title}
              </h1>
            </div>
            {description && <p className="text-white/85">{description}</p>}
          </div>
          {aside}
        </div>
      </header>

      {footer && <div className="relative z-10 -mt-12">{footer}</div>}
    </div>
  );
}

export interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

// Las cifras se leen de un vistazo: número grande en el color de acción,
// etiqueta corta y, si hace falta, una pista de qué significa.
const STAT_COLUMNS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-5 rounded-3xl bg-card px-5 py-5 shadow-card ring-1 ring-border sm:px-6",
        STAT_COLUMNS[items.length] ?? "sm:grid-cols-4"
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="order-2 text-sm font-semibold">{item.label}</dt>
          <dd className="order-1 text-3xl font-black tracking-tight text-primary tabular-nums sm:text-4xl">
            <CountUp value={item.value} />
          </dd>
          {item.hint && <dd className="order-3 text-xs text-muted-foreground">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

// Barra de avance (".pb" de la referencia). `value` de 0 a 100.
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 overflow-hidden rounded-full bg-muted"
    >
      <span className="kn-grow block h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </div>
  );
}

// Bloque con superficie propia: la unidad de los paneles.
export function PanelCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border sm:p-6",
        className
      )}
    >
      {children}
    </section>
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
// Va dentro del degradado del encabezado, por eso es una superficie sólida:
// se lee igual con cualquier color principal y en los dos modos.
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
      className="group flex w-full max-w-sm shrink-0 flex-col gap-2.5 rounded-3xl bg-card p-5 text-card-foreground shadow-xl shadow-black/15 transition-transform outline-none hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
        <Icon className="size-4" />
        Siguiente paso
      </span>
      <span className="text-lg leading-snug font-extrabold">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground">
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
        "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center",
        className
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="font-bold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
