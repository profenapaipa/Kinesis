import {
  Activity,
  Atom,
  BookOpen,
  Church,
  Cpu,
  Globe2,
  HeartHandshake,
  Palette,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import type { SubjectId } from "@/types";

export interface Subject {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: LucideIcon;
  // Color de acento (fondo/ícono/borde) — nunca se usa como color de texto,
  // para no depender del color como único canal de identificación.
  color: string;
}

// Las 9 áreas obligatorias y fundamentales del currículo colombiano
// (Ley 115 de 1994, Artículo 23 — Ministerio de Educación Nacional).
export const MEN_SUBJECTS: Subject[] = [
  {
    id: "matematicas",
    name: "Matemáticas",
    shortName: "Matemáticas",
    icon: Sigma,
    color: "#2a78d6",
  },
  {
    id: "ciencias-naturales",
    name: "Ciencias Naturales y Educación Ambiental",
    shortName: "Ciencias Naturales",
    icon: Atom,
    color: "#1baf7a",
  },
  {
    id: "ciencias-sociales",
    name: "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
    shortName: "Ciencias Sociales",
    icon: Globe2,
    color: "#eb6834",
  },
  {
    id: "humanidades-lengua",
    name: "Humanidades, Lengua Castellana e Idiomas Extranjeros",
    shortName: "Lengua Castellana",
    icon: BookOpen,
    color: "#4a3aa7",
  },
  {
    id: "educacion-artistica",
    name: "Educación Artística y Cultural",
    shortName: "Ed. Artística",
    icon: Palette,
    color: "#e87ba4",
  },
  {
    id: "tecnologia-informatica",
    name: "Tecnología e Informática",
    shortName: "Tecnología",
    icon: Cpu,
    color: "#c98500",
  },
  {
    id: "educacion-fisica",
    name: "Educación Física, Recreación y Deporte",
    shortName: "Ed. Física",
    icon: Activity,
    color: "#008300",
  },
  {
    id: "etica-valores",
    name: "Educación Ética y en Valores Humanos",
    shortName: "Ética y Valores",
    icon: HeartHandshake,
    color: "#e34948",
  },
  {
    id: "educacion-religiosa",
    name: "Educación Religiosa",
    shortName: "Ed. Religiosa",
    icon: Church,
    color: "#8a6d3b",
  },
];

export function getSubject(id: SubjectId): Subject {
  const subject = MEN_SUBJECTS.find((item) => item.id === id);
  if (!subject) {
    throw new Error(`Asignatura no encontrada: ${id}`);
  }
  return subject;
}
