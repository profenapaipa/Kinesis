"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

const NO_CHROME_ROUTES = ["/login"];

// /login no lleva la barra lateral/topbar de la app (todavía no hay sesión
// que mostrar ahí). El resto de rutas ya llegó aquí habiendo pasado el
// chequeo de proxy.ts, así que envolver en AppShell es seguro.
export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (NO_CHROME_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
