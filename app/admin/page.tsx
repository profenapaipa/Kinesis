import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Link2,
  Shapes,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NextStepCard, PanelHeader, SectionTitle, StatStrip } from "@/components/panel/Panel";
import { requireSession } from "@/lib/auth/session";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/lib/data/adminDashboard";

export const metadata: Metadata = { title: "Administración" };

// La administración monta la estructura (usuarios, cursos, vínculos,
// periodos) y no ve nada clínico. Su siguiente paso es siempre un hueco de
// esa estructura: un estudiante sin curso no le aparece a ningún docente.
function nextStep(stats: AdminDashboardStats) {
  if (stats.totalCourses === 0) {
    return {
      icon: Shapes,
      title: "Crea el primer curso",
      description: "Sin cursos no hay a quién asignar docentes ni estudiantes.",
      href: "/admin/cursos",
      cta: "Ir a cursos",
    };
  }
  if (stats.studentsWithoutEnrollment > 0) {
    return {
      icon: Users,
      title: `Matricula a ${stats.studentsWithoutEnrollment} estudiante(s) sin curso`,
      description: "Mientras no tengan curso, ningún docente los ve en su lista ni puede planear para ellos.",
      href: "/admin/cursos",
      cta: "Ir a cursos",
    };
  }
  return {
    icon: Link2,
    title: "Revisa los vínculos con las familias",
    description: "Cada acudiente vinculado puede seguir el resumen pedagógico de su hijo o hija.",
    href: "/admin/acudientes",
    cta: "Ir a acudientes",
  };
}

const SHORTCUTS: Array<{ href: string; label: string; description: string; icon: LucideIcon }> = [
  { href: "/admin/usuarios", label: "Usuarios", description: "Crear cuentas y activarlas o desactivarlas", icon: Users },
  { href: "/admin/cursos", label: "Cursos", description: "Grupos, docentes asignados y matrículas", icon: Shapes },
  { href: "/admin/acudientes", label: "Acudientes", description: "Quién es la familia de cada estudiante", icon: Link2 },
  { href: "/admin/categorias-apoyo", label: "Categorías de apoyo", description: "El catálogo de apoyos para el PIAR", icon: Sparkles },
  { href: "/admin/periodos", label: "Periodos académicos", description: "Qué periodo está activo", icon: CalendarRange },
];

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const stats = await getAdminDashboardStats(session);

  const alerts = [
    stats.studentsWithoutEnrollment > 0
      ? `${stats.studentsWithoutEnrollment} estudiante(s) sin matrícula en ningún curso.`
      : null,
    stats.inactiveUsers > 0 ? `${stats.inactiveUsers} usuario(s) desactivado(s).` : null,
    stats.pendingTracking > 0
      ? `${stats.pendingTracking} actividad(es) con seguimiento pendiente de registrar.`
      : null,
  ].filter((message): message is string => Boolean(message));

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Administración"
        title="Resumen institucional"
        description={
          <>
            La estructura del colegio en la plataforma. No incluye información
            clínica: el diagnóstico solo lo ven el docente asignado y el equipo
            de apoyo.
          </>
        }
        aside={<NextStepCard {...nextStep(stats)} />}
      />

      <StatStrip
        items={[
          { label: "Estudiantes", value: stats.totalStudents, hint: `${stats.studentsWithPiar} con PIAR` },
          { label: "Profesores", value: stats.totalTeachers },
          { label: "Cursos", value: stats.totalCourses },
          { label: "Actividades", value: stats.activeActivities, hint: "Creadas por los docentes" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="flex flex-col gap-3">
          <SectionTitle title="Gestionar" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SHORTCUTS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-bold">{label}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle title="Alertas" />
          {alerts.length === 0 ? (
            <p className="flex items-center gap-2 rounded-2xl bg-card p-4 text-sm ring-1 ring-foreground/10">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              No hay alertas pendientes.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {alerts.map((alert) => (
                <li
                  key={alert}
                  className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  {alert}
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-start gap-2 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Por diseño, el administrador no ve diagnósticos (Ley 1581 de 2012,
            datos sensibles). Tampoco escribas nombres ni diagnósticos en los
            catálogos, como las categorías de apoyo.
          </p>
        </section>
      </div>
    </div>
  );
}
