"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  PenTool,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_HOME: Record<Role, string> = {
  docente: "/",
  administrador: "/admin",
  estudiante: "/estudiante",
  padre: "/padre",
  orientador: "/estudiantes",
};

const FLOATING_BADGES: Array<{ icon: LucideIcon; className: string; delay: string }> = [
  { icon: BookOpen, className: "left-[8%] top-[18%] animate-float-a", delay: "0s" },
  { icon: Star, className: "right-[10%] top-[24%] animate-float-b", delay: "0.6s" },
  { icon: PenTool, className: "left-[12%] bottom-[16%] animate-float-b", delay: "1.1s" },
  { icon: Sparkles, className: "right-[8%] bottom-[20%] animate-float-a", delay: "0.3s" },
];

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-(--palette-blue) via-(--palette-cream) to-(--palette-mint) px-4 py-10">
      {/* Manchas de color flotantes, decorativas */}
      <div
        aria-hidden
        className="animate-float-a pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-(--palette-blue) opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-b pointer-events-none absolute -right-24 top-1/3 size-80 rounded-full bg-(--palette-mint) opacity-50 blur-3xl"
        style={{ animationDelay: "0.8s" }}
      />
      <div
        aria-hidden
        className="animate-float-a pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-(--palette-gray) opacity-40 blur-3xl"
        style={{ animationDelay: "1.4s" }}
      />

      {/* Íconos flotantes, decorativos — ocultos en pantallas pequeñas para no saturar */}
      {FLOATING_BADGES.map(({ icon: Icon, className, delay }, index) => (
        <span
          key={index}
          aria-hidden
          className={cn(
            "pointer-events-none absolute hidden size-11 items-center justify-center rounded-2xl bg-white text-primary shadow-md ring-1 ring-black/5 md:flex",
            className
          )}
          style={{ animationDelay: delay }}
        >
          <Icon className="size-5" />
        </span>
      ))}

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="size-6" />
          </span>
          <h1 className="text-xl font-black tracking-tight">Planeación Inclusiva</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión con tu usuario y contraseña.
          </p>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="py-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-medium">
                  Usuario
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Demo: admin/admin123 · docente/docente123 · nombre.apellido/estudiante123 ·
          orientador.demo/orientador123
        </p>
      </div>
    </div>
  );
}
