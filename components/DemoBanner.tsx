"use client";

import { cn } from "@/lib/utils";

// Barra delgada visible únicamente en la demostración estática de GitHub Pages.
// En el build real `NEXT_PUBLIC_DEMO` no está definida, así que `IS_DEMO` queda
// inlineada como `false` y este componente se elimina del bundle.
//
// Antes era una cinta amarilla de dos líneas con un aviso largo. El equipo
// decidió aclarar de palabra que la muestra usa datos de ejemplo, así que aquí
// solo queda lo que sí hace falta en pantalla: el selector «Ver como». Nada de
// etiquetas de «simulado», ni pasos, ni guion.
//
// El selector de rol navega entre sub-sitios independientes (uno por rol, con
// su propio `basePath`), así que usa <a> y rutas absolutas a propósito:
// `next/link` les agregaría el `basePath` del sub-sitio actual y apuntaría
// dentro de sí mismo.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const CURRENT_ROLE = process.env.NEXT_PUBLIC_DEMO_ROLE;
const DEMO_ROOT = process.env.NEXT_PUBLIC_DEMO_ROOT ?? "/";

interface DemoRoleLink {
  role: string;
  label: string;
  path: string;
}

// La escribe scripts/build-demo.mjs, única fuente de verdad de los roles
// publicados y de la URL de entrada de cada uno.
function demoRoles(): DemoRoleLink[] {
  try {
    const raw = process.env.NEXT_PUBLIC_DEMO_ROLES;
    return raw ? (JSON.parse(raw) as DemoRoleLink[]) : [];
  } catch {
    return [];
  }
}

export function DemoBanner() {
  if (!IS_DEMO) return null;
  const roles = demoRoles();
  if (roles.length === 0) return null;

  return (
    <nav
      aria-label="Ver Kinesis como otro rol"
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground sm:px-6"
    >
      <span className="font-medium">Ver como:</span>
      {roles.map((item) => {
        const isCurrent = item.role === CURRENT_ROLE;
        return (
          <a
            key={item.role}
            href={`${DEMO_ROOT}${item.path}`}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "inline-flex min-h-7 items-center rounded-full px-2.5 font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
