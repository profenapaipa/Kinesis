"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callNiky, type NikyTask } from "@/lib/nikyBridge";

// Botón «Pídele a Niky»: la plataforma Sinapsis es quien tiene a Niky (la única
// IA), así que aquí solo se le avisa con un mensaje y es ella quien abre la
// conversación. Si Kinesis se abre solo, sin la plataforma, no hay a quién
// avisar: se dice con claridad en lugar de fingir una respuesta.

export function NikyButton({
  task,
  context,
  children,
  size = "sm",
}: {
  task: NikyTask;
  /** Texto corto y sin datos personales: nunca nombre ni correo del estudiante. */
  context?: string;
  children: React.ReactNode;
  size?: "sm" | "default";
}) {
  const [note, setNote] = useState<string | null>(null);

  function onClick() {
    const sent = callNiky(task, context);
    setNote(
      sent
        ? "Niky abrió la conversación en la plataforma."
        : "Niky vive en la plataforma Sinapsis. Ábrela desde allí para conversar con ella."
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <Button type="button" variant="outline" size={size} onClick={onClick}>
        <Sparkles className="size-4" aria-hidden />
        {children}
      </Button>
      {note && (
        <span role="status" className="max-w-xs text-xs text-muted-foreground">
          {note}
        </span>
      )}
    </span>
  );
}
