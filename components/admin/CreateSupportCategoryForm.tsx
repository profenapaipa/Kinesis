"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateSupportCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [studentFriendlyText, setStudentFriendlyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/support-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, studentFriendlyText }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo crear la categoría.");
        return;
      }
      setName("");
      setDescription("");
      setStudentFriendlyText("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear categoría de apoyo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="categoryName">
              Nombre
            </label>
            <input
              id="categoryName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Tiempos extendidos"
              required
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="categoryDescription">
              Descripción (para el profesor)
            </label>
            <input
              id="categoryDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="categoryFriendlyText">
              Texto para el estudiante (sin lenguaje clínico)
            </label>
            <input
              id="categoryFriendlyText"
              value={studentFriendlyText}
              onChange={(event) => setStudentFriendlyText(event.target.value)}
              required
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? "Creando..." : "Crear categoría"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
