import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  classLogEntries,
  courses,
  courseTeachers,
  enrollments,
  guardianStudents,
  users,
} from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import {
  LOG_KINDS,
  LOG_MODALITIES,
  LOG_OUTCOMES,
  MAX_BODY_LENGTH,
  type LogKind,
  type LogModality,
  type LogOutcome,
} from "@/lib/classLogShared";
import {
  isGuardianOfStudent,
  isTeacherAssignedToStudentCourse,
  PermissionError,
  requireAccess,
} from "@/lib/permissions";

// Bitácora de clase: registros rápidos de lo que pasó y de lo que funcionó.
//
// Quién ve qué (cada función repite su propia revisión; la matriz de
// lib/permissions.ts por sí sola no es un candado, ver la auditoría del 8 nov):
//   - docente: lo que escribió y lo de sus cursos, incluidas las
//     observaciones privadas propias.
//   - orientador: novedades y "lo que funcionó" de todo el colegio, nunca las
//     observaciones privadas del docente.
//   - padre: lo que escribió él mismo y lo que el docente marcó como
//     "compartido con la familia", solo de sus hijos vinculados.
//   - estudiante: solo lo que escribió él mismo.
//   - administrador: nada. No necesita saber qué le funcionó a quién.
// Este archivo NUNCA importa `clinicalInfo`: la bitácora no copia diagnóstico.

export interface ClassLogEntry {
  id: string;
  authorRole: string;
  authorName: string;
  kind: LogKind;
  modality: LogModality | null;
  outcome: LogOutcome | null;
  body: string;
  source: "manual" | "niky";
  sharedWithGuardian: boolean;
  createdAt: string;
  studentUserId: string | null;
  studentName: string | null;
  courseName: string | null;
  activityTopic: string | null;
}

async function myCourseIds(teacherUserId: string): Promise<string[]> {
  const rows = await db
    .select({ courseId: courseTeachers.courseId })
    .from(courseTeachers)
    .where(eq(courseTeachers.teacherUserId, teacherUserId));
  return [...new Set(rows.map((row) => row.courseId))];
}

async function childIds(guardianUserId: string): Promise<string[]> {
  const rows = await db
    .select({ id: guardianStudents.studentUserId })
    .from(guardianStudents)
    .where(eq(guardianStudents.guardianUserId, guardianUserId));
  return rows.map((row) => row.id);
}

