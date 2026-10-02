import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LEARNING_STYLE_LABEL } from "@/lib/adaptationEngine";
import { requireRole } from "@/lib/auth/session";
import { listLatestActivityPerSubject } from "@/lib/data/activities";
import {
  getChildPedagogicalSummary,
  getChildProfile,
  getGuardianChildren,
} from "@/lib/data/students";
import { MEN_SUBJECTS } from "@/lib/subjects";

export default async function PadrePage() {
  const session = await requireRole("padre");
  const children = await getGuardianChildren(session);
  const child = children[0];

  if (!child) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No tienes estudiantes vinculados a tu cuenta todavía. Si crees que
          esto es un error, comunícate con el colegio.
        </CardContent>
      </Card>
    );
  }

  const profile = await getChildProfile(session, child.studentUserId);
  const pedagogical = await getChildPedagogicalSummary(session, child.studentUserId);
  const latestActivityBySubject = profile.courseId
    ? await listLatestActivityPerSubject(profile.courseId)
    : new Map();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Seguimiento de {profile.fullName}
        </h1>
        <p className="text-muted-foreground">
          {profile.grade ?? "Sin curso activo"}
          {profile.group ? ` · ${profile.group}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Avance académico</CardTitle>
            <CardDescription>
              Seguimiento de {profile.fullName.split(" ")[0]} por asignatura.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-sm text-muted-foreground">
            El seguimiento de avance estará disponible próximamente.
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Asignaturas y temas actuales</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEN_SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const plan = latestActivityBySubject.get(subject.id);

            return (
              <Card key={subject.id} className="h-full">
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
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{subject.shortName}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan ? `Tema actual: ${plan.topic}` : "Sin planeación cargada"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Plan Individual de Ajustes Razonables</h2>

        {pedagogical ? (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>
                  {pedagogical.learningStyle
                    ? LEARNING_STYLE_LABEL[pedagogical.learningStyle]
                    : "PIAR activo"}
                </CardTitle>
                <CardDescription>PIAR activo y en seguimiento</CardDescription>
              </div>
              <Badge className="bg-amber-500 text-white dark:bg-amber-600">
                PIAR
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {pedagogical.effectiveSupports.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Ajustes aplicados en clase</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pedagogical.effectiveSupports.map((support, index) => (
                      <Badge key={index} variant="secondary">
                        {support.categoryName ?? support.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {pedagogical.effectiveSupports.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Cómo puedes ayudar en casa</p>
                  <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                    {pedagogical.effectiveSupports.map((support, index) => (
                      <li key={index}>{support.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pedagogical.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium">
                    Fortalezas de {profile.fullName.split(" ")[0]}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pedagogical.strengths.map((strength, index) => (
                      <Badge key={index} variant="outline">
                        {strength}
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
              {profile.fullName.split(" ")[0]} no tiene un PIAR activo
              actualmente. Si consideras que podría necesitar apoyos
              adicionales, puedes solicitar una valoración con el equipo de
              orientación del colegio.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
