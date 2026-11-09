import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { studentLearningPreferences } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { KIND_LABEL, MODALITY_LABEL } from "@/lib/classLogShared";
import { listClassLog, summarizeWorked } from "@/lib/data/classLog";
import { getDocumentsOverview } from "@/lib/data/documents";

// Resumen de «herramientas, resultados y novedades» para cada rol. Es una
// COMPOSICIÓN de lo que ya existe (bitácora y documentos): cada pieza llega
// recortada por la misma revisión de su propio módulo, así que este archivo no
// puede mostrar más de lo que el rol ya podría ver en esas pantallas. No lee
// `clinical_info` ni escribe nada.

export interface SummaryLine {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}

export interface SummaryNews {
  text: string;
  at: string; // ISO
  href?: string;
}

export interface RoleSummary {
  tools: SummaryLine[];
  results: SummaryLine[];
  news: SummaryNews[];
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export async function getRoleSummary(session: Session): Promise<RoleSummary> {
  const tools: SummaryLine[] = [];
  const results: SummaryLine[] = [];
  const news: SummaryNews[] = [];

  // Documentos: todos los roles menos el estudiante.
  if (session.role !== "estudiante") {
    const overview = await getDocumentsOverview(session);
    const { done, total } = overview.required;
    tools.push({
      label: session.role === "padre" ? "Documentos de tu familia" : "Documentos imprescindibles",
      value: `${done} de ${total}`,
      hint: overview.missingCount
        ? plural(overview.missingCount, "pendiente por cargar", "pendientes por cargar")
        : "Todo al día",
      href: "/documentos",
    });
    for (const item of overview.items) {
      for (const doc of item.documents.slice(0, 2)) {
        news.push({
          text: `Se cargó «${item.type.title}»${doc.uploadedByName ? ` (${doc.uploadedByName})` : ""}.`,
          at: doc.createdAt,
          href: "/documentos",
        });
      }
    }
  }

  // Bitácora: todos menos el administrador.
  if (session.role !== "administrador") {
    const entries = await listClassLog(session, 200);
    const worked = summarizeWorked(entries);
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const thisWeek = entries.filter((entry) => new Date(entry.createdAt).getTime() >= weekAgo).length;

    tools.push({
      label: session.role === "estudiante" ? "Lo que me ha ayudado" : "Registros de la bitácora",
      value: String(session.role === "estudiante" ? entries.length : thisWeek),
      hint: session.role === "estudiante" ? "registros míos" : "en los últimos 7 días",
      href: "/bitacora",
    });

    // Resultado: qué tipo de actividad se probó más y cuántas veces funcionó,
    // sin atribuirlo a una persona (el detalle por estudiante está en la
    // pantalla de la bitácora, redactado con fechas).
    const byModality = new Map<string, { worked: number; total: number }>();
    for (const student of worked) {
      for (const item of student.items) {
        const acc = byModality.get(item.modality) ?? { worked: 0, total: 0 };
        acc.worked += item.worked;
        acc.total += item.total;
        byModality.set(item.modality, acc);
      }
    }
    const ranked = [...byModality].sort((a, b) => b[1].worked - a[1].worked || b[1].total - a[1].total);
    for (const [modality, acc] of ranked.slice(0, 2)) {
      results.push({
        label: MODALITY_LABEL[modality as keyof typeof MODALITY_LABEL],
        value: `${acc.worked} de ${acc.total}`,
        hint: "registros en que funcionó",
        href: "/bitacora",
      });
    }
    if (!ranked.length) {
      results.push({
        label: "Lo que funcionó",
        value: "Aún sin registros",
        hint: "Empieza con un registro rápido",
        href: "/bitacora",
      });
    }

    for (const entry of entries.slice(0, 4)) {
      news.push({
        text:
          entry.kind === "lo_que_funciono" && entry.modality
            ? `${KIND_LABEL[entry.kind]}: ${MODALITY_LABEL[entry.modality].toLowerCase()}${
                entry.studentName && session.role !== "estudiante" ? ` (${entry.studentName})` : ""
              }.`
            : `${KIND_LABEL[entry.kind]}${entry.studentName && session.role !== "estudiante" ? ` (${entry.studentName})` : ""}.`,
        at: entry.createdAt,
        href: "/bitacora",
      });
    }
  }

  if (session.role === "estudiante") {
    const rows = await db
      .select({ id: studentLearningPreferences.id })
      .from(studentLearningPreferences)
      .where(
        and(
          eq(studentLearningPreferences.studentUserId, session.userId),
          eq(studentLearningPreferences.selected, true)
        )
      );
    tools.push({
      label: "Mi forma de aprender",
      value: String(rows.length),
      hint: rows.length ? "cosas que marcaste" : "Marca lo que te ayuda",
      href: "/estudiante#mi-forma-de-aprender",
    });
  }

  news.sort((a, b) => b.at.localeCompare(a.at));
  return { tools, results, news: news.slice(0, 5) };
}
