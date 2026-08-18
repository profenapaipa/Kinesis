import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { assignTeacherToCourse, listCourseTeachers } from "@/lib/data/courses";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  try {
    const teachers = await listCourseTeachers(session, id);
    return NextResponse.json({ teachers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.teacherUserId || !body?.subjectId) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const assignment = await assignTeacherToCourse(session, {
      teacherUserId: body.teacherUserId,
      courseId: id,
      subjectId: body.subjectId,
    });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
