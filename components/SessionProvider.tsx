"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Session } from "@/lib/auth/session";

const SessionContext = createContext<Session | null>(null);

// La sesión se resuelve una sola vez en el servidor (app/layout.tsx llama a
// getSession()) y se pasa aquí como prop — sin localStorage, sin
// useSyncExternalStore: es la fuente de verdad real, verificada en backend.
export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): { session: Session } {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession() se usó fuera de una sesión autenticada.");
  }
  return { session };
}
