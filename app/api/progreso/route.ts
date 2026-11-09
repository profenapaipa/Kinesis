import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { gradeActivity } from "@/lib/data/progress";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();
  const body = await request.json().catch(() => null);
  if (typeof body?.activityId !== "string" || typeof body?.studentUserId !== "string") {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }
  const score = body.score === null || body.score === "" || body.score === undefined ? null : Number(body.score);
  try {
    await gradeActivity(session, {
      activityId: body.activityId,
      studentUserId: body.studentUserId,
      score,
      feedback: typeof body.feedback === "string" ? body.feedback : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
