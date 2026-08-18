import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { updateUser } from "@/lib/data/users";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const { id } = await params;
  const body = await request.json().catch(() => null);

  try {
    const user = await updateUser(session, id, {
      fullName: body?.fullName,
      role: body?.role,
      isActive: body?.isActive,
      newPassword: body?.newPassword,
    });
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
