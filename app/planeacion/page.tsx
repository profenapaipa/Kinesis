import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listMySubjectsSummary } from "@/lib/data/activities";
import { MEN_SUBJECTS } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Planeación por asignatura · Planeación Inclusiva",
};

export default async function PlaneacionPage() {
  const session = await requireRole("docente");
  const summaries = await listMySubjectsSummary(session);
  const summaryBySubject = new Map(summaries.map((item) => [item.subjectId, item]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Planeación por asignatura</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona una asignatura para cargar o revisar tu planeación de
          clase, organizadas según las áreas obligatorias y fundamentales del
          MEN.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MEN_SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          const summary = summaryBySubject.get(subject.id);
          const isAssigned = summary?.isAssigned ?? false;

          const content = (
            <Card
              className={
                isAssigned
                  ? "h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring"
                  : "h-full opacity-60"
              }
            >
              <CardContent className="flex items-start justify-between gap-3 py-5">
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${subject.color}1a`,
                      color: subject.color,
                    }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{subject.name}</span>
                    {!isAssigned ? (
                      <Badge variant="outline" className="w-fit text-muted-foreground">
                        No asignada
                      </Badge>
                    ) : summary && summary.activityCount > 0 ? (
                      <Badge variant="secondary" className="w-fit">
                        {summary.activityCount} actividad
                        {summary.activityCount > 1 ? "es" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit text-muted-foreground">
                        Sin planeación cargada
                      </Badge>
                    )}
                  </div>
                </div>
                {isAssigned && (
                  <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
              </CardContent>
            </Card>
          );

          return isAssigned ? (
            <Link
              key={subject.id}
              href={`/planeacion/${subject.id}`}
              className="group focus-visible:outline-none"
            >
              {content}
            </Link>
          ) : (
            <div key={subject.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
