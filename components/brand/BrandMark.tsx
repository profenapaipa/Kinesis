import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

// El logo de Kinesis: una "K" cuyo brazo superior sigue de largo como una
// trayectoria y termina en un punto, el estudiante que avanza. Cumple la
// prueba de logo del semillero (sesión del 9 y 10 de septiembre): una sola
// forma, dos colores, sin sombras, legible al tamaño de una uña.
//
// Los colores salen de los tokens del tema (--primary / --primary-foreground)
// para que el logo acompañe el modo claro y el oscuro sin una segunda versión.
// app/icon.svg repite el mismo trazo con colores fijos para la pestaña.

const BRAND_MARK = {
  stem: "M11 8v16",
  arm: "M11.5 17.5 18 11",
  leg: "M14 15l6.5 9",
  dot: { cx: 22.2, cy: 6.8, r: 2.4 },
} as const;

export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-9 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <g
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={BRAND_MARK.stem} />
        <path d={BRAND_MARK.arm} />
        <path d={BRAND_MARK.leg} />
      </g>
      <circle {...BRAND_MARK.dot} fill="var(--primary-foreground)" />
    </svg>
  );
}

// Logo + nombre (+ descriptor opcional). Para la barra lateral, el login y
// cualquier encabezado institucional.
export function BrandLockup({
  size = "md",
  withDescriptor = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withDescriptor?: boolean;
  className?: string;
}) {
  const markSize = { sm: "size-8", md: "size-9", lg: "size-14" }[size];
  const nameSize = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={markSize} />
      <span className="flex flex-col leading-tight">
        <span className={cn("font-black tracking-tight", nameSize)}>{BRAND.name}</span>
        {withDescriptor && (
          <span className="text-xs text-muted-foreground">{BRAND.shortDescriptor}</span>
        )}
      </span>
    </span>
  );
}
