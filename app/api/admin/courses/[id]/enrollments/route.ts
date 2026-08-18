import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { enrollStudent, listEnrollments } from "@/lib/data/courses";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  try {
    const enrollments = await listEnrollments(session, id);
    return NextResponse.json({ enrollments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.studentUserId || !body?.academicPeriodId) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const enrollment = await enrollStudent(session, {
      studentUserId: body.studentUserId,
      courseId: id,
      academicPeriodId: body.academicPeriodId,
    });
    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
