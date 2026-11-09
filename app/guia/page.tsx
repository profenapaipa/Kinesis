import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PanelCard, PanelHeader } from "@/components/panel/Panel";
import { requireSession } from "@/lib/auth/session";
import { GUIDE_BY_ROLE, GUIDE_CASES, STATUS_LABEL, type StepStatus } from "@/lib/guide/examples";
import { ROLE_LABEL } from "@/lib/roles";

export const metadata: Metadata = { title: "Guía por rol" };

// Guía por rol: cinco casos, los mismos de la exposición guiada de la
// plataforma Sinapsis, contados desde lo que ESTE rol puede hacer y con qué
// herramienta. Cada paso dice si ya funciona, si es nuevo o si todavía no
// existe: la guía no promete lo que Kinesis aún no hace.

const STATUS_STYLE: Record<StepStatus, string> = {
  hoy: "bg-muted text-foreground",
  nuevo: "bg-primary/15 text-primary",
  pronto: "bg-amber-100 text-amber-900",
};

export default async function GuiaPage() {
  const session = await requireSession();
  const examples = GUIDE_BY_ROLE[session.role];

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow={`Guía para ${ROLE_LABEL[session.role].toLowerCase()}`}
        title="Qué puedes hacer y con qué herramienta"
        description="Un caso principal de Tecnología y cinco casos más del aula, uno por asignatura. Cada uno muestra los pasos que te tocan a ti, con la pantalla donde se hacen."
        icon={<Compass className="size-6" aria-hidden />}
        footer={
          <nav
            aria-label="Casos"
            className="flex flex-wrap gap-2 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border"
          >
            {GUIDE_CASES.map((guideCase) => (
              <a
                key={guideCase.id}
                href={`#caso-${guideCase.id}`}
                className="rounded-full bg-muted/70 px-3.5 py-1.5 text-sm font-semibold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {guideCase.id === 6 ? "Principal" : guideCase.id}. {guideCase.subject}
              </a>
            ))}
          </nav>
        }
      />

      <ul className="flex flex-wrap gap-2 text-xs" aria-label="Qué significa cada etiqueta">
        {(Object.keys(STATUS_LABEL) as StepStatus[]).map((status) => (
          <li key={status} className={`rounded-full px-2.5 py-1 font-bold ${STATUS_STYLE[status]}`}>
            {STATUS_LABEL[status]}
            {status === "hoy" && ": ya estaba en Kinesis"}
            {status === "nuevo" && ": bitácora, documentos y «mi forma de aprender»"}
            {status === "pronto" && ": todavía no existe"}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-6">
        {GUIDE_CASES.map((guideCase, index) => {
          const example = examples[index];
          return (
            <PanelCard key={guideCase.id} className="scroll-mt-6">
              <div id={`caso-${guideCase.id}`} className="flex flex-col gap-4 scroll-mt-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                    {guideCase.id === 6 ? "Caso principal" : `Caso ${guideCase.id}`} · {guideCase.subject}
                  </p>
                  <h2 className="mt-0.5 text-xl font-black">{guideCase.activity}</h2>
                  <p className="text-sm text-muted-foreground">
                    Estudiante {guideCase.student} de la exposición. Apoyos del caso: {guideCase.supports}.
                  </p>
                </div>

                <p className="rounded-2xl bg-muted/50 px-4 py-3 text-sm">
                  <span className="font-bold">Situación: </span>
                  {example.situation}
                </p>

                <ol className="flex flex-col gap-2">
                  {example.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[step.status]}`}
                      >
                        {STATUS_LABEL[step.status]}
                      </span>
                      <span className="text-sm">
                        {step.text}
                        {step.href && (
                          <>
                            {" "}
                            <Link
                              href={step.href}
                              className="inline-flex items-center gap-0.5 font-semibold text-primary underline-offset-2 hover:underline"
                            >
                              Ir <ArrowRight className="size-3.5" aria-hidden />
                            </Link>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <p className="rounded-2xl bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
                    <span className="font-bold">Resultado: </span>
                    {example.result}
                  </p>
                  <p className="rounded-2xl bg-muted/50 px-4 py-3">
                    <span className="font-bold">Decides tú: </span>
                    {example.decides}
                  </p>
                </div>
              </div>
            </PanelCard>
          );
        })}
      </div>
    </div>
  );
}
