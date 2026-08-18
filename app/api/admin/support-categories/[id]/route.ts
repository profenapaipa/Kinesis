import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { updateSupportCategory } from "@/lib/data/supportCategories";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  const body = await request.json().catch(() => null);

  try {
    const category = await updateSupportCategory(session, id, {
      name: body?.name,
      description: body?.description,
      studentFriendlyText: body?.studentFriendlyText,
      isActive: body?.isActive,
    });
    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
