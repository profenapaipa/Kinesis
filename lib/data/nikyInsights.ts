import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  academicPeriods,
  activities,
  classLogEntries,
  effectiveSupports,
  followUpNotes,
  guardianStudents,
  pedagogicalProfiles,
  studentLearningPreferences,
  subjects,
  supportCategories,
  users,
} from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import { MODALITY_LABEL, shortDate, type LogModality } from "@/lib/classLogShared";
import { listClassLog, listLogTargetsForTeacher, type ClassLogEntry } from "@/lib/data/classLog";
import { getDocumentsOverview } from "@/lib/data/documents";
import { listFollowUp } from "@/lib/data/followUp";
import { listProgress, type ProgressRow } from "@/lib/data/progress";
import type { NikyTask } from "@/lib/nikyBridge";
import { formatScore } from "@/lib/progressShared";
import type { Role } from "@/types";

// «Niky sugiere»: cosas por mirar, calculadas con los datos reales de Kinesis.
//
// Dos decisiones que explican el resto del archivo:
//
// 1. NO es la IA generando en vivo. Son reglas y cuentas sobre lo que ya está
//    en la base (bitácora, progreso, seguimiento, documentos), redactadas aquí.
//    La interfaz lo dice así. Lo que sí es de Niky es la conversación: cada
//    ítem puede abrirla en la plataforma con `callNiky`, y ahí decide quien
//    enseña.
// 2. Este archivo es una COMPOSICIÓN, como lib/data/roleSummary.ts: cada pieza
//    sale de un módulo que ya repite su propia revisión de permisos
//    (listClassLog, listProgress, listFollowUp, getDocumentsOverview), de modo
//    que ningún rol ve aquí más de lo que ve en las otras pantallas. Donde no
//    hay un módulo que sirva se consulta la tabla, pero SIEMPRE acotada por la
//    sesión (el docente a sus actividades, la familia a sus hijos vinculados,
//    el estudiante a sí mismo). Nunca se importa `clinical_info` ni se lee un
//    diagnóstico; las «impresiones» y los soportes clínicos no existen aquí.
//
// Ningún ítem modifica nada: son texto, un enlace a la pantalla donde se actúa
// y, a lo sumo, un botón que abre la conversación con Niky.

export type InsightKind = "sugerencia" | "alerta" | "resumen";

export interface InsightAction {
  label: string;
  task: NikyTask;
  /** Sin datos personales: la plataforma lo recibe truncado a 200 caracteres. */
  context: string;
}

export interface InsightItem {
  id: string;
  kind: InsightKind;
  text: string;
  href: string;
  hrefLabel: string;
  action?: InsightAction;
}

export interface QuickAnswer {
  id: string;
  question: string;
  summary: string;
  table?: { head: string[]; rows: string[][] };
  lines?: string[];
  href?: string;
  hrefLabel?: string;
}

export interface ActivityTemplate {
  id: string;
  topic: string;
  subjectName: string;
  why: string;
  /** Con el hash `#plantilla=<id>&fecha=<AAAA-MM-DD>`: es un sitio estático, no se usan searchParams. */
  href: string;
}

export interface NikyInsights {
  role: Role;
  items: InsightItem[];
  quick: QuickAnswer[];
  templates: ActivityTemplate[];
}

const MAX_ITEMS = 5;
const DAY_MS = 24 * 3600 * 1000;
// Mismo criterio que el resto del producto: la semana pedagógica se mira en hora de Colombia.
const BOGOTA_OFFSET_MS = -5 * 3600 * 1000;

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function todayIso(): string {
  return new Date(Date.now() + BOGOTA_OFFSET_MS).toISOString().slice(0, 10);
}

