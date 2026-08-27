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
import type { SafeUser } from "@/lib/data/users";

export function CreateGuardianLinkForm({
  guardians,
  students,
}: {
  guardians: SafeUser[];
  students: SafeUser[];
}) {
  const router = useRouter();
  const [guardianUserId, setGuardianUserId] = useState(guardians[0]?.id ?? "");
  const [studentUserId, setStudentUserId] = useState(students[0]?.id ?? "");
  const [relationship, setRelationship] = useState("");
  const [authorizedForDiagnosis, setAuthorizedForDiagnosis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!guardianUserId || !studentUserId || !relationship.trim()) {
      setError("Faltan datos por completar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/guardian-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianUserId,
          studentUserId,
          relationship: relationship.trim(),
          authorizedForDiagnosis,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo crear el vínculo.");
        return;
      }
      setRelationship("");
      setAuthorizedForDiagnosis(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (guardians.length === 0 || students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vincular acudiente con estudiante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Crea primero al menos un usuario con rol Padre/Madre y uno con rol
          Estudiante.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vincular acudiente con estudiante</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Acudiente</label>
            <Select
              value={guardianUserId}
              onValueChange={(value) => value && setGuardianUserId(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {guardians.map((guardian) => (
                  <SelectItem key={guardian.id} value={guardian.id}>
                    {guardian.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Estudiante</label>
            <Select
              value={studentUserId}
              onValueChange={(value) => value && setStudentUserId(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="relationship">
              Parentesco
            </label>
            <input
              id="relationship"
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Ej. Madre, Padre, Acudiente"
              required
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex items-center gap-2 pb-1.5">
            <input
              id="authorizedForDiagnosis"
              type="checkbox"
              checked={authorizedForDiagnosis}
              onChange={(event) => setAuthorizedForDiagnosis(event.target.checked)}
              className="size-4 rounded border-input"
            />
            <label htmlFor="authorizedForDiagnosis" className="text-sm text-muted-foreground">
              Autorizado para diagnóstico
            </label>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Vinculando..." : "Vincular"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          "Autorizado para diagnóstico" solo registra el dato — hoy no le da
          acceso a ninguna información clínica; esa información sigue
          restringida al docente asignado.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
