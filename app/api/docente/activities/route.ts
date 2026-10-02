import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createActivity } from "@/lib/data/activities";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.courseId || !body?.subjectId || !body?.topic || !body?.objective || !body?.instructions) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const activity = await createActivity(session, {
      courseId: body.courseId,
      subjectId: body.subjectId,
      topic: body.topic,
      objective: body.objective,
      instructions: body.instructions,
      resources: Array.isArray(body.resources) ? body.resources : [],
      representationNotes: body.representationNotes || undefined,
      expressionNotes: body.expressionNotes || undefined,
      engagementNotes: body.engagementNotes || undefined,
      evidenceRequested: body.evidenceRequested || undefined,
      scheduledDate: body.scheduledDate || undefined,
    });
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
