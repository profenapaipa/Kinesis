import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import type { Session } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions";
import type { Role } from "@/types";

export type SafeUser = Omit<typeof users.$inferSelect, "passwordHash">;

const SAFE_COLUMNS = {
  id: users.id,
  username: users.username,
  fullName: users.fullName,
  role: users.role,
  isActive: users.isActive,
  mustChangePassword: users.mustChangePassword,
  createdAt: users.createdAt,
};

// Uso exclusivo del endpoint de login — sí incluye el hash de contraseña.
// No pasa por ningún chequeo de permisos (aún no hay sesión en ese punto).
export async function findUserByUsernameForAuth(username: string) {
  return db.select().from(users).where(eq(users.username, username)).get();
}

export async function listUsers(session: Session, roleFilter?: Role): Promise<SafeUser[]> {
  requireAdmin(session);
  const rows = await db.select(SAFE_COLUMNS).from(users);
  return roleFilter ? rows.filter((row) => row.role === roleFilter) : rows;
}

export async function getUserById(session: Session, id: string): Promise<SafeUser | undefined> {
  requireAdmin(session);
  return db.select(SAFE_COLUMNS).from(users).where(eq(users.id, id)).get();
}

export interface CreateUserInput {
  username: string;
  password: string;
  fullName: string;
  role: Role;
}

export async function createUser(session: Session, input: CreateUserInput): Promise<SafeUser> {
  requireAdmin(session);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, input.username))
    .get();
  if (existing) {
    throw new Error("Ya existe un usuario con ese nombre de usuario.");
  }

  const created = await db
    .insert(users)
    .values({
      username: input.username,
      passwordHash: hashPassword(input.password),
      fullName: input.fullName,
      role: input.role,
      mustChangePassword: true,
    })
    .returning(SAFE_COLUMNS)
    .get();

  return created;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: Role;
  isActive?: boolean;
  newPassword?: string;
}

export async function updateUser(
  session: Session,
  id: string,
  input: UpdateUserInput
): Promise<SafeUser> {
  requireAdmin(session);

  const patch: Partial<typeof users.$inferInsert> = {};
  if (input.fullName !== undefined) patch.fullName = input.fullName;
  if (input.role !== undefined) patch.role = input.role;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.newPassword) {
    patch.passwordHash = hashPassword(input.newPassword);
    patch.mustChangePassword = true;
  }

  const updated = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, id))
    .returning(SAFE_COLUMNS)
    .get();

  // Desactivar un usuario cierra su(s) sesión(es) activa(s) de inmediato —
  // si solo ocultáramos la UI, una sesión ya abierta seguiría funcionando.
  if (input.isActive === false) {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }

  return updated;
}
