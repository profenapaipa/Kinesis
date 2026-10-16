import type { Role } from "@/types";

// Panel de entrada y nombre visible de cada rol. Antes estaban copiados en
// proxy.ts, components/AppShell.tsx, app/login/page.tsx y
// app/admin/usuarios/page.tsx; una copia desincronizada manda a alguien a una
// pantalla que no es la suya. Esto NO decide permisos (eso es
// lib/permissions.ts): solo a dónde se llega y cómo se nombra el rol.

export const ROLE_HOME: Record<Role, string> = {
  docente: "/",
  administrador: "/admin",
  estudiante: "/estudiante",
  padre: "/padre",
  orientador: "/orientacion",
};

export const ROLE_LABEL: Record<Role, string> = {
  docente: "Profesor",
  administrador: "Administrador",
  estudiante: "Estudiante",
  padre: "Padre / Madre",
  orientador: "Orientador/a",
};
