import type { Metadata } from "next";
import { StudentRoster } from "@/components/StudentRoster";
import { requireRole } from "@/lib/auth/session";
import { listAllStudentsForSupport, listMyStudents } from "@/lib/data/students";

export const metadata: Metadata = {
  title: "Lista de estudiantes",
};

export default async function EstudiantesPage() {
  const session = await requireRole("docente", "orientador");
  const students =
    session.role === "orientador"
      ? await listAllStudentsForSupport(session)
      : await listMyStudents(session);

  return <StudentRoster students={students} />;
}
