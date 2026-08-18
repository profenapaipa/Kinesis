import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";

// Chequeo fino de servidor específico para /admin — proxy.ts ya bloquea el
// prefijo de ruta por rol, pero cada página vuelve a exigirlo (defensa en
// profundidad, no solo ocultar en la UI).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("administrador");
  return <>{children}</>;
}
