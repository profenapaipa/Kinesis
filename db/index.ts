import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  var __sqliteConnection: Database.Database | undefined;
}

// Reutiliza la conexión entre recargas de `next dev` (Turbopack recarga el
// módulo en cada cambio; sin esto, cada recarga abriría un handle nuevo).
const sqlite = globalThis.__sqliteConnection ?? new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalThis.__sqliteConnection = sqlite;
}

export const db = drizzle(sqlite, { schema });
