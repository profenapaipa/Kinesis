import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { createClassLogEntry, listClassLog } from "@/lib/data/classLog";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthenticated();
  try {
    return NextResponse.json({ entries: await listClassLog(session) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.kind || !body?.body) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }
  try {
    const entry = await createClassLogEntry(session, {
      kind: body.kind,
      body: body.body,
      studentUserId: body.studentUserId,
      activityId: body.activityId,
      modality: body.modality,
      outcome: body.outcome,
      sharedWithGuardian: body.sharedWithGuardian === true,
      source: body.source,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