function daysFromToday(isoDate: string): number {
  return Math.round((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${todayIso()}T00:00:00Z`)) / DAY_MS);
}

function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

function shortDay(isoDate: string): string {
  return shortDate(`${isoDate}T12:00:00-05:00`);
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function modalityName(modality: LogModality): string {
  return MODALITY_LABEL[modality].toLowerCase();
}

// Las alertas primero, luego lo que se puede mejorar y al final el resumen:
// con tres a cinco ítems, lo urgente no se queda fuera.
type Candidate = InsightItem & { weight: number };

const KIND_ORDER: Record<InsightKind, number> = { alerta: 0, sugerencia: 1, resumen: 2 };

function pick(candidates: Candidate[]): InsightItem[] {
  return [...candidates]
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.weight - b.weight)
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      text: item.text,
      href: item.href,
      hrefLabel: item.hrefLabel,
      action: item.action,
    }));
}


function averageOf(rows: ProgressRow[]): number | null {
  const scores = rows.map((row) => row.score).filter((score): score is number => score !== null);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

// ---------------------------------------------------------------------------
// Docente
// ---------------------------------------------------------------------------

interface WorkedGroup {
  activityId: string;
  topic: string;
  modality: LogModality;
  worked: number;
  partial: number;
  notWorked: number;
  total: number;
  lastAt: string;
}

const DUA_PARTS: Array<[keyof Pick<typeof activities.$inferSelect, "representationNotes" | "expressionNotes" | "engagementNotes">, string]> = [
  ["representationNotes", "cómo presentas el contenido de más de una forma"],
  ["expressionNotes", "cómo pueden mostrar lo que aprendieron"],
  ["engagementNotes", "cómo sostienes el interés"],
];

async function teacherInsights(session: Session): Promise<NikyInsights> {
  // Solo las actividades que creó este docente: es la misma frontera de progress.ts.
  const mine = await db
    .select({
      id: activities.id,
      topic: activities.topic,
      objective: activities.objective,
      subjectId: activities.subjectId,
      subjectName: subjects.name,
      scheduledDate: activities.scheduledDate,
      representationNotes: activities.representationNotes,
      expressionNotes: activities.expressionNotes,
      engagementNotes: activities.engagementNotes,
    })
    .from(activities)
    .innerJoin(subjects, eq(subjects.id, activities.subjectId))
    .where(eq(activities.teacherUserId, session.userId))
    .orderBy(activities.scheduledDate);
  const actIds = mine.map((activity) => activity.id);

  const progress = await listProgress(session);
  const entries = await listClassLog(session, 200);
  const targets = await listLogTargetsForTeacher(session);

  // «Lo que funcionó» por actividad y modalidad. Se lee la tabla porque
  // listClassLog no entrega el id de la actividad; se acota a las del docente y
  // a los tipos compartibles (nunca las observaciones privadas).
  const logRows = actIds.length
    ? await db
        .select({
          activityId: classLogEntries.activityId,
          modality: classLogEntries.modality,
          outcome: classLogEntries.outcome,
          createdAt: classLogEntries.createdAt,
        })
        .from(classLogEntries)
        .where(
          and(
            inArray(classLogEntries.activityId, actIds),
            eq(classLogEntries.kind, "lo_que_funciono"),
            isNotNull(classLogEntries.modality)
          )
        )
    : [];
  const topicById = new Map(mine.map((activity) => [activity.id, activity.topic]));
  const groups = new Map<string, WorkedGroup>();
  for (const row of logRows) {
    if (!row.activityId || !row.modality) continue;
    const key = `${row.activityId}|${row.modality}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        activityId: row.activityId,
        topic: topicById.get(row.activityId) ?? "Actividad",
        modality: row.modality,
        worked: 0,
        partial: 0,
        notWorked: 0,
        total: 0,
        lastAt: row.createdAt,
      };
      groups.set(key, group);
    }
    group.total += 1;
    if (row.outcome === "funciono") group.worked += 1;
    else if (row.outcome === "funciono_parcialmente") group.partial += 1;
    else if (row.outcome === "no_funciono") group.notWorked += 1;
    if (row.createdAt > group.lastAt) group.lastAt = row.createdAt;
  }
  const workedGroups = [...groups.values()];
  const groupText = (group: WorkedGroup) =>
    `${MODALITY_LABEL[group.modality]} en «${group.topic}»: funcionó en ${group.worked} de ${plural(group.total, "registro", "registros")}, último: ${shortDate(group.lastAt)}`;

  const candidates: Candidate[] = [];

  // 1. Entregadas sin calificar: la alerta de tarea completada.
  const pending = progress.filter((row) => row.status === "entregada" && row.score === null);
  const pendingByActivity = new Map<string, { topic: string; count: number }>();
  for (const row of pending) {
    const acc = pendingByActivity.get(row.activityId) ?? { topic: row.topic, count: 0 };
    acc.count += 1;
    pendingByActivity.set(row.activityId, acc);
  }
  if (pending.length) {
    const top = [...pendingByActivity.values()].sort((a, b) => b.count - a.count).slice(0, 2);
    candidates.push({
      id: "sin-calificar",
      kind: "alerta",
      weight: 0,
      text: `${plural(pending.length, "estudiante entregó", "estudiantes entregaron")} y espera${pending.length === 1 ? "" : "n"} tu calificación: ${top
        .map((item) => `«${item.topic}» (${item.count})`)
        .join(", ")}${pendingByActivity.size > top.length ? " y más" : ""}.`,
      href: "/progreso",
      hrefLabel: "Calificar en Progreso",
    });
  }

  // 2. Actividades sin DUA completo.
  for (const activity of mine) {
    const missing = DUA_PARTS.filter(([field]) => !activity[field]?.trim());
    if (!missing.length) continue;
    candidates.push({
      id: `dua-${activity.id}`,
      kind: "sugerencia",
      weight: 1,
      text: `«${activity.topic}» tiene ${3 - missing.length} de 3 principios del DUA. Falta pensar ${missing
        .map(([, label]) => label)
        .join(" y ")}; hacerlo antes ahorra ajustes caso por caso.`,
      href: `/planeacion/${activity.subjectId}`,
      hrefLabel: "Completar en Planeación",
      action: { label: "Pídele una idea a Niky", task: "ajustar-actividad", context: activity.topic },
    });
  }

  // 3. Lo que no funcionó (vale la pena revisar) y 4. lo que sí (vale la pena repetir).
  const notWorking = workedGroups
    .filter((group) => group.notWorked > 0 && group.worked === 0)
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))[0];
  if (notWorking) {
    candidates.push({
      id: "no-funciono",
      kind: "sugerencia",
      weight: 2,
      text: `En «${notWorking.topic}», ${modalityName(notWorking.modality)} no funcionó en ${notWorking.notWorked} de ${plural(notWorking.total, "registro", "registros")}, último: ${shortDate(notWorking.lastAt)}. Quizá convenga presentarla de otra forma, tú decides.`,
      href: "/bitacora",
      hrefLabel: "Ver la bitácora",
      action: { label: "Pídele una idea a Niky", task: "ajustar-actividad", context: notWorking.topic },
    });
  }
  const working = workedGroups
    .filter((group) => group.worked > 0)
    .sort((a, b) => b.worked / b.total - a.worked / a.total || b.total - a.total)[0];
  if (working) {
    candidates.push({
      id: "funciono",
      kind: "resumen",
      weight: 3,
      text: `Lo que más ha funcionado: ${MODALITY_LABEL[working.modality].toLowerCase()} en «${working.topic}», funcionó en ${working.worked} de ${plural(working.total, "registro", "registros")}, último: ${shortDate(working.lastAt)}.`,
      href: "/bitacora",
      hrefLabel: "Ver la bitácora",
    });
  }

  // 5. Estudiantes sin registro en 14 días.
  const since = Date.now() - 14 * DAY_MS;
  const withLog = new Set(
    entries
      .filter((entry) => entry.studentUserId && new Date(entry.createdAt).getTime() >= since)
      .map((entry) => entry.studentUserId as string)
  );
  const silent = targets.students.filter((student) => !withLog.has(student.id));
  if (silent.length) {
    candidates.push({
      id: "sin-registro",
      kind: "sugerencia",
      weight: 4,
      text: `${plural(silent.length, "estudiante no tiene", "estudiantes no tienen")} registro en la bitácora en los últimos 14 días. Una frase corta por estudiante ya sirve.`,
      href: "/bitacora",
      hrefLabel: "Hacer un registro rápido",
      action: { label: "Ordenar una nota con Niky", task: "ordenar-nota-bitacora", context: "Registro rápido de un estudiante sin registro reciente" },
    });
  }

  // 6. Evaluación rápida de las actividades.
  const evalRows = mine
    .map((activity) => {
      const rows = progress.filter((row) => row.activityId === activity.id);
      const started = rows.filter((row) => row.status !== "sin_empezar");
      const graded = rows.filter((row) => row.score !== null);
      return { topic: activity.topic, started: started.length, graded: graded.length, average: averageOf(rows) };
    })
    .filter((row) => row.started > 0)
    .sort((a, b) => b.started - a.started || a.topic.localeCompare(b.topic, "es"));
  const gradedTotal = evalRows.reduce((sum, row) => sum + row.graded, 0);
  const overall = averageOf(progress);
  if (evalRows.length) {
    candidates.push({
      id: "evaluacion-rapida",
      kind: "resumen",
      weight: 5,
      text: `Evaluación rápida: ${plural(evalRows.length, "actividad con avance", "actividades con avance")}, ${plural(gradedTotal, "calificada", "calificadas")}${overall === null ? "" : `, promedio ${formatScore(overall)}`}.`,
      href: "/progreso",
      hrefLabel: "Abrir Progreso",
    });
  }

  // Preguntas rápidas: la misma información, desplegada con más detalle.
  const quick: QuickAnswer[] = [];
  const byModality = new Map<LogModality, { worked: number; total: number; lastAt: string }>();
  for (const group of workedGroups) {
    const acc = byModality.get(group.modality) ?? { worked: 0, total: 0, lastAt: group.lastAt };
    acc.worked += group.worked;
    acc.total += group.total;
    if (group.lastAt > acc.lastAt) acc.lastAt = group.lastAt;
    byModality.set(group.modality, acc);
  }
  quick.push({
    id: "han-funcionado",
    question: "¿Qué actividades han funcionado?",
    summary: workedGroups.length
      ? "Esto sale de tus registros de «lo que funcionó» en la bitácora, por tipo de actividad. Es evidencia con fechas, no una etiqueta para nadie."
      : "Aún no hay registros de «lo que funcionó» ligados a tus actividades.",
    table: workedGroups.length
      ? {
          head: ["Tipo de actividad", "Funcionó", "Último"],
          rows: [...byModality]
            .sort((a, b) => b[1].worked - a[1].worked || b[1].total - a[1].total)
            .map(([modality, acc]) => [
              MODALITY_LABEL[modality],
              `${acc.worked} de ${acc.total}`,
              shortDate(acc.lastAt),
            ]),
        }
      : undefined,
    lines: [...workedGroups]
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
      .slice(0, 4)
      .map((group) => `${groupText(group)}.`),
    href: "/bitacora",
    hrefLabel: "Ir a la bitácora",
  });
  quick.push({
    id: "por-calificar",
    question: "¿Qué está pendiente por calificar?",
    summary: pending.length
      ? `${plural(pending.length, "entrega espera", "entregas esperan")} tu calificación. La nota la pones tú en Progreso.`
      : "No tienes entregas sin calificar.",
    table: pending.length
      ? {
          head: ["Actividad", "Entregadas sin nota"],
          rows: [...pendingByActivity.values()].sort((a, b) => b.count - a.count).map((item) => [item.topic, String(item.count)]),
        }
      : undefined,
    href: "/progreso",
    hrefLabel: "Calificar en Progreso",
  });
  quick.push({
    id: "evaluacion",
    question: "Evaluación rápida de mis actividades",
    summary: evalRows.length
      ? "Estudiantes con avance, actividades ya calificadas y promedio de las notas puestas hasta hoy."
      : "Todavía no hay avances en tus actividades.",
    table: evalRows.length
      ? {
          head: ["Actividad", "Con avance", "Calificadas", "Promedio"],
          rows: evalRows.slice(0, 7).map((row) => [row.topic, String(row.started), String(row.graded), formatScore(row.average)]),
        }
      : undefined,
    href: "/progreso",
    hrefLabel: "Abrir Progreso",
  });
  quick.push({
    id: "sin-registro",
    question: "¿Quién no tiene registro en 14 días?",
    summary: silent.length
      ? `${plural(silent.length, "estudiante", "estudiantes")} de tus cursos sin registro en la bitácora en 14 días.`
      : "Todos tus estudiantes tienen al menos un registro en los últimos 14 días.",
    lines: silent.slice(0, 8).map((student) => student.name),
    href: "/bitacora",
    hrefLabel: "Hacer un registro rápido",
  });

  // Plantillas: actividades con DUA completo, de asignaturas distintas, empezando
  // por las que más veces funcionaron. Se duplica el tema y solo cambia la fecha.
  const workedByActivity = new Map<string, number>();
  for (const group of workedGroups) {
    workedByActivity.set(group.activityId, (workedByActivity.get(group.activityId) ?? 0) + group.worked);
  }
  const complete = mine
    .filter((activity) => DUA_PARTS.every(([field]) => activity[field]?.trim()))
    .sort((a, b) => (workedByActivity.get(b.id) ?? 0) - (workedByActivity.get(a.id) ?? 0));
  const templates: ActivityTemplate[] = [];
  const usedSubjects = new Set<string>();
  for (const activity of complete) {
    if (usedSubjects.has(activity.subjectId)) continue;
    usedSubjects.add(activity.subjectId);
    const base = activity.scheduledDate && activity.scheduledDate > todayIso() ? activity.scheduledDate : todayIso();
    const date = addDays(base, 7);
    const worked = workedByActivity.get(activity.id) ?? 0;
    templates.push({
      id: activity.id,
      topic: activity.topic,
      subjectName: activity.subjectName,
      why: worked
        ? `Su DUA está completo y funcionó en ${plural(worked, "registro", "registros")}.`
        : "Su DUA está completo: sirve de base para pensar una nueva.",
      href: `/planeacion/${activity.subjectId}#plantilla=${activity.id}&fecha=${date}`,
    });
    if (templates.length === 3) break;
  }

  return { role: "docente", items: pick(candidates), quick, templates };
}

