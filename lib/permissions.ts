import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courseTeachers, enrollments, guardianStudents } from "@/db/schema";
import type { Session } from "@/lib/auth/session";
import type { Role } from "@/types";

// La matriz de permisos del documento, como datos — no como `if`s
// dispersos por el código. Ningún componente/endpoint debe decidir acceso
// por su cuenta: siempre a través de accessLevel()/requireAccess() o de las
// funciones contextuales (canViewDiagnosis, etc.) más abajo.
export type ResourceCategory =
  | "datos_basicos"
  | "curso"
  | "actividades"
  | "planeacion"
  | "adaptaciones"
  | "seguimiento_pedagogico"
  | "observaciones_docentes"
  | "configuracion";

export type AccessLevel = "no" | "ver" | "crear_editar" | "parcial" | "resumen";

const MATRIX: Record<ResourceCategory, Record<Role, AccessLevel>> = {
  datos_basicos: {
    administrador: "crear_editar",
    docente: "ver",
    estudiante: "ver",
    padre: "ver",
    orientador: "ver",
  },
  curso: {
    administrador: "crear_editar",
    docente: "ver",
    estudiante: "ver",
    padre: "ver",
    orientador: "ver",
  },
  actividades: {
    administrador: "ver",
    docente: "crear_editar",
    estudiante: "ver",
    padre: "ver",
    orientador: "ver",
  },
  planeacion: {
    administrador: "ver",
    docente: "crear_editar",
    estudiante: "no",
    padre: "no",
    orientador: "ver",
  },
  adaptaciones: {
    administrador: "ver",
    docente: "crear_editar",
    estudiante: "parcial",
    padre: "resumen",
    orientador: "crear_editar",
  },
  seguimiento_pedagogico: {
    administrador: "ver",
    docente: "crear_editar",
    estudiante: "parcial",
    padre: "resumen",
    orientador: "crear_editar",
  },
  observaciones_docentes: {
    administrador: "no", // "Restringido" para admin — ver nota de diagnóstico/PIAR abajo
    docente: "crear_editar",
    estudiante: "no",
    padre: "no",
    orientador: "no", // son notas privadas del docente, no del equipo de apoyo
  },
  configuracion: {
    administrador: "crear_editar",
    docente: "no",
    estudiante: "no",
    padre: "no",
    orientador: "no",
  },
};

export function accessLevel(role: Role, category: ResourceCategory): AccessLevel {
  return MATRIX[category][role];
}

export class PermissionError extends Error {
  constructor(public readonly category: string) {
    super(`No tienes permiso para acceder a: ${category}`);
    this.name = "PermissionError";
  }
}

export function requireAccess(
  role: Role,
  category: ResourceCategory,
  allowed: AccessLevel[]
): void {
  if (!allowed.includes(accessLevel(role, category))) {
    throw new PermissionError(category);
  }
}

export function requireAdmin(session: Session): void {
  if (session.role !== "administrador") {
    throw new PermissionError("configuracion");
  }
}

// Exportada (además de usarse internamente en canViewDiagnosis) para que
// lib/data/students.ts la use como guard de "es mi estudiante" en las
// consultas de perfil/resumen pedagógico del docente — no solo para el
// gate de diagnóstico.
export async function isTeacherAssignedToStudentCourse(
  teacherUserId: string,
  studentUserId: string
): Promise<boolean> {
  const row = await db
    .select({ id: courseTeachers.id })
    .from(courseTeachers)
    .innerJoin(enrollments, eq(enrollments.courseId, courseTeachers.courseId))
    .where(
      and(
        eq(courseTeachers.teacherUserId, teacherUserId),
        eq(enrollments.studentUserId, studentUserId)
      )
    )
    .get();
  return Boolean(row);
}

// "Diagnóstico" y "PIAR completo" son "Restringido"/"según necesidad" en la
// matriz del documento — no es un nivel fijo por rol, depende del estudiante
// concreto. Principio de mínimo privilegio: el administrador NO tiene acceso
// por defecto (sin atajo de "admin ve todo"); el docente solo si está
// asignado al curso de ese estudiante.
//
// "orientador" es la única excepción deliberada a "sin atajos": el equipo de
// apoyo pedagógico (Decreto 1421 de 2017) tiene acceso institucional
// completo, sin importar el curso — es justamente su función en el colegio.
// Esta es la ÚNICA función del proyecto que debe otorgar ese acceso amplio;
// ningún otro lugar del código debe replicar esta lógica.
export async function canViewDiagnosis(
  session: Session,
  studentUserId: string
): Promise<boolean> {
  if (session.role === "orientador") return true;
  if (session.role === "docente") {
    return isTeacherAssignedToStudentCourse(session.userId, studentUserId);
  }
  return false;
}

export async function canViewPiarCompleto(
  session: Session,
  studentUserId: string
): Promise<boolean> {
  return canViewDiagnosis(session, studentUserId);
}

// Usada por lib/data/activities.ts: un docente solo puede crear/ver sus
// propias actividades para un curso+asignatura donde tiene una asignación
// real en course_teachers — no basta con ser docente en general, ni con
// estar asignado a ese curso en OTRA asignatura.
export async function isTeacherAssignedToCourseSubject(
  teacherUserId: string,
  courseId: string,
  subjectId: string
): Promise<boolean> {
  const row = await db
    .select({ id: courseTeachers.id })
    .from(courseTeachers)
    .where(
      and(
        eq(courseTeachers.teacherUserId, teacherUserId),
        eq(courseTeachers.courseId, courseId),
        eq(courseTeachers.subjectId, subjectId)
      )
    )
    .get();
  return Boolean(row);
}

// Relación acudiente-estudiante — usada por lib/data/students.ts para que un
// padre/acudiente solo pueda consultar datos de sus propios hijos vinculados
// en guardian_students, nunca de un studentUserId arbitrario.
export async function isGuardianOfStudent(
  guardianUserId: string,
  studentUserId: string
): Promise<boolean> {
  const row = await db
    .select({ id: guardianStudents.id })
    .from(guardianStudents)
    .where(
      and(
        eq(guardianStudents.guardianUserId, guardianUserId),
        eq(guardianStudents.studentUserId, studentUserId)
      )
    )
    .get();
  return Boolean(row);
}
