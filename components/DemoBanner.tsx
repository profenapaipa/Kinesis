"use client";

import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

// Cinta visible únicamente en la demostración estática de GitHub Pages. En el
// build real `NEXT_PUBLIC_DEMO` no está definida, así que `IS_DEMO` queda
// inlineada como `false` y este componente se elimina del bundle.
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

// La escribe scripts/build-demo.mjs — única fuente de verdad de los roles
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

  return (
    <div className="flex flex-col gap-2 border-b border-amber-500/30 bg-amber-50 px-4 py-2 text-amber-950 sm:px-6 md:flex-row md:items-center md:justify-between dark:bg-amber-950/40 dark:text-amber-100">
      <p className="flex items-start gap-2 text-xs leading-snug">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <strong className="font-semibold">Demostración.</strong> Estudiantes,
          diagnósticos y planeaciones son <strong>datos ficticios</strong>. No
          se guarda nada: los formularios y botones de guardar no funcionan
          aquí.
        </span>
      </p>

      {roles.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium">Ver como:</span>
          {roles.map((item) => {
            const isCurrent = item.role === CURRENT_ROLE;
            return (
              <a
                key={item.role}
                href={`${DEMO_ROOT}${item.path}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  isCurrent
                    ? "bg-amber-600 text-white"
                    : "bg-amber-500/15 hover:bg-amber-500/30"
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
