import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createCourse, listCourses } from "@/lib/data/courses";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthenticated();

  try {
    const courses = await listCourses(session);
    return NextResponse.json({ courses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.grade || !body?.group || !body?.academicPeriodId) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const course = await createCourse(session, {
      name: body.name,
      grade: body.grade,
      group: body.group,
      academicPeriodId: body.academicPeriodId,
    });
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
