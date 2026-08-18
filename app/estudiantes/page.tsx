import type { Metadata } from "next";
import { StudentRoster } from "@/components/StudentRoster";

export const metadata: Metadata = {
  title: "Lista de estudiantes · Planeación Inclusiva",
};

export default function EstudiantesPage() {
  return <StudentRoster />;
}
