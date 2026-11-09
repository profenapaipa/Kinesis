import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { PanelHeader } from "@/components/panel/Panel";
import { Recorrido } from "@/components/tour/Recorrido";
import { requireSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/roles";
import { ROLES_RECORRIDO, type RolRecorrido } from "@/lib/tour/tipos";

export const metadata: Metadata = { title: "Recorrido guiado" };

// Recorrido guiado de Kinesis por rol (ver components/tour/Recorrido.tsx).
// Esta página no lee datos de estudiantes: solo necesita saber el rol para
// elegir los cinco casos. El estudiante usa Wisfox y no tiene recorrido aquí.
export default async function RecorridoPage() {
  const session = await requireSession();
  if (!(ROLES_RECORRIDO as readonly string[]).includes(session.role)) {
    redirect(ROLE_HOME[session.role]);
  }
  const rol = session.role as RolRecorrido;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        size="compact"
        eyebrow="Recorrido guiado"
        title="Conoce Kinesis eligiendo tu propio camino"
        description="Casos de ejemplo con Sinapso, Kinesis y Niky. Tú decides qué mirar."
        icon={<Compass className="size-6" aria-hidden />}
      />
      <Recorrido rol={rol} />
    </div>
  );
}
