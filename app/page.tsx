import Link from "next/link";
import { ClipboardList, Sparkles, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockLessonPlans, mockStudents } from "@/lib/mockData";
import { MEN_SUBJECTS } from "@/lib/subjects";

const piarCount = mockStudents.filter((student) => student.hasPiar).length;
const subjectsWithPlan = new Set(mockLessonPlans.map((plan) => plan.subject)).size;

const stats = [
  { label: "Estudiantes registrados", value: String(mockStudents.length) },
  { label: "Con PIAR activo", value: String(piarCount) },
  { label: "Planeaciones cargadas", value: String(mockLessonPlans.length) },
  {
    label: "Asignaturas con planeación",
    value: `${subjectsWithPlan}/${MEN_SUBJECTS.length}`,
  },
];

const navigationCards = [
  {
    href: "/estudiantes",
    icon: Users,
    title: "Lista de estudiantes",
    description: `Consulta los ${mockStudents.length} estudiantes registrados y visualiza quiénes cuentan con un PIAR activo.`,
  },
  {
    href: "/planeacion",
    icon: ClipboardList,
    title: "Cargar planeación",
    description:
      "Sube o revisa la planeación general de cada asignatura para cruzarla con los perfiles PIAR.",
  },
  {
    href: "/generador",
    icon: Sparkles,
    title: "Generador PIAR",
    description: `Genera automáticamente adaptaciones curriculares y recursos para los ${piarCount} estudiantes con PIAR.`,
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido/a, docente
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Cruza tu planeación general con la base de datos de estudiantes,
          identifica quiénes tienen PIAR y genera adaptaciones curriculares y
          recursos específicos de forma automática.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-1 py-4">
              <span className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navigationCards.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group focus-visible:outline-none">
            <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Asignaturas (áreas del MEN)</h2>
          <p className="text-sm text-muted-foreground">
            Organización curricular según las áreas obligatorias y
            fundamentales de la Ley 115 de 1994.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEN_SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const count = mockLessonPlans.filter(
              (plan) => plan.subject === subject.id
            ).length;
            return (
              <Link
                key={subject.id}
                href={`/planeacion/${subject.id}`}
                className="group focus-visible:outline-none"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardContent className="flex items-center gap-3 py-4">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${subject.color}1a`,
                        color: subject.color,
                      }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {subject.shortName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count > 0
                          ? `${count} planeación${count > 1 ? "es" : ""}`
                          : "Sin planeación"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
