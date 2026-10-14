// Reemplazo de `lib/auth/session.ts` EXCLUSIVO para el build de la
// demostración estática (`scripts/build-demo.mjs` lo copia encima dentro del
// árbol desechable `.demo-build/`, nunca en el árbol real).
//
// Por qué existe: GitHub Pages solo sirve archivos estáticos, y el export
// estático de Next no admite `cookies()` (ver
// `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`, sección
// "Unsupported Features"). No hay sesión real que leer: el rol se fija en
// tiempo de compilación con `DEMO_ROLE` y se resuelve contra el usuario de
// demostración que siembra `db/seed.ts` sobre una base de datos ficticia,
// recreada desde cero para cada build.
//
// Esto NO relaja el modelo de permisos: `lib/data/*` y `lib/permissions.ts`
// se usan tal cual, sin modificar. La sesión de demostración entra por la
// misma puerta que una real, así que `canViewDiagnosis()` sigue decidiendo
// quién ve `clinical_info` — y lo que se publica es ficción sembrada, nunca
// datos de estudiantes reales.

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { guardianStudents, pedagogicalProfiles, users } from "@/db/schema";
import type { Role } from "@/types";

const ROLES: readonly Role[] = [
  "docente",
  "administrador",
  "estudiante",
  "padre",
  "orientador",
];

// Mismos usuarios que imprime `db/seed.ts` al terminar. `estudiante` no está
// aquí porque su usuario se deriva del nombre del estudiante sembrado: se
// resuelve consultando la BD, más abajo.
const USERNAME_BY_ROLE: Partial<Record<Role, string>> = {
  docente: "docente",
  administrador: "admin",
  padre: "padre.demo",
  orientador: "orientador.demo",
};

export interface Session {
  userId: string;
  username: string;
  fullName: string;
  role: Role;
}

function demoRole(): Role {
  const value = process.env.DEMO_ROLE;
  if (!value || !ROLES.includes(value as Role)) {
    throw new Error(
      `DEMO_ROLE debe ser uno de: ${ROLES.join(", ")} (recibido: ${value ?? "vacío"}).`
    );
  }
  return value as Role;
}

// El estudiante de la demostración es el hijo vinculado a `padre.demo`, para
// que el panel del acudiente y el del estudiante hablen de la misma persona.
// Si el vínculo no existe, cae al primer estudiante con PIAR y, en último
// caso, a cualquier estudiante.
async function resolveDemoStudent() {
  const guardian = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, "padre.demo"))
    .get();

  if (guardian) {
    const link = await db
      .select({ studentUserId: guardianStudents.studentUserId })
      .from(guardianStudents)
      .where(eq(guardianStudents.guardianUserId, guardian.id))
      .get();
    if (link) {
      const child = await db
        .select()
        .from(users)
        .where(eq(users.id, link.studentUserId))
        .get();
      if (child) return child;
    }
  }

  const withPiar = await db
    .select()
    .from(users)
    .innerJoin(pedagogicalProfiles, eq(pedagogicalProfiles.studentUserId, users.id))
    .get();
  if (withPiar) return withPiar.users;

  return db.select().from(users).where(eq(users.role, "estudiante")).get();
}

async function resolveDemoSession(): Promise<Session> {
  const role = demoRole();
  const username = USERNAME_BY_ROLE[role];

  const user = username
    ? await db.select().from(users).where(eq(users.username, username)).get()
    : await resolveDemoStudent();

  if (!user) {
    throw new Error(
      `No se encontró el usuario de demostración para el rol "${role}". ` +
        `¿Se corrió db/seed.ts sobre la base de datos de la demostración?`
    );
  }

  return {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
}

// Se resuelve una sola vez por build: todas las páginas se prerenderizan en
// el mismo proceso de Node.
let cached: Promise<Session> | undefined;

export async function getSession(): Promise<Session | null> {
  cached ??= resolveDemoSession();
  return cached;
}

export async function requireSession(): Promise<Session> {
  cached ??= resolveDemoSession();
  return cached;
}

// En el build real esto redirige; aquí no hay request que redirigir, así que
// una pantalla fuera del rol se vuelve un 404 estático. `build-demo.mjs` solo
// copia las rutas que el rol sí puede ver, así que esto es una red de
// seguridad, no el camino normal.
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.role)) notFound();
  return session;
}
