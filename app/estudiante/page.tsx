import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getMyPedagogicalSummary, getMyStudentProfile } from "@/lib/data/students";
import { mockLessonPlans } from "@/lib/mockData";
import { LEARNING_PREFERENCE_LABEL } from "@/lib/studentFriendlyText";
import { MEN_SUBJECTS } from "@/lib/subjects";

export default async function EstudiantePage() {
  const session = await requireRole("estudiante");
  const profile = await getMyStudentProfile(session);
  const pedagogical = await getMyPedagogicalSummary(session);
  const firstName = profile.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
        <p className="text-muted-foreground">
          {profile.grade ?? "Sin curso activo"}
          {profile.group ? ` · ${profile.group}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mis asignaturas</h2>
        <p className="text-sm text-muted-foreground">
          Entra a una asignatura para ver las actividades que cargó tu docente
          y tu prueba adaptada.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEN_SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const plan = mockLessonPlans.find(
              (item) => item.subject === subject.id && item.grade === profile.grade
            );

            const cardContent = (
              <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardContent className="flex items-start gap-3 py-4">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${subject.color}1a`,
                      color: subject.color,
                    }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{subject.shortName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {plan ? `Tema actual: ${plan.topic}` : "Sin planeación cargada"}
                    </span>
                  </div>
                  {plan && (
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  )}
                </CardContent>
              </Card>
            );

            return plan ? (
              <Link
                key={subject.id}
                href={`/estudiante/${subject.id}`}
                className="group focus-visible:outline-none"
              >
                {cardContent}
              </Link>
            ) : (
              <div key={subject.id} className="opacity-70">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Mis apoyos</h2>

        {pedagogical ? (
          <Card>
            <CardHeader>
              <CardTitle>Así te acompañamos en clase</CardTitle>
              <CardDescription>
                Estos son los apoyos que tu colegio tiene preparados para ti,
                de acuerdo con tu PIAR.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {pedagogical.effectiveSupports.some((support) => support.studentFriendlyText) && (
                <ul className="flex flex-col gap-2.5">
                  {pedagogical.effectiveSupports
                    .filter((support) => support.studentFriendlyText)
                    .map((support, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{support.studentFriendlyText}</span>
                      </li>
                    ))}
                </ul>
              )}

              {pedagogical.effectiveSupports.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Apoyos que puedes usar</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pedagogical.effectiveSupports.map((support, index) => (
                      <Badge key={index} variant="secondary">
                        {support.categoryName ?? support.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Actualmente no tienes un PIAR activo. Si tú o tu familia creen
              que podrías necesitar apoyos adicionales, hablen con el
              orientador o coordinador de tu colegio.
            </CardContent>
          </Card>
        )}
      </div>

      {profile.learningPreferences.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Tu forma de aprender</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.learningPreferences.map((option) => (
              <Badge key={option} variant="outline">
                {LEARNING_PREFERENCE_LABEL[option] ?? option}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