// ---------------------------------------------------------------------------
// Orientador
// ---------------------------------------------------------------------------

// Qué categoría de apoyo corresponde a cada tipo de actividad, para no sugerir
// «confirmar» un apoyo que el perfil ya tiene. Lo digital y la lectoescritura no
// tienen una categoría equivalente en el catálogo y por eso no se proponen.
const SUPPORT_FOR_MODALITY: Partial<Record<LogModality, string>> = {
  visual: "Apoyo visual",
  auditiva: "Apoyo auditivo",
  kinestesica: "Pausas activas",
  en_pareja: "Agrupamiento flexible",
};

const REVIEW_WINDOW_DAYS = 14;

async function orientadorInsights(session: Session): Promise<NikyInsights> {
  const candidates: Candidate[] = [];
  const quick: QuickAnswer[] = [];

  // Revisiones: la nota más reciente con fecha de revisión de cada estudiante.
  const notes = await db
    .select({
      studentUserId: followUpNotes.studentUserId,
      reviewDate: followUpNotes.reviewDate,
      createdAt: followUpNotes.createdAt,
      studentName: users.fullName,
    })
    .from(followUpNotes)
    .innerJoin(users, eq(users.id, followUpNotes.studentUserId))
    .where(isNotNull(followUpNotes.reviewDate))
    .orderBy(desc(followUpNotes.createdAt));
  const latestReview = new Map<string, { id: string; name: string; date: string }>();
  for (const note of notes) {
    if (!note.reviewDate || latestReview.has(note.studentUserId)) continue;
    latestReview.set(note.studentUserId, { id: note.studentUserId, name: note.studentName, date: note.reviewDate });
  }
  const reviews = [...latestReview.values()].sort((a, b) => a.date.localeCompare(b.date));
  const overdue = reviews.filter((review) => daysFromToday(review.date) < 0);
  const upcoming = reviews.filter((review) => {
    const days = daysFromToday(review.date);
    return days >= 0 && days <= REVIEW_WINDOW_DAYS;
  });
  const reviewLabel = (review: { name: string; date: string }) => `${review.name} (${shortDay(review.date)})`;
  if (overdue.length) {
    candidates.push({
      id: "revision-vencida",
      kind: "alerta",
      weight: 0,
      text: `${plural(overdue.length, "perfil tiene", "perfiles tienen")} la revisión vencida: ${overdue.slice(0, 3).map(reviewLabel).join(", ")}.`,
      href: overdue.length === 1 ? `/estudiantes/${overdue[0].id}` : "/estudiantes",
      hrefLabel: overdue.length === 1 ? "Abrir el perfil" : "Ver estudiantes",
    });
  }
  if (upcoming.length) {
    candidates.push({
      id: "revision-proxima",
      kind: "sugerencia",
      weight: 1,
      text: `${plural(upcoming.length, "revisión llega", "revisiones llegan")} en los próximos ${REVIEW_WINDOW_DAYS} días: ${upcoming.slice(0, 3).map(reviewLabel).join(", ")}. Puedes llegar con lo que se registró en la bitácora.`,
      href: upcoming.length === 1 ? `/estudiantes/${upcoming[0].id}` : "/estudiantes",
      hrefLabel: upcoming.length === 1 ? "Abrir el perfil" : "Ver estudiantes",
      action: { label: "Pídele un resumen a Niky", task: "explicar", context: "Resumen de lo registrado antes de una revisión de perfil" },
    });
  }
  quick.push({
    id: "revisiones",
    question: "¿Qué revisiones vienen?",
    summary: reviews.length
      ? `${plural(overdue.length, "vencida", "vencidas")} y ${plural(upcoming.length, "próxima", "próximas")} (dentro de ${REVIEW_WINDOW_DAYS} días). Las fechas salen de las notas de seguimiento.`
      : "Ninguna nota de seguimiento tiene fecha de revisión.",
    table: reviews.length
      ? {
          head: ["Perfil", "Revisión", "Estado"],
          rows: reviews.slice(0, 8).map((review) => {
            const days = daysFromToday(review.date);
            return [
              review.name,
              shortDay(review.date),
              days < 0 ? "Vencida" : days <= REVIEW_WINDOW_DAYS ? `En ${plural(days, "día", "días")}` : "Más adelante",
            ];
          }),
        }
      : undefined,
    href: "/estudiantes",
    hrefLabel: "Ver estudiantes",
  });

  // Apoyos que se repiten en la bitácora y que una persona podría confirmar.
  const entries = await listClassLog(session, 200);
  const supportNames = await db
    .select({ studentUserId: pedagogicalProfiles.studentUserId, name: supportCategories.name })
    .from(effectiveSupports)
    .innerJoin(pedagogicalProfiles, eq(pedagogicalProfiles.id, effectiveSupports.profileId))
    .innerJoin(supportCategories, eq(supportCategories.id, effectiveSupports.supportCategoryId));
  const hasSupport = new Set(supportNames.map((row) => `${row.studentUserId}|${row.name}`));

  interface Repeat {
    studentUserId: string;
    studentName: string;
    modality: LogModality;
    worked: number;
    topics: Set<string>;
    lastAt: string;
  }
  const repeats = new Map<string, Repeat>();
  for (const entry of entries) {
    if (entry.kind !== "lo_que_funciono" || entry.outcome !== "funciono" || !entry.modality || !entry.studentUserId) continue;
    const key = `${entry.studentUserId}|${entry.modality}`;
    const acc: Repeat = repeats.get(key) ?? {
      studentUserId: entry.studentUserId,
      studentName: entry.studentName ?? "Estudiante",
      modality: entry.modality,
      worked: 0,
      topics: new Set<string>(),
      lastAt: entry.createdAt,
    };
    acc.worked += 1;
    if (entry.activityTopic) acc.topics.add(entry.activityTopic);
    if (entry.createdAt > acc.lastAt) acc.lastAt = entry.createdAt;
    repeats.set(key, acc);
  }
  // Umbral acordado: 3 registros en 2 actividades. Más abajo no es patrón, es anécdota.
  const confirmable = [...repeats.values()]
    .filter((repeat) => {
      const support = SUPPORT_FOR_MODALITY[repeat.modality];
      return repeat.worked >= 3 && repeat.topics.size >= 2 && support && !hasSupport.has(`${repeat.studentUserId}|${support}`);
    })
    .sort((a, b) => b.worked - a.worked);
  const confirmText = (repeat: Repeat) =>
    `${repeat.studentName}: ${modalityName(repeat.modality)} funcionó en ${repeat.worked} registros de ${repeat.topics.size} actividades, último: ${shortDate(repeat.lastAt)}`;
  if (confirmable.length) {
    const first = confirmable[0];
    candidates.push({
      id: "apoyo-confirmable",
      kind: "sugerencia",
      weight: 2,
      text: `${confirmText(first)}. Podría confirmarse como apoyo; lo confirma una persona del equipo, Niky no lo agrega.`,
      href: `/estudiantes/${first.studentUserId}`,
      hrefLabel: "Revisar el perfil",
    });
  }
  quick.push({
    id: "apoyos",
    question: "¿Qué apoyos podrían confirmarse?",
    summary: confirmable.length
      ? "Patrones de la bitácora: al menos 3 registros que funcionaron en 2 actividades y que el perfil aún no tiene como apoyo. Solo es evidencia; confirmarla es decisión del equipo."
      : "Ningún patrón alcanza el umbral de 3 registros en 2 actividades, o ya está confirmado en el perfil.",
    lines: confirmable.slice(0, 5).map((repeat) => `${confirmText(repeat)}.`),
    href: "/bitacora",
    hrefLabel: "Ver la bitácora",
  });

  // Documentos imprescindibles por estudiante que faltan.
  const overview = await getDocumentsOverview(session);
  const missingByType = overview.items
    .filter((item) => item.type.scope === "estudiante" && item.type.priority === "imprescindible")
    .map((item) => ({
      title: item.type.title,
      missing: item.targets.filter((target) => !item.doneTargetIds.includes(target.id)).length,
      total: item.targets.length,
    }))
    .filter((row) => row.missing > 0)
    .sort((a, b) => b.missing - a.missing);
  const missingTotal = missingByType.reduce((sum, row) => sum + row.missing, 0);
  if (missingTotal) {
    candidates.push({
      id: "documentos-faltan",
      kind: "alerta",
      weight: 1,
      text: `Faltan ${plural(missingTotal, "documento imprescindible", "documentos imprescindibles")} de estudiantes con perfil: ${missingByType
        .slice(0, 2)
        .map((row) => `${row.title} (${row.missing})`)
        .join(", ")}.`,
      href: "/documentos",
      hrefLabel: "Ir a Documentos",
    });
  }
  quick.push({
    id: "documentos",
    question: "¿Qué documentos de estudiantes faltan?",
    summary: missingTotal
      ? "Solo cuenta lo imprescindible y solo de estudiantes con perfil de apoyo."
      : "Todo lo imprescindible de los estudiantes con perfil está cargado.",
    table: missingTotal
      ? { head: ["Documento", "Faltan"], rows: missingByType.map((row) => [row.title, `${row.missing} de ${row.total}`]) }
      : undefined,
    href: "/documentos",
    hrefLabel: "Ir a Documentos",
  });

  // Un resumen para que el panel no sea solo pendientes.
  const weekAgo = Date.now() - 7 * DAY_MS;
  const recent = entries.filter((entry: ClassLogEntry) => new Date(entry.createdAt).getTime() >= weekAgo);
  if (recent.length) {
    const worked = recent.filter((entry) => entry.kind === "lo_que_funciono" && entry.outcome === "funciono").length;
    candidates.push({
      id: "semana",
      kind: "resumen",
      weight: 3,
      text: `En los últimos 7 días hubo ${plural(recent.length, "registro", "registros")} en la bitácora y ${plural(worked, "se anotó que funcionó", "se anotaron que funcionaron")}.`,
      href: "/bitacora",
      hrefLabel: "Ver la bitácora",
    });
  }

  return { role: "orientador", items: pick(candidates), quick, templates: [] };
}

