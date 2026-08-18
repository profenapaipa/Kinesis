import { eq } from "drizzle-orm";
import { db } from "@/db";
import { supportCategories } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";

export type SupportCategory = typeof supportCategories.$inferSelect;

export async function listSupportCategories(
  session: Session,
  includeInactive = false
): Promise<SupportCategory[]> {
  requireAdmin(session);
  const rows = await db.select().from(supportCategories);
  return includeInactive ? rows : rows.filter((row) => row.isActive);
}

export interface CreateSupportCategoryInput {
  name: string;
  description: string;
  studentFriendlyText: string;
}

export async function createSupportCategory(
  session: Session,
  input: CreateSupportCategoryInput
): Promise<SupportCategory> {
  requireAdmin(session);
  return db
    .insert(supportCategories)
    .values({ ...input, createdBy: session.userId })
    .returning()
    .get();
}

export interface UpdateSupportCategoryInput {
  name?: string;
  description?: string;
  studentFriendlyText?: string;
  isActive?: boolean;
}

export async function updateSupportCategory(
  session: Session,
  id: string,
  input: UpdateSupportCategoryInput
): Promise<SupportCategory> {
  requireAdmin(session);
  return db.update(supportCategories).set(input).where(eq(supportCategories.id, id)).returning().get();
}
