import type { Metadata } from "next";
import { AdjustmentsView } from "@/components/AdjustmentsView";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Ajustes PIAR" };

// Sin actividad elegida: la vista abre la más reciente del docente.
export default async function AjustesPiarPage() {
  const session = await requireRole("docente");
  return <AdjustmentsView session={session} />;
}