// ---------------------------------------------------------------------------
// Administrador (coordinación)
// ---------------------------------------------------------------------------

async function adminInsights(session: Session): Promise<NikyInsights> {
  // Se descarta todo lo que sea por estudiante: la coordinación mira el
  // funcionamiento de la carga, no a las personas (y getDocumentsOverview ya
  // no se lo entrega, pero aquí también se filtra para que no dependa de eso).
  const overview = await getDocumentsOverview(session);
  const items = overview.items.filter((item) => item.type.scope !== "estudiante");
  const required = items.filter((item) => item.type.priority === "imprescindible");
  const missing = required
    .map((item) => ({
      title: item.type.title,
      why: item.type.why,
      missing: Math.max((item.targets.length || 1) - item.doneTargetIds.length, 0),
    }))
    .filter((row) => row.missing > 0);
  const doneCount = required.length - missing.length;

  const uploads = items
    .flatMap((item) => item.documents.map((doc) => ({ title: item.type.title, at: doc.createdAt })))
    .sort((a, b) => b.at.localeCompare(a.at));

  const candidates: Candidate[] = [];
  if (missing.length) {
    candidates.push({
      id: "documentos-faltan",
      kind: "alerta",
      weight: 0,
      text: `Faltan ${plural(missing.length, "documento imprescindible", "documentos imprescindibles")} del colegio: ${missing
        .slice(0, 3)
        .map((row) => `«${row.title}»`)
        .join(", ")}.`,
      href: "/documentos",
      hrefLabel: "Cargar en Documentos",
    });
  }
  candidates.push({
    id: "avance-documentos",
    kind: "resumen",
    weight: 1,
    text: `Avance de lo imprescindible del colegio: ${doneCount} de ${required.length} tipos de documento cargados.`,
    href: "/documentos",
    hrefLabel: "Ver la lista de verificación",
  });
  if (uploads.length) {
    const last = uploads[0];
    candidates.push({
      id: "ultima-carga",
      kind: "resumen",
      weight: 2,
      text: `Lo último que se cargó: «${last.title}», el ${shortDate(last.at)}. En total hay ${plural(uploads.length, "documento cargado", "documentos cargados")}.`,
      href: "/documentos",
      hrefLabel: "Ver documentos",
    });
  }
  const period = await db.select().from(academicPeriods).where(eq(academicPeriods.isActive, true)).get();
  if (period) {
    const days = daysFromToday(period.endDate);
    candidates.push({
      id: "periodo",
      kind: days >= 0 && days <= 30 ? "sugerencia" : "resumen",
      weight: 3,
      text:
        days >= 0
          ? `El periodo ${period.name} termina el ${shortDay(period.endDate)}, en ${plural(days, "día", "días")}. Conviene dejar listo el calendario y las fechas de revisión antes del cierre.`
          : `El periodo ${period.name} terminó el ${shortDay(period.endDate)}. Revisa si ya hay uno nuevo activo.`,
      href: "/admin",
      hrefLabel: "Ver periodos",
    });
  }

  const quick: QuickAnswer[] = [
    {
      id: "faltan",
      question: "¿Qué documentos faltan?",
      summary: missing.length
        ? "Documentos imprescindibles que el colegio aún no carga. Sin datos de estudiantes."
        : "Todo lo imprescindible del colegio está cargado.",
      table: missing.length
        ? { head: ["Documento", "Para qué sirve"], rows: missing.map((row) => [row.title, row.why]) }
        : undefined,
      href: "/documentos",
      hrefLabel: "Cargar en Documentos",
    },
    {
      id: "cargas",
      question: "¿Qué se cargó últimamente?",
      summary: uploads.length ? "Las últimas cargas de documentos del colegio y de los cursos." : "Todavía no hay cargas.",
      lines: uploads.slice(0, 5).map((upload) => `${upload.title}: ${shortDate(upload.at)}`),
      href: "/documentos",
      hrefLabel: "Ver documentos",
    },
  ];

  return { role: "administrador", items: pick(candidates), quick, templates: [] };
}

