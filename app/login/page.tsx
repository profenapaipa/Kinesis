"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { ThemeMenu } from "@/components/theme/ThemeMenu";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { IS_FICTIONAL_DATA } from "@/lib/dataMode";
import { ROLE_HOME } from "@/lib/roles";
import type { Role } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push(ROLE_HOME[data.role as Role] ?? "/");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Encabezado en degradado, como la referencia final de diseño */}
      <header className="relative overflow-hidden rounded-b-[2.25rem] bg-hero px-5 pt-5 pb-28 text-white">
        <span
          aria-hidden
          className="kn-orb pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/8"
        />
        <span
          aria-hidden
          className="kn-orb pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-white/8 [animation-delay:-4s]"
        />

        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <span className="rounded-[0.9rem] bg-white p-0.5">
              <BrandMark className="size-10" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-black">{BRAND.name}</span>
              <span className="text-xs text-white/80">{BRAND.shortDescriptor}</span>
            </span>
          </span>
          <ThemeMenu tone="hero" />
        </div>

        <div className="relative mx-auto mt-10 flex max-w-md flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{BRAND.descriptor}</h1>
          <p className="text-white/85">{BRAND.tagline}</p>
        </div>
      </header>

      <main className="kn-stagger relative z-10 mx-auto -mt-20 w-full max-w-md px-4">
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Inicia sesión con el usuario y la contraseña que te dio el colegio.
              </p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-semibold text-muted-foreground">
                  Usuario
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="h-12 rounded-2xl border border-input bg-muted/60 px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-12 rounded-2xl border border-input bg-muted/60 px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </div>

          {IS_FICTIONAL_DATA && (
            <p
              role="note"
              className="rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-center text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <strong>Entorno de pruebas:</strong> todos los datos son ficticios.
              No escribas información real de estudiantes ni familias.
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {BRAND.origin}
            <br />
            Demo: admin/admin123 · docente/docente123 · nombre.apellido/estudiante123 ·
            orientador.demo/orientador123
          </p>
        </div>
      </main>
    </div>
  );
}
