import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createGuardianLink, listGuardianLinks } from "@/lib/data/guardianStudents";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthenticated();

  try {
    const links = await listGuardianLinks(session);
    return NextResponse.json({ links });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.guardianUserId || !body?.studentUserId || !body?.relationship) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const link = await createGuardianLink(session, {
      guardianUserId: body.guardianUserId,
      studentUserId: body.studentUserId,
      relationship: body.relationship,
      authorizedForDiagnosis: Boolean(body.authorizedForDiagnosis),
    });
    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
