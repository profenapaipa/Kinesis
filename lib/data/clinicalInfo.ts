import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clinicalInfo } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { canViewDiagnosis, PermissionError } from "@/lib/permissions";

// Único punto de acceso a clinical_info en todo el proyecto, fuera de
// db/schema.ts y db/seed.ts. Nunca se llama sin haber pasado antes por
// canViewDiagnosis() — y además re-verifica aquí adentro (fail closed), para
// que un descuido en el llamador no termine filtrando datos clínicos.

export interface ClinicalDiagnosis {
  diagnosis: string;
  responsibleProfessional: string;
  lastReviewDate: string;
  notes: string | null;
}

export async function getClinicalDiagnosis(
  session: Session,
  studentUserId: string
): Promise<ClinicalDiagnosis | null> {
  const allowed = await canViewDiagnosis(session, studentUserId);
  if (!allowed) throw new PermissionError("observaciones_docentes");

  const row = await db
    .select({
      diagnosis: clinicalInfo.diagnosis,
      responsibleProfessional: clinicalInfo.responsibleProfessional,
      lastReviewDate: clinicalInfo.lastReviewDate,
      notes: clinicalInfo.notes,
    })
    .from(clinicalInfo)
    .where(eq(clinicalInfo.studentUserId, studentUserId))
    .get();

  return row ?? null;
}
