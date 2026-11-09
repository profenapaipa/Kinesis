import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  courseTeachers,
  enrollments,
  guardianStudents,
  institutionDocuments,
  pedagogicalProfiles,
  users,
} from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import {
  ALLOWED_UPLOAD_MIME,
  DOCUMENT_TYPE_BY_ID,
  DOCUMENT_TYPES,
  MAX_UPLOAD_BYTES,
  type DocumentType,
} from "@/lib/documents/catalog";
import {
  isGuardianOfStudent,
  isTeacherAssignedToStudentCourse,
  PermissionError,
  requireAccess,
} from "@/lib/permissions";

// Documentos institucionales y lista de verificación.
//
// Lo que se sube (malla, DUA, PIAR, autorizaciones) puede ser sensible, así
// que cada función decide por su cuenta quién carga y quién ve, a partir del
// catálogo (lib/documents/catalog.ts). Los archivos viven en `data/uploads/`,
// FUERA de `public/`, y solo se entregan por /api/documentos/[id], que repite
// la revisión. Este archivo no lee `clinical_info`: los soportes clínicos se
// tratan como un archivo más, con acceso restringido al orientador (y al
// docente asignado cuando el catálogo lo permite).

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export interface DocTarget {
  id: string; // "colegio", id de curso o id de estudiante
  label: string;
}

export interface DocumentRow {
  id: string;
  docType: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  notes: string | null;
  targetLabel: string;
  uploadedByName: string | null;
  hasFile: boolean;
}

export interface ChecklistItem {
  type: DocumentType;
  targets: DocTarget[];
  doneTargetIds: string[];
  /** Destinos a los que esta sesión puede subir; vacío si solo mira. */
  uploadTargets: DocTarget[];
  documents: DocumentRow[];
}

export interface DocumentsOverview {
  items: ChecklistItem[];
  required: { done: number; total: number };
  /** Cuántos destinos faltan en total en lo imprescindible. */
  missingCount: number;
}

async function teacherCourses(session: Session): Promise<DocTarget[]> {
  const rows = await db
    .select({ id: courses.id, name: courses.name })
    .from(courseTeachers)
    .innerJoin(courses, eq(courses.id, courseTeachers.courseId))
    .where(eq(courseTeachers.teacherUserId, session.userId));
  const seen = new Map(rows.map((row) => [row.id, row.name]));
  return [...seen].map(([id, label]) => ({ id, label }));
}

async function allCourses(): Promise<DocTarget[]> {
  const rows = await db.select({ id: courses.id, name: courses.name }).from(courses);
  return rows.map((row) => ({ id: row.id, label: row.name }));
}

// Estudiantes con perfil de apoyo (PIAR). Los documentos por estudiante se
// piden solo para ellos: no se le exige un PIAR a quien no lo tiene.
async function studentsWithProfile(session: Session): Promise<DocTarget[]> {
  const rows = await db
    .select({ id: users.id, name: users.fullName })
    .from(pedagogicalProfiles)
    .innerJoin(users, eq(users.id, pedagogicalProfiles.studentUserId))
    .orderBy(users.fullName);
  let visible = rows;
  if (session.role === "docente") {
    const mine = await teacherStudentIds(session);
    visible = rows.filter((row) => mine.has(row.id));
  } else if (session.role === "padre") {
    const kids = await db
      .select({ id: guardianStudents.studentUserId })
      .from(guardianStudents)
      .where(eq(guardianStudents.guardianUserId, session.userId));
    const kidIds = new Set(kids.map((row) => row.id));
    visible = rows.filter((row) => kidIds.has(row.id));
  }
  return visible.map((row) => ({ id: row.id, label: row.name }));
}

async function teacherStudentIds(session: Session): Promise<Set<string>> {
  const courseIds = (await teacherCourses(session)).map((course) => course.id);
  if (!courseIds.length) return new Set();
  const rows = await db
    .select({ id: enrollments.studentUserId })
    .from(enrollments)
    .where(inArray(enrollments.courseId, courseIds));
  return new Set(rows.map((row) => row.id));
}

