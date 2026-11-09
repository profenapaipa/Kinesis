import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { getDocumentsOverview, uploadDocument } from "@/lib/data/documents";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthenticated();
  try {
    const overview = await getDocumentsOverview(session);
    return NextResponse.json({ required: overview.required, missingCount: overview.missingCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthenticated();

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const docType = form?.get("docType");
  const targetId = form?.get("targetId");
  if (!(file instanceof File) || typeof docType !== "string" || typeof targetId !== "string") {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }
  const notes = form?.get("notes");
  try {
    const document = await uploadDocument(session, {
      docType,
      targetId,
      notes: typeof notes === "string" ? notes : undefined,
      file,
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