// ---------------------------------------------------------------------------
// Familia
// ---------------------------------------------------------------------------

async function guardianChildIds(guardianUserId: string): Promise<string[]> {
  const rows = await db
    .select({ id: guardianStudents.studentUserId })
    .from(guardianStudents)
    .where(eq(guardianStudents.guardianUserId, guardianUserId));
  return rows.map((row) => row.id);
}

async function padreInsights(session: Session): Promise<NikyInsights> {
  const kids = await guardianChildIds(session.userId);
  // listClassLog y listFollowUp ya recortan: solo lo que el docente marcó para
  // la familia, solo de los hijos vinculados.
  const entries = await listClassLog(session, 60);
  const shared = entries.filter((entry) => entry.authorRole === "docente");
  const followNotesByKid = await Promise.all(kids.map((kid) => listFollowUp(session, kid)));
  const dated = followNotesByKid
    .flat()
    .filter((note) => note.reviewDate)
    .sort((a, b) => (a.reviewDate as string).localeCompare(b.reviewDate as string));
  const nextReview = dated.find((note) => daysFromToday(note.reviewDate as string) >= 0) ?? dated[dated.length - 1];
  const overview = await getDocumentsOverview(session);
  const missingDocs = overview.items
    .filter((item) => item.type.priority === "imprescindible" && item.uploadTargets.length > 0)
    .map((item) => ({
      title: item.type.title,
      why: item.type.why,
      missing: item.targets.filter((target) => !item.doneTargetIds.includes(target.id)).length,
    }))
    .filter((row) => row.missing > 0);
  const progress = await listProgress(session);
  const graded = progress.filter((row) => row.score !== null);

  const candidates: Candidate[] = [];
  const reviewDays = nextReview ? daysFromToday(nextReview.reviewDate as string) : null;
  if (nextReview && reviewDays !== null) {
    const dateText = shortDay(nextReview.reviewDate as string);
    candidates.push(
      reviewDays >= 0
        ? {
            id: "revision",
            kind: reviewDays <= 14 ? "alerta" : "sugerencia",
            weight: 0,
            text: `La próxima revisión del plan de apoyo es el ${dateText}, ${reviewDays === 0 ? "hoy" : `en ${plural(reviewDays, "día", "días")}`}. Puedes llegar con lo que has visto en casa.`,
            href: "/padre",
            hrefLabel: "Ver el seguimiento",
          }
        : {
            id: "revision",
            kind: "alerta",
            weight: 0,
            text: `La revisión del plan de apoyo estaba para el ${dateText}. Pregunta en el colegio cuándo es la siguiente.`,
            href: "/padre",
            hrefLabel: "Ver el seguimiento",
          }
    );
  }
  if (missingDocs.length) {
    const first = missingDocs[0];
    candidates.push({
      id: "documento",
      kind: "alerta",
      weight: 1,
      text: `Falta cargar «${first.title}». ${first.why}`,
      href: "/documentos",
      hrefLabel: "Cargar en Documentos",
    });
  }
  if (shared.length) {
    const last = shared[0];
    candidates.push({
      id: "compartido",
      kind: "resumen",
      weight: 2,
      text: `Tu docente compartió ${plural(shared.length, "registro", "registros")}. El último, del ${shortDate(last.createdAt)}: «${clip(last.body, 120)}»`,
      href: "/bitacora",
      hrefLabel: "Leer lo compartido",
    });
  }
  if (progress.length) {
    const avg = averageOf(progress);
    candidates.push({
      id: "progreso",
      kind: "resumen",
      weight: 3,
      text: `${plural(graded.length, "actividad calificada", "actividades calificadas")} de ${progress.length}${avg === null ? "" : `, con un promedio de ${formatScore(avg)}`}.`,
      href: "/progreso",
      hrefLabel: "Ver el progreso",
    });
  }
  const weekAgo = Date.now() - 7 * DAY_MS;
  const mineRecent = entries.some((entry) => entry.authorRole === "padre" && new Date(entry.createdAt).getTime() >= weekAgo);
  if (!mineRecent) {
    candidates.push({
      id: "contar-casa",
      kind: "sugerencia",
      weight: 4,
      text: "Si algo le ayudó en casa esta semana, cuéntalo en la bitácora: el docente lo ve y puede probarlo en clase.",
      href: "/bitacora",
      hrefLabel: "Escribir una nota",
      action: { label: "Ordenar la nota con Niky", task: "ordenar-nota-bitacora", context: "Nota de la familia sobre lo que ayudó en casa" },
    });
  }

  const quick: QuickAnswer[] = [
    {
      id: "compartido",
      question: "¿Qué compartió el docente?",
      summary: shared.length
        ? "Solo ves lo que el docente marcó para compartir con la familia."
        : "El docente aún no ha compartido registros.",
      lines: shared.slice(0, 3).map((entry) => `${shortDate(entry.createdAt)}: ${clip(entry.body, 140)}`),
      href: "/bitacora",
      hrefLabel: "Leer lo compartido",
    },
    {
      id: "revision",
      question: "¿Cuándo es la próxima revisión?",
      summary: nextReview
        ? `La revisión del plan de apoyo está fijada para el ${shortDay(nextReview.reviewDate as string)}.`
        : "Todavía no hay una fecha de revisión compartida contigo.",
      href: "/padre",
      hrefLabel: "Ver el seguimiento",
    },
    {
      id: "documento",
      question: "¿Qué documento falta?",
      summary: missingDocs.length
        ? "Esto es lo imprescindible que la familia puede cargar y todavía no está."
        : "No falta ningún documento por cargar de tu parte.",
      lines: missingDocs.map((row) => `${row.title}. ${row.why}`),
      href: "/documentos",
      hrefLabel: "Ir a Documentos",
    },
  ];

  return { role: "padre", items: pick(candidates), quick, templates: [] };
}

