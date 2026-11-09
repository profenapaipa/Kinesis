import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { addFollowUpNote } from "@/lib/data/followUp";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();
  const body = await request.json().catch(() => null);
  if (typeof body?.studentUserId !== "string" || typeof body?.kind !== "string" || typeof body?.body !== "string") {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }
  try {
    await addFollowUpNote(session, {
      studentUserId: body.studentUserId,
      kind: body.kind,
      body: body.body,
      sharedWithGuardian: body.sharedWithGuardian === true,
      reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : null,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
