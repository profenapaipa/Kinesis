import { NextResponse } from "next/server";
import { PermissionError } from "@/lib/permissions";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof PermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
}

export function unauthenticated(): NextResponse {
  return NextResponse.json({ error: "No autenticado." }, { status: 401 });
}