// ---------------------------------------------------------------------------
// Estudiante
// ---------------------------------------------------------------------------

async function estudianteInsights(session: Session): Promise<NikyInsights> {
  // listProgress y listClassLog entregan solo lo propio del estudiante.
  const progress = await listProgress(session);
  const entries = await listClassLog(session, 60);
  const prefs = await db
    .select({ id: studentLearningPreferences.id })
    .from(studentLearningPreferences)
    .where(and(eq(studentLearningPreferences.studentUserId, session.userId), eq(studentLearningPreferences.selected, true)));

  const graded = progress.filter((row) => row.score !== null);
  const avg = averageOf(progress);
  const withComment = graded.filter((row) => row.feedback);

  // «Qué sigue»: primero lo que ya empezó, luego lo más próximo por fecha.
  const open = progress.filter((row) => row.status === "en_curso" || row.status === "sin_empezar");
  const meta = open.length
    ? await db
        .select({ id: activities.id, subjectId: activities.subjectId, scheduledDate: activities.scheduledDate })
        .from(activities)
        .where(inArray(activities.id, open.map((row) => row.activityId)))
    : [];
  const metaById = new Map(meta.map((row) => [row.id, row]));
  const next = [...open].sort((a, b) => {
    const rank = (row: ProgressRow) => (row.status === "en_curso" ? 0 : 1);
    return (
      rank(a) - rank(b) ||
      (metaById.get(a.activityId)?.scheduledDate ?? "9999").localeCompare(metaById.get(b.activityId)?.scheduledDate ?? "9999")
    );
  })[0];
  const nextMeta = next ? metaById.get(next.activityId) : undefined;
  const nextHref = nextMeta ? `/estudiante/${nextMeta.subjectId}` : "/progreso";

  const candidates: Candidate[] = [];
  if (next) {
    candidates.push({
      id: "sigue",
      kind: "sugerencia",
      weight: 0,
      text: `Lo que sigue: «${next.topic}»${next.status === "en_curso" ? ", que ya empezaste" : ""}${
        nextMeta?.scheduledDate ? `, para el ${shortDay(nextMeta.scheduledDate)}` : ""
      }. Si no entiendes un paso, pídele una pista a Niky.`,
      href: nextHref,
      hrefLabel: "Abrir la actividad",
      action: { label: "Pídele una pista a Niky", task: "pista", context: next.topic },
    });
  }
  if (graded.length) {
    candidates.push({
      id: "progreso",
      kind: "resumen",
      weight: 1,
      text: `Llevas ${plural(graded.length, "actividad calificada", "actividades calificadas")} de ${progress.length}${avg === null ? "" : `, con un promedio de ${formatScore(avg)}`}.`,
      href: "/progreso",
      hrefLabel: "Ver mi progreso",
    });
  }
  if (withComment.length) {
    const last = withComment[0];
    candidates.push({
      id: "comentario",
      kind: "resumen",
      weight: 2,
      text: `Tu docente te escribió en «${last.topic}»: «${clip(last.feedback ?? "", 110)}»`,
      href: "/progreso",
      hrefLabel: "Leer los comentarios",
    });
  }
  if (!prefs.length) {
    candidates.push({
      id: "forma-de-aprender",
      kind: "sugerencia",
      weight: 3,
      text: "Marca lo que te ayuda a aprender: así tu docente prepara las actividades pensando en ti.",
      href: "/estudiante#mi-forma-de-aprender",
      hrefLabel: "Marcar lo que me ayuda",
    });
  } else if (!entries.length) {
    candidates.push({
      id: "contar",
      kind: "sugerencia",
      weight: 3,
      text: "Cuenta qué te ayudó hoy en clase: una frase basta.",
      href: "/bitacora",
      hrefLabel: "Escribir una nota",
      action: { label: "Ordenar mi nota con Niky", task: "ordenar-nota-bitacora", context: "Nota de un estudiante sobre qué le ayudó hoy" },
    });
  } else {
    candidates.push({
      id: "mis-notas",
      kind: "resumen",
      weight: 3,
      text: `Has contado ${plural(entries.length, "vez", "veces")} qué te ayudó. Eso le sirve a tu docente para preparar mejor.`,
      href: "/bitacora",
      hrefLabel: "Ver mis notas",
    });
  }

  const quick: QuickAnswer[] = [
    {
      id: "como-voy",
      question: "¿Cómo voy?",
      summary: progress.length
        ? `${plural(graded.length, "actividad calificada", "actividades calificadas")} de ${progress.length}${avg === null ? "" : `, promedio ${formatScore(avg)}`}.`
        : "Aún no tienes actividades registradas.",
      table: progress.length
        ? {
            head: ["Actividad", "Estado", "Nota"],
            rows: progress.slice(0, 7).map((row) => [
              row.topic,
              row.status === "calificada" ? "Calificada" : row.status === "entregada" ? "Entregada" : row.status === "en_curso" ? "En curso" : "Sin empezar",
              formatScore(row.score),
            ]),
          }
        : undefined,
      href: "/progreso",
      hrefLabel: "Ver mi progreso",
    },
    {
      id: "comentarios",
      question: "¿Qué me dijo mi docente?",
      summary: withComment.length ? "Los comentarios de tus actividades calificadas." : "Todavía no tienes comentarios.",
      lines: withComment.slice(0, 3).map((row) => `${row.topic}: ${clip(row.feedback ?? "", 130)}`),
      href: "/progreso",
      hrefLabel: "Leer los comentarios",
    },
    {
      id: "que-sigue",
      question: "¿Qué sigue?",
      summary: next ? `Lo próximo es «${next.topic}».` : "No tienes actividades pendientes.",
      href: nextHref,
      hrefLabel: "Abrir la actividad",
    },
  ];

  return { role: "estudiante", items: pick(candidates), quick, templates: [] };
}

// ---------------------------------------------------------------------------

export async function getNikyInsights(session: Session): Promise<NikyInsights> {
  switch (session.role) {
    case "docente":
      return teacherInsights(session);
    case "orientador":
      return orientadorInsights(session);
    case "administrador":
      return adminInsights(session);
    case "padre":
      return padreInsights(session);
    case "estudiante":
      return estudianteInsights(session);
  }
}
