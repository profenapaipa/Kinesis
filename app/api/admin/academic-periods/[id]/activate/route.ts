import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { setActiveAcademicPeriod } from "@/lib/data/academicPeriods";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  try {
    const period = await setActiveAcademicPeriod(session, id);
    return NextResponse.json({ period });
  } catch (error) {
    return handleApiError(error);
  }
}
