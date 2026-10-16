import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdjustmentsView } from "@/components/AdjustmentsView";
import { requireRole } from "@/lib/auth/session";
import { listMyActivities } from "@/lib/data/activities";

export const metadata: Metadata = { title: "Ajustes PIAR" };

interface PageProps {
  params: Promise<{ activityId: string }>;
}

// Un id que no es una actividad propia da 404, igual que un estudiante ajeno
// en app/estudiantes/[studentId]: no se distingue "no existe" de "no es tuya".
export default async function AjustesPiarActivityPage({ params }: PageProps) {
  const { activityId } = await params;
  const session = await requireRole("docente");
  const options = await listMyActivities(session);
  if (!options.some((option) => option.id === activityId)) notFound();
  return <AdjustmentsView session={session} activityId={activityId} />;
}
