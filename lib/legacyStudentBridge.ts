import { mockStudents } from "@/lib/mockData";
import type { Student } from "@/types";

// Puente temporal: /estudiante y /padre todavía muestran contenido de
// lib/mockData.ts (se migran a datos reales en la fase Profesor/Estudiante
// de la hoja de ruta). db/seed.ts sembró los usuarios reales a partir de
// estos mismos registros, conservando el nombre completo — por eso se puede
// emparejar por fullName mientras dura la transición.
export function findMockStudentBySessionName(fullName: string): Student {
  return mockStudents.find((student) => student.fullName === fullName) ?? mockStudents[0];
}
