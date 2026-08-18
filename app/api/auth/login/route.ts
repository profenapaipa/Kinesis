import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { findUserByUsernameForAuth } from "@/lib/data/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  const user = await findUserByUsernameForAuth(username);
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ role: user.role, fullName: user.fullName });
}
