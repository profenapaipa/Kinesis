import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createUser, listUsers } from "@/lib/data/users";
import type { Role } from "@/types";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  try {
    const url = new URL(request.url);
    const roleFilter = (url.searchParams.get("role") as Role | null) ?? undefined;
    const users = await listUsers(session, roleFilter);
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.password || !body?.fullName || !body?.role) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const user = await createUser(session, {
      username: body.username,
      password: body.password,
      fullName: body.fullName,
      role: body.role,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
