import { mockStudents } from "@/lib/mockData";
import { MEN_SUBJECTS } from "@/lib/subjects";
import type { StudentProgress } from "@/types";

// Hash determinístico (no usar Math.random: debe dar el mismo resultado en
// servidor y en cliente para evitar errores de hidratación).
function seededValue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000; // 0..1
}

function seededScore(seed: string, base: number, variance: number): number {
  const normalized = seededValue(seed); // 0..1
  const score = base + (normalized - 0.5) * 2 * variance;
  return Math.min(100, Math.max(40, Math.round(score)));
}

// Avance simulado por estudiante y asignatura. Determinístico (mismo
// resultado siempre) y sin relación con si el estudiante tiene PIAR o no,
// para no sugerir que un PIAR implica menor desempeño.
export const mockProgress: StudentProgress[] = mockStudents.flatMap((student) =>
  MEN_SUBJECTS.map((subject) => {
    const score = seededScore(`${student.id}-${subject.id}-actual`, 74, 20);
    const previousScore = seededScore(
      `${student.id}-${subject.id}-anterior`,
      score - 3,
      10
    );
    return {
      studentId: student.id,
      subject: subject.id,
      score,
      previousScore,
    };
  })
);

export function getStudentProgress(studentId: string): StudentProgress[] {
  return mockProgress.filter((entry) => entry.studentId === studentId);
}