async function targetsFor(type: DocumentType, session: Session): Promise<DocTarget[]> {
  if (type.scope === "colegio") return [{ id: "colegio", label: "Todo el colegio" }];
  if (type.scope === "curso") {
    return session.role === "docente" ? teacherCourses(session) : allCourses();
  }
  return studentsWithProfile(session);
}

function targetIdOf(row: { courseId: string | null; studentUserId: string | null }): string {
  return row.studentUserId ?? row.courseId ?? "colegio";
}

export async function getDocumentsOverview(session: Session): Promise<DocumentsOverview> {
  requireAccess(session.role, "documentos", ["crear_editar", "parcial"]);

  const rows = await db
    .select({
      id: institutionDocuments.id,
      docType: institutionDocuments.docType,
      courseId: institutionDocuments.courseId,
      studentUserId: institutionDocuments.studentUserId,
      title: institutionDocuments.title,
      fileName: institutionDocuments.fileName,
      sizeBytes: institutionDocuments.sizeBytes,
      storagePath: institutionDocuments.storagePath,
      notes: institutionDocuments.notes,
      createdAt: institutionDocuments.createdAt,
      uploadedBy: institutionDocuments.uploadedBy,
    })
    .from(institutionDocuments)
    .orderBy(desc(institutionDocuments.createdAt));

  const nameIds = [
    ...new Set(rows.flatMap((row) => [row.uploadedBy, row.studentUserId]).filter(Boolean)),
  ] as string[];
  const names = nameIds.length
    ? await db.select({ id: users.id, name: users.fullName }).from(users).where(inArray(users.id, nameIds))
    : [];
  const nameById = new Map(names.map((row) => [row.id, row.name]));
  const courseRows = await allCourses();
  const courseName = new Map(courseRows.map((course) => [course.id, course.label]));

  const items: ChecklistItem[] = [];
  for (const type of DOCUMENT_TYPES) {
    const canView = type.viewers.includes(session.role);
    const canUpload = type.uploaders.includes(session.role);
    if (!canView && !canUpload) continue;

    const targets = await targetsFor(type, session);
    if (!targets.length && type.scope !== "colegio") continue;
    const targetIds = new Set(targets.map((target) => target.id));

    // Un documento por estudiante solo cuenta para quien puede ver ese
    // estudiante: `targets` ya viene recortado por rol.
    const mine = rows.filter(
      (row) => row.docType === type.id && (type.scope === "colegio" || targetIds.has(targetIdOf(row)))
    );

    items.push({
      type,
      targets,
      doneTargetIds: [...new Set(mine.map(targetIdOf))],
      uploadTargets: canUpload ? targets : [],
      documents: canView
        ? mine.map((row) => ({
            id: row.id,
            docType: row.docType,
            title: row.title,
            fileName: row.fileName,
            sizeBytes: row.sizeBytes,
            createdAt: row.createdAt,
            notes: row.notes,
            targetLabel: row.studentUserId
              ? (nameById.get(row.studentUserId) ?? "Estudiante")
              : row.courseId
                ? (courseName.get(row.courseId) ?? "Curso")
                : "Todo el colegio",
            uploadedByName: row.uploadedBy ? (nameById.get(row.uploadedBy) ?? null) : null,
            hasFile: Boolean(row.storagePath),
          }))
        : [],
    });
  }

  // Avance de «lo imprescindible» dentro de lo que este rol puede ver o subir:
  // el administrador cuenta lo del colegio; el orientador, además, lo de cada
  // estudiante con perfil.
  let done = 0;
  let total = 0;
  let missingCount = 0;
  for (const item of items) {
    if (item.type.priority !== "imprescindible") continue;
    const need = item.targets.length || 1;
    const have = item.targets.filter((target) => item.doneTargetIds.includes(target.id)).length;
    total += need;
    done += Math.min(have, need);
    missingCount += Math.max(need - have, 0);
  }
  return { items, required: { done, total }, missingCount };
}

