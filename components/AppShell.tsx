"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Link2,
  LogOut,
  Shapes,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/brand/BrandMark";
import { DemoBanner } from "@/components/DemoBanner";
import { FictionalDataBanner } from "@/components/FictionalDataBanner";
import { useSession } from "@/components/SessionProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

// Modo demostración estática (GitHub Pages, ver scripts/build-demo.mjs): no
// hay sesión real que cerrar, así que la salida lleva al selector de rol. En
// el build real `NEXT_PUBLIC_DEMO` no existe y todo esto se elimina del bundle.
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const DEMO_ROOT = process.env.NEXT_PUBLIC_DEMO_ROOT ?? "/";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const DOCENTE_NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/planeacion", label: "Planeación", icon: ClipboardList },
  { href: "/generador", label: "Ajustes PIAR", icon: Sparkles },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
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
  orientador: [
    { href: "/orientacion", label: "Inicio", icon: LayoutDashboard },
    { href: "/estudiantes", label: "Estudiantes", icon: Users },
  ],
};

// El inicio de cada rol solo se marca en su propia ruta (si no, "/admin"
// quedaría encendido en todas las pantallas de administración); el resto se
// marca también en sus subrutas, p. ej. /planeacion/matematicas.
function isNavActive(pathname: string, href: string, home: string): boolean {
  if (href === home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

  const logoutLabel = IS_DEMO ? "Cambiar de rol" : "Cerrar sesión";

  async function handleLogout() {
    if (IS_DEMO) {
      window.location.href = DEMO_ROOT;
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-(--palette-blue) via-(--palette-cream) to-(--palette-mint) md:p-4">
      <div className="flex min-h-screen w-full md:min-h-0 md:overflow-hidden md:rounded-3xl md:shadow-xl md:ring-1 md:ring-black/5">
        {/* Barra lateral — escritorio */}
        <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
          <Link
            href={ROLE_HOME[session.role]}
            className="px-5 py-5"
            aria-label={`${BRAND.name}, ir a mi inicio`}
          >
            <BrandLockup />
          </Link>

          <nav className="flex flex-col gap-0.5 px-3">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href, ROLE_HOME[session.role]);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
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
              {logoutLabel}
            </Button>
          </div>
        </aside>

        {/* Columna principal */}
        <div className="flex min-h-screen flex-1 flex-col md:min-h-0">
          <DemoBanner />
          <FictionalDataBanner />

          <header className="sticky top-0 z-40 flex flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <Link href={ROLE_HOME[session.role]} className="flex items-center gap-2">
                <BrandMark className="size-8" />
                <span className="text-base font-black tracking-tight">{BRAND.name}</span>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label={logoutLabel}>
                <LogOut className="size-4" />
              </Button>
            </div>

            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {navItems.map((item) => {
                const isActive = isNavActive(pathname, item.href, ROLE_HOME[session.role]);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
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
