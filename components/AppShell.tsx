"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarRange,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Link2,
  LogOut,
  Shapes,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const DOCENTE_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/planeacion", label: "Planeación", icon: ClipboardList },
  { href: "/generador", label: "Generador PIAR", icon: Sparkles },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: Shapes },
  { href: "/admin/acudientes", label: "Acudientes", icon: Link2 },
  { href: "/admin/categorias-apoyo", label: "Categorías de apoyo", icon: Sparkles },
  { href: "/admin/periodos", label: "Periodos académicos", icon: CalendarRange },
];

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  docente: DOCENTE_NAV,
  administrador: ADMIN_NAV,
  estudiante: [{ href: "/estudiante", label: "Mi panel", icon: LayoutDashboard }],
  padre: [{ href: "/padre", label: "Mi panel", icon: LayoutDashboard }],
  orientador: [{ href: "/estudiantes", label: "Estudiantes", icon: Users }],
};

const ROLE_HOME: Record<Role, string> = {
  docente: "/",
  administrador: "/admin",
  estudiante: "/estudiante",
  padre: "/padre",
  orientador: "/estudiantes",
};

const ROLE_LABEL: Record<Role, string> = {
  docente: "Profesor",
  administrador: "Administrador",
  estudiante: "Estudiante",
  padre: "Padre / Madre",
  orientador: "Orientador/a",
};

function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "?";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_BY_ROLE[session.role];
  const displayName = session.fullName;
  const roleLabel = ROLE_LABEL[session.role];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-(--palette-blue) via-(--palette-cream) to-(--palette-mint) md:p-4">
      <div className="flex min-h-screen w-full md:min-h-0 md:overflow-hidden md:rounded-3xl md:shadow-xl md:ring-1 md:ring-black/5">
        {/* Barra lateral — escritorio */}
        <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
          <Link href={ROLE_HOME[session.role]} className="flex items-center gap-2 px-5 py-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Planeación Inclusiva</span>
              <span className="text-xs text-muted-foreground">PIAR · Áreas MEN</span>
            </span>
          </Link>

          <nav className="flex flex-col gap-0.5 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t p-4">
            <div className="flex items-center gap-2.5">
              <Avatar size="sm">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="justify-start gap-2">
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Columna principal */}
        <div className="flex min-h-screen flex-1 flex-col md:min-h-0">
          <header className="sticky top-0 z-40 flex flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <Link href={ROLE_HOME[session.role]} className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </span>
                <span className="text-sm font-semibold">Planeación Inclusiva</span>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Cerrar sesión">
                <LogOut className="size-4" />
              </Button>
            </div>

            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{roleLabel}</span>
              </div>
              <Avatar size="sm">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
