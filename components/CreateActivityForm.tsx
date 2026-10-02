"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeacherCourseOption } from "@/lib/data/activities";
import type { SubjectId } from "@/types";

const INPUT_CLASS =
  "h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const TEXTAREA_CLASS =
  "rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateActivityForm({
  subjectId,
  courses,
}: {
  subjectId: SubjectId;
  courses: TeacherCourseOption[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.courseId ?? "");
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [instructions, setInstructions] = useState("");
  const [resources, setResources] = useState("");
  const [representationNotes, setRepresentationNotes] = useState("");
  const [expressionNotes, setExpressionNotes] = useState("");
  const [engagementNotes, setEngagementNotes] = useState("");
  const [evidenceRequested, setEvidenceRequested] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!courseId || !topic.trim() || !objective.trim() || !instructions.trim()) {
      setError("Tema, objetivo e instrucciones son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/docente/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          subjectId,
          topic: topic.trim(),
          objective: objective.trim(),
          instructions: instructions.trim(),
          resources: resources
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          representationNotes: representationNotes.trim() || undefined,
          expressionNotes: expressionNotes.trim() || undefined,
          engagementNotes: engagementNotes.trim() || undefined,
          evidenceRequested: evidenceRequested.trim() || undefined,
          scheduledDate: scheduledDate || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo crear la actividad.");
        return;
      }
      setTopic("");
      setObjective("");
      setInstructions("");
      setResources("");
      setRepresentationNotes("");
      setExpressionNotes("");
      setEngagementNotes("");
      setEvidenceRequested("");
      setScheduledDate("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {courses.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Curso</label>
                <Select value={courseId} onValueChange={(value) => value && setCourseId(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="scheduledDate">
                Fecha programada (opcional)
              </label>
              <input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="topic">
              Tema
            </label>
            <input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Ej. Sistemas de ecuaciones lineales 2x2"
              required
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="objective">
              Objetivo
            </label>
            <textarea
              id="objective"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={2}
              required
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="instructions">
              Instrucciones (una idea o paso por línea)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={4}
              required
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
            <p className="text-sm font-medium">
              Diseño para todo el curso{" "}
              <span className="font-normal text-muted-foreground">
                (opcional, pero vale la pena pensarlo antes de crear adaptaciones individuales)
              </span>
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground" htmlFor="representationNotes">
                ¿Cómo vas a presentar el contenido de más de una forma? (texto, imagen, video, material concreto...)
              </label>
              <textarea
                id="representationNotes"
                value={representationNotes}
                onChange={(event) => setRepresentationNotes(event.target.value)}
                rows={2}
                className={TEXTAREA_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground" htmlFor="expressionNotes">
                ¿De qué formas distintas podrán mostrar lo que aprendieron? (oral, escrito, dibujo, maqueta...)
              </label>
              <textarea
                id="expressionNotes"
                value={expressionNotes}
                onChange={(event) => setExpressionNotes(event.target.value)}
                rows={2}
                className={TEXTAREA_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground" htmlFor="engagementNotes">
                ¿Cómo vas a despertar o sostener el interés? (elección de tema, trabajo en equipo, relevancia real...)
              </label>
              <textarea
                id="engagementNotes"
                value={engagementNotes}
                onChange={(event) => setEngagementNotes(event.target.value)}
                rows={2}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="resources">
                Recursos (uno por línea, opcional)
              </label>
              <textarea
                id="resources"
                value={resources}
                onChange={(event) => setResources(event.target.value)}
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="evidenceRequested">
                Evidencia solicitada (opcional)
              </label>
              <textarea
                id="evidenceRequested"
                value={evidenceRequested}
                onChange={(event) => setEvidenceRequested(event.target.value)}
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? "Guardando..." : "Guardar actividad"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
