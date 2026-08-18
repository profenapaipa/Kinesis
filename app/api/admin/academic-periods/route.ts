import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createAcademicPeriod, listAcademicPeriods } from "@/lib/data/academicPeriods";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthenticated();

  try {
    const periods = await listAcademicPeriods(session);
    return NextResponse.json({ periods });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.startDate || !body?.endDate) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const period = await createAcademicPeriod(session, {
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    return NextResponse.json({ period }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