// ---------------------------------------------------------------------------
// Subir
// ---------------------------------------------------------------------------

export interface UploadInput {
  docType: string;
  targetId: string;
  notes?: string;
  file: File;
}

export async function uploadDocument(session: Session, input: UploadInput): Promise<{ id: string }> {
  requireAccess(session.role, "documentos", ["crear_editar", "parcial"]);

  const type = DOCUMENT_TYPE_BY_ID.get(input.docType);
  if (!type) throw new Error("El tipo de documento no es válido.");
  if (!type.uploaders.includes(session.role)) throw new PermissionError("documentos");

  const file = input.file;
  if (!file || !file.size) throw new Error("Elige un archivo.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`El archivo pesa más de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
  }
  const extension = ALLOWED_UPLOAD_MIME[file.type];
  if (!extension) throw new Error("Solo se aceptan PDF, Word, Excel, PNG o JPG.");

  let courseId: string | null = null;
  let studentUserId: string | null = null;
  if (type.scope === "curso") {
    const allowed = await targetsFor(type, session);
    if (!allowed.some((target) => target.id === input.targetId)) throw new PermissionError("documentos");
    courseId = input.targetId;
  } else if (type.scope === "estudiante") {
    // Misma revisión que la bitácora: el docente solo sube sobre estudiantes de
    // sus cursos y la familia solo sobre sus hijos vinculados.
    if (session.role === "docente" && !(await isTeacherAssignedToStudentCourse(session.userId, input.targetId))) {
      throw new PermissionError("documentos");
    }
    if (session.role === "padre" && !(await isGuardianOfStudent(session.userId, input.targetId))) {
      throw new PermissionError("documentos");
    }
    studentUserId = input.targetId;
  }

  const storedName = `${randomUUID()}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));

  const notes = (input.notes ?? "").trim().slice(0, 300) || null;
  const row = await db
    .insert(institutionDocuments)
    .values({
      docType: type.id,
      courseId,
      studentUserId,
      title: type.title,
      fileName: file.name.slice(0, 160),
      mimeType: file.type,
      sizeBytes: file.size,
      storagePath: storedName,
      uploadedBy: session.userId,
      notes,
    })
    .returning({ id: institutionDocuments.id })
    .get();
  return row;
}

// ---------------------------------------------------------------------------
// Descargar
// ---------------------------------------------------------------------------

export async function readDocumentFile(
  session: Session,
  documentId: string
): Promise<{ bytes: Buffer; fileName: string; mimeType: string }> {
  requireAccess(session.role, "documentos", ["crear_editar", "parcial"]);

  const doc = await db
    .select()
    .from(institutionDocuments)
    .where(eq(institutionDocuments.id, documentId))
    .get();
  const type = doc ? DOCUMENT_TYPE_BY_ID.get(doc.docType) : undefined;
  // Mismo error para "no existe" y "no es tuyo": no se confirma qué hay.
  if (!doc || !type || !doc.storagePath) throw new PermissionError("documentos");
  if (!type.viewers.includes(session.role)) throw new PermissionError("documentos");

  if (doc.studentUserId) {
    if (session.role === "docente") {
      if (!(await isTeacherAssignedToStudentCourse(session.userId, doc.studentUserId))) {
        throw new PermissionError("documentos");
      }
    } else if (session.role === "padre") {
      if (!(await isGuardianOfStudent(session.userId, doc.studentUserId))) {
        throw new PermissionError("documentos");
      }
    }
  }
  if (doc.courseId && session.role === "docente") {
    const mine = await teacherCourses(session);
    if (!mine.some((course) => course.id === doc.courseId)) throw new PermissionError("documentos");
  }

  // `storagePath` lo genera este módulo (uuid + extensión); aun así se toma
  // solo el nombre base por si la fila llegara a editarse a mano.
  const bytes = await readFile(path.join(UPLOAD_DIR, path.basename(doc.storagePath)));
  return { bytes, fileName: doc.fileName, mimeType: doc.mimeType };
}
