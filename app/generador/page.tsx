import type { Metadata } from "next";
import { AdaptationGenerator } from "@/components/AdaptationGenerator";
import { mockLessonPlans, mockStudents } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Generador PIAR · Planeación Inclusiva",
};

export default function GeneradorPage() {
  return <AdaptationGenerator plans={mockLessonPlans} students={mockStudents} />;
}
