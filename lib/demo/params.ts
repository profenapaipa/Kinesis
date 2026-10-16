// `generateStaticParams()` para las cuatro rutas dinámicas, usado SOLO por el
// build de la demostración estática: `scripts/build-demo.mjs` agrega al final
// de cada página dinámica un `export async function generateStaticParams()`
// que llama a la función correspondiente de este módulo.
//
// Regla de oro: cada lista se deriva de las MISMAS funciones de `lib/data/*`
// que la página usa para pintar sus enlaces. Así es imposible que un enlace
// apunte a una ruta que no se generó, o que se genere una ruta que la página
// jamás enlaza.
//
// Ninguna función aquí lanza ni llama a `notFound()`: cuando el rol del build
// no corresponde, devuelven `[]` (cero páginas). `generateStaticParams()`
// corre fuera del contexto de render, donde `notFound()` no es válido.

import { getSession } from "@/lib/auth/session";
import {
  listLatestActivityPerSubject,
  listMyActivities,
  listMySubjectsSummary,
} from "@/lib/data/activities";
import { getMyStudentProfile, listAllStudentsForSupport, listMyStudents } from "@/lib/data/students";
import type { Role } from "@/types";

async function sessionForRoles(...roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

// /estudiantes/[studentId] — mismo roster que pinta `app/estudiantes/page.tsx`
// (docente: solo sus cursos; orientador: todo el colegio).
export async function studentIdParams(): Promise<Array<{ studentId: string }>> {
  const session = await sessionForRoles("docente", "orientador");
  if (!session) return [];

  const students =
    session.role === "orientador"
      ? await listAllStudentsForSupport(session)
      : await listMyStudents(session);

  return students.map((student) => ({ studentId: student.studentUserId }));
}

// /planeacion/[subjectId] — `app/planeacion/page.tsx` solo enlaza las
// asignaturas asignadas al docente; el resto se pinta sin enlace.
export async function planeacionSubjectParams(): Promise<Array<{ subjectId: string }>> {
  const session = await sessionForRoles("docente");
  if (!session) return [];

  const summaries = await listMySubjectsSummary(session);
  return summaries
    .filter((summary) => summary.isAssigned)
    .map((summary) => ({ subjectId: summary.subjectId }));
}

// /estudiante/[subjectId] — `app/estudiante/page.tsx` solo enlaza las
// asignaturas que ya tienen al menos una actividad cargada en su curso.
export async function estudianteSubjectParams(): Promise<Array<{ subjectId: string }>> {
  const session = await sessionForRoles("estudiante");
  if (!session) return [];

  const profile = await getMyStudentProfile(session);
  if (!profile.courseId) return [];

  const latestBySubject = await listLatestActivityPerSubject(profile.courseId);
  return [...latestBySubject.keys()].map((subjectId) => ({ subjectId }));
}

// /generador/[activityId] — `components/AdjustmentsView.tsx` enlaza una
// pestaña por cada actividad del docente, con esta misma lista.
export async function generadorActivityParams(): Promise<Array<{ activityId: string }>> {
  const session = await sessionForRoles("docente");
  if (!session) return [];

  const activities = await listMyActivities(session);
  return activities.map((activity) => ({ activityId: activity.id }));
}
