import type { Metadata } from "next";
import { ActivateAcademicPeriodButton } from "@/components/admin/ActivateAcademicPeriodButton";
import { CreateAcademicPeriodForm } from "@/components/admin/CreateAcademicPeriodForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { listAcademicPeriods } from "@/lib/data/academicPeriods";

export const metadata: Metadata = { title: "Periodos académicos · Administración" };

export default async function AdminAcademicPeriodsPage() {
  const session = await requireSession();
  const periods = await listAcademicPeriods(session);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Periodos académicos</h1>
        <p className="text-muted-foreground">Solo un periodo puede estar activo a la vez.</p>
      </div>

      <CreateAcademicPeriodForm />

      <div className="flex flex-col gap-2">
        {periods.map((period) => (
          <Card key={period.id}>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{period.name}</span>
                  {period.isActive && <Badge>Activo</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {period.startDate} — {period.endDate}
                </span>
              </div>
              {!period.isActive && <ActivateAcademicPeriodButton periodId={period.id} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
