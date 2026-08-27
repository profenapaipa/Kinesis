import type { Metadata } from "next";
import { StudentRoster } from "@/components/StudentRoster";
import { requireRole } from "@/lib/auth/session";
import { listMyStudents } from "@/lib/data/students";

export const metadata: Metadata = {
  title: "Lista de estudiantes · Planeación Inclusiva",
};

export default async function EstudiantesPage() {
  const session = await requireRole("docente");
  const students = await listMyStudents(session);

  return <StudentRoster students={students} />;
}
