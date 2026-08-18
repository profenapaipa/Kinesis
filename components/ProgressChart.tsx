import { getStudentProgress } from "@/lib/progress";
import { MEN_SUBJECTS } from "@/lib/subjects";
import { cn } from "@/lib/utils";

// Barra horizontal de un solo color (magnitud, no identidad) — ver skill de
// dataviz: comparar magnitud entre categorías usa un solo tono (sequential),
// nunca un color distinto por barra.
const BAR_COLOR_CLASS = "bg-[#2a78d6] dark:bg-[#3987e5]";

function levelLabel(score: number): string {
  if (score >= 85) return "Sobresaliente";
  if (score >= 70) return "En progreso";
  if (score >= 55) return "Básico";
  return "Requiere apoyo";
}

export function ProgressChart({ studentId }: { studentId: string }) {
  const progress = getStudentProgress(studentId);
  const rows = MEN_SUBJECTS.map((subject) => {
    const entry = progress.find((item) => item.subject === subject.id);
    return {
      subject,
      score: entry?.score ?? 0,
      previousScore: entry?.previousScore ?? 0,
    };
  });

  return (
    <div className="flex flex-col gap-0.5">
      {rows.map(({ subject, score, previousScore }) => {
        const delta = score - previousScore;
        return (
          <div
            key={subject.id}
            tabIndex={0}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <span className="w-32 shrink-0 truncate text-xs text-muted-foreground">
              {subject.shortName}
            </span>
            <span
              className="relative h-3.5 flex-1 overflow-hidden rounded-[4px] bg-muted"
              role="img"
              aria-label={`${subject.name}: ${score}% de avance, ${levelLabel(score)}`}
            >
              <span
                className={cn("absolute inset-y-0 left-0 rounded-r-[4px]", BAR_COLOR_CLASS)}
                style={{ width: `${score}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">
              {score}%
            </span>
            <span
              className={cn(
                "w-12 shrink-0 text-right text-xs tabular-nums",
                delta > 0 ? "text-[#006300] dark:text-[#0ca30c]" : "text-muted-foreground"
              )}
            >
              {delta === 0 ? "—" : delta > 0 ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
