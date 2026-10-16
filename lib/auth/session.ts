import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { ROLE_HOME } from "@/lib/roles";
import type { Role } from "@/types";

const SESSION_COOKIE = "session_token";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 horas ~ una jornada escolar

export interface Session {
  userId: string;
  username: string;
  fullName: string;
  role: Role;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Crea la sesión en BD y deja la cookie httpOnly lista — para usar dentro de
// un Route Handler (POST /api/auth/login).
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

// Lectura pura — usable tanto en Server Components/Pages como en Route
// Handlers. Nunca lanza ni redirige; el llamador decide qué hacer con null.
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await db
    .select({
      userId: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .get();

  if (!row || !row.isActive) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) return null;

  return { userId: row.userId, username: row.username, fullName: row.fullName, role: row.role };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

// Para Server Components/Pages: exige sesión, redirige a /login si no hay.
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// Para Server Components/Pages: exige sesión Y uno de los roles dados. Fuera
// del rol se vuelve al panel propio, no a "/": "/" es el panel docente y
// exige ese rol, así que mandar ahí a un estudiante sería un bucle.
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect(ROLE_HOME[session.role]);
  return session;
}
