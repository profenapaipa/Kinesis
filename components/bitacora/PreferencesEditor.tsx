"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { LEARNING_PREFERENCE_LABEL } from "@/lib/studentFriendlyText";

// «Mi forma de aprender»: el estudiante marca lo que le gusta y se guarda al
// instante. Es SU voz: el docente y la familia la ven como «dijo que le
// gusta…», no como una etiqueta, y el docente puede observar otra cosa en la
// bitácora (las dos se muestran por separado).

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const OPTIONS = Object.keys(LEARNING_PREFERENCE_LABEL);

export function PreferencesEditor({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initial);
  const [status, setStatus] = useState<string | null>(null);

  async function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((value) => value !== option)
      : [...selected, option];
    setSelected(next);
    if (IS_DEMO) {
      setStatus("En la demostración esto no se guarda; en la aplicación real sí.");
      return;
    }
    const response = await fetch("/api/estudiante/preferencias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected: next }),
    });
    if (!response.ok) {
      setSelected(selected);
      setStatus("No se pudo guardar. Intenta de nuevo.");
      return;
    }
    setStatus("Guardado.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Cómo te gusta aprender">
        {OPTIONS.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                on
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-muted/60 text-foreground ring-border hover:bg-muted"
              }`}
            >
              {on && <Check className="size-4" aria-hidden />}
              {LEARNING_PREFERENCE_LABEL[option]}
            </button>
          );
        })}
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {status ?? "Puedes cambiarlo cuando quieras. Igual vas a aprender de muchas formas."}
      </p>
    </div>
  );
}
