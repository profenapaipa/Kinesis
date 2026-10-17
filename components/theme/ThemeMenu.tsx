"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Monitor, Moon, Palette, Pipette, Sun, Type, X, type LucideIcon } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  ACCENT_PRESETS,
  CUSTOM_ACCENT,
  deriveCustomAccent,
  type ThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: ThemeMode; label: string; icon: LucideIcon }> = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
];

// Muestra los dos tonos de un color (claro arriba, oscuro abajo) para que se
// vea de una vez cómo queda en cada modo.
function Swatch({ light, dark, className }: { light: string; dark: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block size-8 shrink-0 rounded-full ring-1 ring-black/10", className)}
      style={{ background: `linear-gradient(135deg, ${light} 50%, ${dark} 50%)` }}
    />
  );
}

// Menú "Apariencia": modo claro/oscuro, color principal y tamaño de texto.
// `tone="hero"` es para ponerlo sobre el degradado (texto blanco); "auto"
// cambia solo, dentro del shell, según haya degradado o no (ver AppShell).
export function ThemeMenu({
  tone = "default",
  className,
}: {
  tone?: "default" | "hero" | "auto";
  className?: string;
}) {
  const { preferences, update } = useTheme();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const custom = preferences.custom;
  const isCustom = preferences.accent === CUSTOM_ACCENT;

  function chooseCustom(source: string) {
    const derived = deriveCustomAccent(source);
    if (derived) update({ accent: CUSTOM_ACCENT, custom: derived });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Apariencia: colores y modo claro u oscuro"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex size-10 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-3",
          tone === "hero"
            ? "bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white/60"
            : "bg-muted text-foreground hover:bg-accent focus-visible:ring-ring/50",
          tone === "auto" &&
            "group-has-[.kn-hero]/col:bg-white/15 group-has-[.kn-hero]/col:text-white group-has-[.kn-hero]/col:hover:bg-white/25"
        )}
      >
        <Palette className="size-5" />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Apariencia"
          className="kn-pop fixed inset-x-3 top-16 z-50 flex max-h-[calc(100vh-5rem)] flex-col gap-5 overflow-y-auto rounded-3xl border bg-popover p-5 text-popover-foreground shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-84"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-extrabold">Apariencia</p>
              <p className="text-xs text-muted-foreground">
                Se guarda en este dispositivo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="flex size-8 items-center justify-center rounded-lg bg-muted outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </button>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Modo
            </legend>
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
              {MODES.map(({ id, label, icon: Icon }) => {
                const active = preferences.mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ mode: id })}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Color principal
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_PRESETS.map((preset) => {
                const active = preferences.accent === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    title={preset.description}
                    onClick={() => update({ accent: preset.id })}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1 py-2.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "border-primary bg-primary/10" : "border-transparent bg-muted hover:border-border"
                    )}
                  >
                    <Swatch light={preset.light} dark={preset.dark} />
                    {preset.label}
                    {active && (
                      <Check className="absolute top-1.5 right-1.5 size-3.5 text-primary" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-2.5 transition-colors focus-within:ring-3 focus-within:ring-ring/50",
                isCustom ? "border-primary bg-primary/10" : "border-transparent bg-muted hover:border-border"
              )}
            >
              <span className="relative">
                {custom ? (
                  <Swatch light={custom.light} dark={custom.dark} />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <Pipette className="size-4" />
                  </span>
                )}
                <input
                  type="color"
                  value={custom?.source ?? "#1b7f56"}
                  onChange={(event) => chooseCustom(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Elegir un color personalizado"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">Personalizado</span>
                <span className="text-xs text-muted-foreground">
                  Ajustamos el tono para que botones y textos se lean bien.
                </span>
              </span>
            </label>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-muted p-3">
            <Type className="size-4 shrink-0" />
            <span className="flex-1 text-sm font-semibold">Texto más grande</span>
            <input
              type="checkbox"
              checked={preferences.largeText}
              onChange={(event) => update({ largeText: event.target.checked })}
              className="size-5 accent-(--primary)"
            />
          </label>
        </div>
      )}
    </div>
  );
}
