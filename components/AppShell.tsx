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
import { ThemeMenu } from "@/components/theme/ThemeMenu";
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
  /** Para la barra inferior del celular, donde caben pocas letras. */
  shortLabel?: string;
  icon: LucideIcon;
}

const DOCENTE_NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/planeacion", label: "Planeación", icon: ClipboardList },
  { href: "/generador", label: "Ajustes PIAR", shortLabel: "Ajustes", icon: Sparkles },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: Shapes },
  { href: "/admin/acudientes", label: "Acudientes", icon: Link2 },
  { href: "/admin/categorias-apoyo", label: "Categorías de apoyo", shortLabel: "Apoyos", icon: Sparkles },
  { href: "/admin/periodos", label: "Periodos académicos", shortLabel: "Periodos", icon: CalendarRange },
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

  const home = ROLE_HOME[session.role];
  // Con una sola sección (estudiante, familia) la barra inferior no aporta.
  const showBottomNav = navItems.length > 1;

  return (
    <div className="min-h-screen w-full bg-background md:flex">
      {/* Barra lateral — escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 p-3 md:block">
        <div className="flex h-full flex-col rounded-3xl bg-sidebar shadow-card ring-1 ring-border">
          <Link href={home} className="px-5 py-5" aria-label={`${BRAND.name}, ir a mi inicio`}>
            <BrandLockup />
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href, home);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2.5 rounded-2xl bg-muted p-2.5">
              <Avatar size="sm">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="justify-start gap-2">
              <LogOut className="size-4" />
              {logoutLabel}
            </Button>
          </div>
        </div>
      </aside>

      {/* Columna principal */}
      {/* `@container`: el degradado de PanelHeader mide el ancho de esta
          columna con 100cqw. `group/col`: si la página trae encabezado en
          degradado (.kn-hero), la barra superior se pinta en blanco encima. */}
      <div className="group/col @container flex min-h-screen min-w-0 flex-1 flex-col">
        <DemoBanner />
        <FictionalDataBanner />

        <header className="relative z-30 flex h-16 items-center justify-between gap-3 px-4 text-foreground group-has-[.kn-hero]/col:text-white sm:px-6 lg:px-8">
          <Link href={home} className="flex items-center gap-2 md:hidden">
            <span className="rounded-[0.85rem] p-0.5 group-has-[.kn-hero]/col:bg-white">
              <BrandMark className="size-9" />
            </span>
            <span className="text-lg font-black tracking-tight">{BRAND.name}</span>
          </Link>
          <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-bold tracking-wide text-muted-foreground group-has-[.kn-hero]/col:bg-white/15 group-has-[.kn-hero]/col:text-white md:inline-flex">
            {roleLabel}
          </span>

          <div className="flex items-center gap-2">
            <ThemeMenu tone="auto" />
            <div className="hidden items-center gap-2.5 md:flex">
              <span className="text-sm font-semibold">{displayName}</span>
              <Avatar size="sm" className="ring-2 ring-white/70">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={logoutLabel}
              className="flex size-10 items-center justify-center rounded-xl bg-muted outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 group-has-[.kn-hero]/col:bg-white/15 group-has-[.kn-hero]/col:hover:bg-white/25 md:hidden"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 px-4 sm:px-6 lg:px-8",
            showBottomNav ? "pb-32 md:pb-10" : "pb-10"
          )}
        >
          <div className="kn-stagger mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Barra inferior flotante — celular */}
      {showBottomNav && (
        <nav
          aria-label="Navegación principal"
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto flex max-w-md gap-1 overflow-x-auto rounded-[1.75rem] border bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden"
        >
          {navItems.map((item) => {
            const isActive = isNavActive(pathname, item.href, home);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-14 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5 text-[0.7rem] font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
