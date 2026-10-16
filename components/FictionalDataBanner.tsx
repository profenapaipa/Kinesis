import { FlaskConical } from "lucide-react";
import { IS_FICTIONAL_DATA } from "@/lib/dataMode";

// Cinta permanente de la app real mientras sus datos sean ficticios (ver
// lib/dataMode.ts). La demostración de GitHub Pages ya trae la suya
// (components/DemoBanner.tsx), así que allí esta no se muestra para no
// repetir el mismo aviso dos veces.
//
// A diferencia de la demostración, aquí los formularios sí guardan; por eso
// el aviso pide además no escribir información real.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export function FictionalDataBanner() {
  if (!IS_FICTIONAL_DATA || IS_DEMO) return null;

  return (
    <div
      role="note"
      className="border-b border-amber-500/30 bg-amber-50 px-4 py-2 text-amber-950 sm:px-6 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p className="flex items-start gap-2 text-xs leading-snug">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <strong className="font-semibold">Entorno de pruebas.</strong> Todos
          los estudiantes, diagnósticos, PIAR y planeaciones son{" "}
          <strong>datos ficticios</strong>. No escribas aquí información real de
          ningún estudiante ni familia.
        </span>
      </p>
    </div>
  );
}
