import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

// scrypt de node:crypto — sin dependencias nativas nuevas (bcrypt/argon2
// requerirían un binario adicional; esto ya viene con Node).
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(plain, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;

  const derivedKey = scryptSync(plain, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (derivedKey.length !== storedBuffer.length) return false;

  return timingSafeEqual(derivedKey, storedBuffer);
}
