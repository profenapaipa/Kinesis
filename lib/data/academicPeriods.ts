import { eq } from "drizzle-orm";
import { db } from "@/db";
import { academicPeriods } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";

export type AcademicPeriod = typeof academicPeriods.$inferSelect;

export async function listAcademicPeriods(session: Session): Promise<AcademicPeriod[]> {
  requireAdmin(session);
  return db.select().from(academicPeriods);
}

export interface CreateAcademicPeriodInput {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export async function createAcademicPeriod(
  session: Session,
  input: CreateAcademicPeriodInput
): Promise<AcademicPeriod> {
  requireAdmin(session);
  return db
    .insert(academicPeriods)
    .values({
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive ?? false,
    })
    .returning()
    .get();
}

export async function setActiveAcademicPeriod(
  session: Session,
  id: string
): Promise<AcademicPeriod> {
  requireAdmin(session);
  // Solo un periodo activo a la vez: desactiva todos, luego activa el elegido.
  await db.update(academicPeriods).set({ isActive: false });
  return db
    .update(academicPeriods)
    .set({ isActive: true })
    .where(eq(academicPeriods.id, id))
    .returning()
    .get();
}
