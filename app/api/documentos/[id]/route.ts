import { NextResponse } from "next/server";
import { handleApiError, unauthenticated } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { readDocumentFile } from "@/lib/data/documents";

// Descarga con revisión de permisos: los archivos no están en /public.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthenticated();
  const { id } = await params;
  try {
    const file = await readDocumentFile(session, id);
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        // Un documento sensible no debe quedar en cachés compartidas.
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