export async function listClassLog(session: Session, limit = 60): Promise<ClassLogEntry[]> {
  requireAccess(session.role, "bitacora", ["ver", "crear_editar", "parcial"]);

  let where;
  if (session.role === "docente") {
    const courseIds = await myCourseIds(session.userId);
    where = courseIds.length
      ? or(
          eq(classLogEntries.authorUserId, session.userId),
          and(
            inArray(classLogEntries.courseId, courseIds),
            // Las observaciones privadas de otro docente no se comparten.
            or(
              eq(classLogEntries.kind, "novedad"),
              eq(classLogEntries.kind, "lo_que_funciono")
            )
          )
        )
      : eq(classLogEntries.authorUserId, session.userId);
  } else if (session.role === "orientador") {
    where = or(
      eq(classLogEntries.kind, "novedad"),
      eq(classLogEntries.kind, "lo_que_funciono")
    );
  } else if (session.role === "padre") {
    const kids = await childIds(session.userId);
    where = kids.length
      ? and(
          inArray(classLogEntries.studentUserId, kids),
          or(
            eq(classLogEntries.authorUserId, session.userId),
            eq(classLogEntries.sharedWithGuardian, true)
          )
        )
      : eq(classLogEntries.authorUserId, session.userId);
  } else if (session.role === "estudiante") {
    where = eq(classLogEntries.authorUserId, session.userId);
  } else {
    throw new PermissionError("bitacora");
  }

  const rows = await db
    .select({
      id: classLogEntries.id,
      authorRole: classLogEntries.authorRole,
      authorUserId: classLogEntries.authorUserId,
      kind: classLogEntries.kind,
      modality: classLogEntries.modality,
      outcome: classLogEntries.outcome,
      body: classLogEntries.body,
      source: classLogEntries.source,
      sharedWithGuardian: classLogEntries.sharedWithGuardian,
      createdAt: classLogEntries.createdAt,
      studentUserId: classLogEntries.studentUserId,
      courseName: courses.name,
      activityTopic: activities.topic,
    })
    .from(classLogEntries)
    .leftJoin(courses, eq(courses.id, classLogEntries.courseId))
    .leftJoin(activities, eq(activities.id, classLogEntries.activityId))
    .where(where)
    .orderBy(desc(classLogEntries.createdAt))
    .limit(limit);

  const userIds = [
    ...new Set(rows.flatMap((row) => [row.authorUserId, row.studentUserId]).filter(Boolean)),
  ] as string[];
  const names = userIds.length
    ? await db
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .where(inArray(users.id, userIds))
    : [];
  const nameById = new Map(names.map((row) => [row.id, row.fullName]));

  return rows.map((row) => ({
    id: row.id,
    authorRole: row.authorRole,
    authorName: nameById.get(row.authorUserId) ?? "",
    kind: row.kind,
    modality: row.modality,
    outcome: row.outcome,
    body: row.body,
    source: row.source,
    sharedWithGuardian: row.sharedWithGuardian,
    createdAt: row.createdAt,
    studentUserId: row.studentUserId,
    studentName: row.studentUserId ? (nameById.get(row.studentUserId) ?? null) : null,
    courseName: row.courseName ?? null,
    activityTopic: row.activityTopic ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Crear
// ---------------------------------------------------------------------------

export interface CreateClassLogInput {
  kind: string;
  body: string;
  studentUserId?: string | null;
  activityId?: string | null;
  modality?: string | null;
  outcome?: string | null;
  sharedWithGuardian?: boolean;
  source?: string;
}

function oneOf<T extends string>(list: readonly T[], value: unknown, label: string): T {
  if (typeof value === "string" && (list as readonly string[]).includes(value)) return value as T;
  throw new Error(`${label} no es válido.`);
}

export async function createClassLogEntry(
  session: Session,
  input: CreateClassLogInput
): Promise<{ id: string }> {
  requireAccess(session.role, "bitacora", ["crear_editar", "parcial"]);

  const body = (input.body ?? "").trim();
  if (body.length < 3) throw new Error("Escribe al menos una frase.");
  if (body.length > MAX_BODY_LENGTH) {
    throw new Error(`La nota es muy larga (máximo ${MAX_BODY_LENGTH} caracteres).`);
  }
  const kind = oneOf(LOG_KINDS, input.kind, "El tipo de registro");
  const modality = input.modality ? oneOf(LOG_MODALITIES, input.modality, "El tipo de actividad") : null;
  const outcome = input.outcome ? oneOf(LOG_OUTCOMES, input.outcome, "El resultado") : null;
  const source = input.source === "niky" ? "niky" : "manual";
  const studentUserId = input.studentUserId || null;

  let courseId: string | null = null;
  let sharedWithGuardian = false;

  if (session.role === "docente") {
    if (studentUserId && !(await isTeacherAssignedToStudentCourse(session.userId, studentUserId))) {
      // Mismo mensaje que "no existe": no se confirma si el estudiante es de otro curso.
      throw new PermissionError("bitacora");
    }
    sharedWithGuardian = Boolean(input.sharedWithGuardian) && kind !== "observacion";
  } else if (session.role === "estudiante") {
    // Solo sobre sí mismo y solo "lo que funcionó": no es un canal para
    // reportar a otros ni para dejar observaciones privadas.
    if (studentUserId && studentUserId !== session.userId) throw new PermissionError("bitacora");
    if (kind !== "lo_que_funciono") {
      throw new Error("Aquí solo puedes contar qué te ayudó.");
    }
  } else if (session.role === "padre") {
    if (!studentUserId || !(await isGuardianOfStudent(session.userId, studentUserId))) {
      throw new PermissionError("bitacora");
    }
    if (kind === "observacion") throw new Error("Las observaciones privadas son del docente.");
  } else {
    throw new PermissionError("bitacora");
  }

  const aboutStudent = session.role === "estudiante" ? session.userId : studentUserId;
  if (aboutStudent) {
    const enrollment = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.studentUserId, aboutStudent))
      .get();
    courseId = enrollment?.courseId ?? null;
  }

  let activityId: string | null = null;
  if (input.activityId && session.role === "docente") {
    const activity = await db
      .select({ id: activities.id })
      .from(activities)
      .where(and(eq(activities.id, input.activityId), eq(activities.teacherUserId, session.userId)))
      .get();
    activityId = activity?.id ?? null;
  }

  const row = await db
    .insert(classLogEntries)
    .values({
      authorUserId: session.userId,
      authorRole: session.role,
      courseId,
      activityId,
      studentUserId: aboutStudent,
      kind,
      modality,
      outcome,
      body,
      source,
      sharedWithGuardian,
    })
    .returning({ id: classLogEntries.id })
    .get();
  return row;
}

// ---------------------------------------------------------------------------
// Lo que ha funcionado (resumen, sin etiquetar a nadie)
// ---------------------------------------------------------------------------

export interface WorkedItem {
  modality: LogModality;
  worked: number;
  partial: number;
  notWorked: number;
  total: number;
  lastAt: string;
}

export interface WorkedForStudent {
  studentUserId: string;
  studentName: string;
  items: WorkedItem[];
}

// Agrupa los registros "lo que funcionó" por estudiante y tipo de actividad.
// Redacta cuántas veces, no una conclusión: quien lo muestra dice "funcionó en
// 2 de 3 registros (último: 12 oct)". Pasar de ahí a "apoyo confirmado" es una
// decisión humana (orientación) y no ocurre aquí.
export function summarizeWorked(entries: ClassLogEntry[]): WorkedForStudent[] {
  const byStudent = new Map<string, WorkedForStudent>();
  for (const entry of entries) {
    if (entry.kind !== "lo_que_funciono" || !entry.modality || !entry.studentUserId) continue;
    let student = byStudent.get(entry.studentUserId);
    if (!student) {
      student = {
        studentUserId: entry.studentUserId,
        studentName: entry.studentName ?? "Estudiante",
        items: [],
      };
      byStudent.set(entry.studentUserId, student);
    }
    let item = student.items.find((candidate) => candidate.modality === entry.modality);
    if (!item) {
      item = { modality: entry.modality, worked: 0, partial: 0, notWorked: 0, total: 0, lastAt: entry.createdAt };
      student.items.push(item);
    }
    item.total += 1;
    if (entry.outcome === "funciono") item.worked += 1;
    else if (entry.outcome === "funciono_parcialmente") item.partial += 1;
    else if (entry.outcome === "no_funciono") item.notWorked += 1;
    if (entry.createdAt > item.lastAt) item.lastAt = entry.createdAt;
  }
  for (const student of byStudent.values()) {
    student.items.sort((a, b) => b.worked - a.worked || b.total - a.total);
  }
  return [...byStudent.values()].sort((a, b) => a.studentName.localeCompare(b.studentName, "es"));
}

// Opciones de estudiante y de actividad para el formulario del docente.
export async function listLogTargetsForTeacher(session: Session) {
  if (session.role !== "docente") throw new PermissionError("bitacora");
  const courseIds = await myCourseIds(session.userId);
  if (!courseIds.length) return { students: [], activities: [] };
  const students = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.studentUserId))
    .where(inArray(enrollments.courseId, courseIds))
    .orderBy(users.fullName);
  const acts = await db
    .select({ id: activities.id, topic: activities.topic })
    .from(activities)
    .where(eq(activities.teacherUserId, session.userId))
    .orderBy(desc(activities.createdAt));
  return {
    students: students.map((row) => ({ id: row.id, name: row.fullName })),
    activities: acts.map((row) => ({ id: row.id, name: row.topic })),
  };
}
