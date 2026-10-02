import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import type { Role } from "@/types";

// Reemplaza a middleware.ts (renombrado a proxy.ts desde Next.js 16). Chequeo
// grueso únicamente: ¿hay una sesión válida? ¿el prefijo de la ruta exige un
// rol que la sesión no tiene? El control fino por recurso (diagnóstico, PIAR
// completo, etc.) vive en lib/permissions.ts + lib/data/*, nunca aquí.

const SESSION_COOKIE = "session_token";
const LOGIN_PATH = "/login";

const ROLE_PREFIXES: Array<{ prefix: string; role: Role }> = [
  { prefix: "/admin", role: "administrador" },
];

const ROLE_HOME: Record<Role, string> = {
  docente: "/",
  administrador: "/admin",
  estudiante: "/estudiante",
  padre: "/padre",
  orientador: "/estudiantes",
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function lookupSessionRole(token: string): Promise<Role | null> {
  const row = await db
    .select({
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
  return row.role;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const role = token ? await lookupSessionRole(token) : null;

  if (pathname === LOGIN_PATH) {
    // Ya autenticado y visitando /login: llévalo directo a su panel.
    if (role) return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const roleRule = ROLE_PREFIXES.find((rule) => pathname.startsWith(rule.prefix));
  if (roleRule && role !== roleRule.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
