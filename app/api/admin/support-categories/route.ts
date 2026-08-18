import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { createSupportCategory, listSupportCategories } from "@/lib/data/supportCategories";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const categories = await listSupportCategories(session, includeInactive);
    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.description || !body?.studentFriendlyText) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  try {
    const category = await createSupportCategory(session, {
      name: body.name,
      description: body.description,
      studentFriendlyText: body.studentFriendlyText,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
