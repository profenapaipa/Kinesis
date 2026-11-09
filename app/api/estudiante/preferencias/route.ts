import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { setMyPreferences } from "@/lib/data/studentPreferences";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.selected)) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }
  try {
    const selected = await setMyPreferences(session, body.selected.map(String));
    return NextResponse.json({ selected });
  } catch (error) {
    return handleApiError(error);
  }
}
