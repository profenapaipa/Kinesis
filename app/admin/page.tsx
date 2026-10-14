import type { Metadata } from "next";
import { AlertTriangle, ClipboardList, GraduationCap, Shapes, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/lib/data/adminDashboard";

export const metadata: Metadata = { title: "Administración · Planeación Inclusiva" };

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const stats = await getAdminDashboardStats(session);

  const tiles = [
    { label: "Estudiantes", value: stats.totalStudents, icon: Users },
    { label: "Con PIAR activo", value: stats.studentsWithPiar, icon: Sparkles },
    { label: "Profesores", value: stats.totalTeachers, icon: GraduationCap },
    { label: "Cursos", value: stats.totalCourses, icon: Shapes },
    { label: "Actividades activas", value: stats.activeActivities, icon: ClipboardList },
    { label: "Seguimientos pendientes", value: stats.pendingTracking, icon: AlertTriangle },
  ];

  const alerts = [
    stats.studentsWithoutEnrollment > 0
      ? `${stats.studentsWithoutEnrollment} estudiante(s) sin matrícula en ningún curso.`
      : null,
    stats.inactiveUsers > 0 ? `${stats.inactiveUsers} usuario(s) desactivado(s).` : null,
  ].filter((message): message is string => Boolean(message));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight">Resumen institucional</h1>
        <p className="text-muted-foreground">
          Vista general de la plataforma. No incluye información clínica ni PIAR
          detallado — eso está restringido según necesidad (ver Seguridad y permisos).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Card key={tile.label}>
              <CardContent className="flex flex-col gap-2 py-4">
                <Icon className="size-4 text-primary" />
                <span className="text-2xl font-extrabold tabular-nums text-primary">{tile.value}</span>
                <span className="text-xs text-muted-foreground">{tile.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Seguimientos pendientes</h2>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {stats.pendingTracking === 0
              ? "No hay actividades esperando registro de seguimiento."
              : `${stats.pendingTracking} actividad(es) con seguimiento pendiente de registrar.`}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Alertas administrativas</h2>
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No hay alertas pendientes.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <Card key={alert} className="border-amber-500/40 bg-amber-500/5">
                <CardContent className="flex items-center gap-2 py-3 text-sm">
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                  {alert}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
