"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ExternalLink, ListChecks, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import { NikyButton } from "@/components/NikyButton";
import { ProgressBar } from "@/components/panel/Panel";
import { Hilos, Personaje, SimboloSinapsis, Vineta, type PersonajeId } from "@/components/personajes";
import { TextoNiky } from "@/components/tour/TextoNiky";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { openGuidedTour, tourUrl } from "@/lib/nikyBridge";
import { RECORRIDOS } from "@/lib/tour/recorridos";
import { accionesDeNiky, describirPantalla } from "@/lib/tour/pantallas";
import { useRecorrido } from "@/lib/tour/estado";
import { NOMBRE_CASO, PASOS, TITULO_PASO, type Ejemplo, type RolRecorrido } from "@/lib/tour/tipos";
import { cn } from "@/lib/utils";

// Recorrido guiado de Kinesis por rol. NO es una presentación: la persona elige
// qué caso mirar, decide en cada paso, ve la consecuencia de cada opción, abre
// la pantalla real de Kinesis y vuelve. Todo el estado vive en el navegador
// (lib/tour/estado.ts) para funcionar en la demostración estática.
//
// Honestidad (la muestra busca inversionistas): cada caso es un EJEMPLO
// preparado de antemano. Nada se genera en el momento, Niky propone y quien
// enseña decide, nada se guarda sin que una persona lo confirme y no aparece
// información clínica.

const INTRO: Record<RolRecorrido, string> = {
  docente: "Vas a recorrer Kinesis como docente: planear una clase, ajustar y registrar lo que funciona.",
  orientador: "Vas a recorrer Kinesis como orientación: seguir un caso, acordar con el docente y la familia.",
  padre: "Vas a recorrer Kinesis como familia: entender qué se aprende y cómo acompañar en casa.",
  administrador: "Vas a recorrer Kinesis como coordinación: tener el colegio listo sin ver apoyos individuales.",
};

const ETIQUETA_ROL: Record<RolRecorrido, string> = {
  docente: "docente",
  orientador: "orientación",
  padre: "familia",
  administrador: "coordinación",
};

const TOTAL = PASOS.length;

function idCompanero(e: Ejemplo): PersonajeId {
  return e.companero.personaje === "Wisfox" ? "wisfox" : "kinesis";
}

export function Recorrido({ rol }: { rol: RolRecorrido }) {
  const { estado, cambiar, reiniciar } = useRecorrido();
  const ejemplos = RECORRIDOS[rol];
  // Un estado guardado por otro rol (se cambió con «Ver como») no vale aquí.
  const propio = estado.rol === rol;
  const ejemplo = propio ? (ejemplos.find((e) => e.id === estado.ejemplo) ?? null) : null;
  const paso = propio && ejemplo ? Math.min(Math.max(estado.paso, 0), TOTAL - 1) : 0;

  const encabezadoRef = useRef<HTMLHeadingElement>(null);
  const primeraVez = useRef(true);

  // Al llegar a esta pantalla ya no se está «fuera». Solo al montar: si se
  // vigilara el estado, al tocar «Ir a esa pantalla» este mismo efecto borraría
  // la marca antes de que la navegación termine y la banda de regreso no saldría.
  useEffect(() => {
    cambiar({ enPantalla: false });
  }, [cambiar]);

  // Al cambiar de paso el foco pasa al título del paso (lo anuncia el lector de
  // pantalla y el teclado sigue desde ahí). No se atrapa: Tab sale libremente.
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    encabezadoRef.current?.focus({ preventScroll: true });
    encabezadoRef.current?.scrollIntoView({ block: "start" });
  }, [paso, ejemplo?.id]);

  function abrir(id: string) {
    const sigue = estado.rol === rol && estado.ejemplo === id;
    cambiar({ rol, ejemplo: id, paso: sigue ? estado.paso : 0, enPantalla: false });
  }

  if (!ejemplo) {
    return (
      <Selector
        rol={rol}
        ejemplos={ejemplos}
        progreso={propio ? estado : null}
        alElegir={abrir}
      />
    );
  }

  const elecciones = estado.elecciones[ejemplo.id] ?? [null, null];
  const asignatura = NOMBRE_CASO[ejemplo.caso];
  const idPaso = PASOS[paso];
  const decisionActual = idPaso === "decision1" ? 0 : idPaso === "decision2" ? 1 : null;
  const sinElegir = decisionActual !== null && elecciones[decisionActual] == null;

  // Hasta dónde se puede saltar con los puntos: el caso y la primera decisión
  // siempre; la segunda decisión solo con la primera hecha; el resto, con las dos.
  const alcance = elecciones[0] == null ? 1 : elecciones[1] == null ? 2 : TOTAL - 1;

  function ir(nuevo: number) {
    cambiar({ rol, ejemplo: ejemplo!.id, paso: nuevo });
  }

  function elegir(indiceDecision: number, indiceOpcion: number) {
    const nuevas = [...elecciones];
    nuevas[indiceDecision] = indiceOpcion;
    cambiar({ rol, ejemplo: ejemplo!.id, elecciones: { ...estado.elecciones, [ejemplo!.id]: nuevas } });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera del caso y progreso */}
      <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => cambiar({ rol, ejemplo: null, paso: 0 })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ListChecks className="size-4" aria-hidden />
            Elegir otro caso
          </button>
          <p className="min-w-0 text-xs text-muted-foreground">
            {asignatura} · Estudiante {ejemplo.estudiante}
          </p>
        </div>
        <ProgressBar value={((paso + 1) / TOTAL) * 100} label={`Avance del recorrido: paso ${paso + 1} de ${TOTAL}`} />
        <ol className="flex items-center gap-1.5" aria-label="Pasos del recorrido">
          {PASOS.map((p, i) => (
            <li key={p} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => ir(i)}
                disabled={i > alcance}
                aria-current={i === paso ? "step" : undefined}
                aria-label={`Paso ${i + 1}: ${TITULO_PASO[p]}`}
                className={cn(
                  "h-2.5 w-full rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
                  i === paso ? "bg-primary" : i < paso ? "bg-primary/45" : "bg-muted"
                )}
              />
            </li>
          ))}
        </ol>
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          Paso {paso + 1} de {TOTAL} · {TITULO_PASO[idPaso]}
        </p>
      </div>

      <Hilos className="opacity-80" />

      {/* Contenido del paso. `key` reinicia la animación y los foco al cambiar. */}
      <section aria-labelledby="titulo-paso" className="flex min-w-0 flex-col gap-5">
        <h2
          id="titulo-paso"
          ref={encabezadoRef}
          tabIndex={-1}
          className="text-2xl font-black outline-none [overflow-wrap:anywhere] sm:text-3xl"
        >
          {idPaso === "caso" && ejemplo.titulo}
          {idPaso === "decision1" && ejemplo.decisiones[0].pregunta}
          {idPaso === "decision2" && ejemplo.decisiones[1].pregunta}
          {idPaso === "niky" && "Así respondería Niky en este caso"}
          {idPaso === "pantalla" && describirPantalla(rol, ejemplo.pantalla).nombre}
          {idPaso === "cierre" && "Recorriste este caso"}
        </h2>

        {idPaso === "caso" && (
          <>
            <Vineta personaje="sinapso" pose="senala" emocion="contento">
              {ejemplo.sinapso}
            </Vineta>
            <div className="rounded-3xl bg-muted/60 p-4 text-sm leading-relaxed sm:p-5">
              <p className="mb-1 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                La situación · caso de ejemplo
              </p>
              <p>{ejemplo.situacion}</p>
            </div>
            <Vineta personaje={idCompanero(ejemplo)} pose="saluda" emocion="animo" lado="der">
              {ejemplo.companero.linea}
            </Vineta>
          </>
        )}

        {decisionActual !== null && (
          <>
            <Vineta
              personaje="sinapso"
              pose={decisionActual === 0 ? "piensa" : "senala"}
              emocion={decisionActual === 0 ? "pensando" : "curioso"}
            >
              {decisionActual === 0
                ? "Tú decides. Elige el camino que tomarías y mira qué podría pasar. Puedes cambiar de opinión las veces que quieras."
                : "Una decisión más. Cada camino tiene su consecuencia: explora los dos si quieres."}
            </Vineta>
            <Decision
              decision={ejemplo.decisiones[decisionActual]}
              elegida={elecciones[decisionActual]}
              alElegir={(op) => elegir(decisionActual, op)}
            />
          </>
        )}

        {idPaso === "niky" && (
          <VentanaNiky
            rol={rol}
            ejemplo={ejemplo}
            asignatura={asignatura}
            acciones={estado.acciones}
            alResponder={(clave, valor) => cambiar({ acciones: { ...estado.acciones, [clave]: valor } })}
          />
        )}

        {idPaso === "pantalla" && (
          <PasoPantalla rol={rol} ejemplo={ejemplo} alIr={() => cambiar({ rol, ejemplo: ejemplo.id, paso, enPantalla: true })} />
        )}

        {idPaso === "cierre" && (
          <Cierre
            rol={rol}
            ejemplo={ejemplo}
            elecciones={elecciones}
            alRepetir={() => cambiar({ rol, ejemplo: ejemplo.id, paso: 0, elecciones: { ...estado.elecciones, [ejemplo.id]: [null, null] } })}
            alElegirOtro={() => cambiar({ rol, ejemplo: null, paso: 0 })}
            alReiniciar={reiniciar}
          />
        )}
      </section>

      {/* Navegación */}
      <nav aria-label="Anterior y siguiente" className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => (paso === 0 ? cambiar({ rol, ejemplo: null, paso: 0 }) : ir(paso - 1))}
        >
          <ArrowLeft aria-hidden />
          Atrás
        </Button>
        {paso < TOTAL - 1 && (
          <div className="flex min-w-0 flex-col items-end gap-1">
            <Button type="button" size="lg" disabled={sinElegir} onClick={() => ir(paso + 1)} aria-describedby={sinElegir ? "ayuda-siguiente" : undefined}>
              Siguiente
              <ArrowRight aria-hidden />
            </Button>
            {sinElegir && (
              <p id="ayuda-siguiente" className="text-xs text-muted-foreground">
                Elige una opción para seguir.
              </p>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Selector({
  rol,
  ejemplos,
  progreso,
  alElegir,
}: {
  rol: RolRecorrido;
  ejemplos: Ejemplo[];
  progreso: { ejemplo: string | null; paso: number; elecciones: Record<string, Array<number | null>> } | null;
  alElegir: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Vineta personaje="sinapso" pose="saluda" emocion="contento">
        <p>
          Hola, soy Sinapso y voy a guiarte. {INTRO[rol]}
        </p>
        <p className="mt-2">
          Son casos de ejemplo, preparados con anticipación. Tú eliges cuál mirar, decides en el camino y puedes abrir la
          pantalla real de Kinesis cuando quieras.
        </p>
      </Vineta>

      <Vineta personaje="kinesis" pose="base" emocion="animo" lado="der">
        Yo soy Kinesis, el pulpo de la plataforma. En cada caso te cuento qué ves en pantalla y para qué sirve.
      </Vineta>

      <Hilos />

      <div>
        <h2 className="text-xl font-black">Elige un caso</h2>
        <p className="text-sm text-muted-foreground">Cinco asignaturas, cinco situaciones distintas. Puedes recorrerlas todas.</p>
      </div>

      <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
        {ejemplos.map((e, i) => {
          const avance = progreso?.ejemplo === e.id ? progreso.paso : null;
          const hechas = (progreso?.elecciones[e.id] ?? []).filter((x) => x != null).length;
          return (
            <li key={e.id} className="min-w-0">
              <button
                type="button"
                onClick={() => alElegir(e.id)}
                className="flex h-full min-h-28 w-full min-w-0 flex-col items-start gap-2 rounded-3xl bg-card p-4 text-left shadow-card ring-1 ring-border outline-none transition-all hover:-translate-y-0.5 hover:ring-primary/50 focus-visible:ring-3 focus-visible:ring-ring/60 motion-reduce:hover:translate-y-0 sm:p-5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {i + 1}. {NOMBRE_CASO[e.caso]}
                  </span>
                  <span className="text-xs text-muted-foreground">Estudiante {e.estudiante}</span>
                </span>
                <span className="text-base font-extrabold [overflow-wrap:anywhere]">{e.titulo}</span>
                <span className="line-clamp-3 text-sm text-muted-foreground">{e.situacion}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-bold text-primary">
                  {avance != null && avance > 0 ? `Continuar en el paso ${avance + 1}` : hechas > 0 ? "Continuar" : "Empezar este caso"}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          En todos los casos los estudiantes se nombran solo con su código, no se muestra información clínica y Niky propone,
          pero quien enseña decide.
        </span>
      </p>

      <EnlacePlataforma rol={rol} />
    </div>
  );
}

function EnlacePlataforma({ rol }: { rol: string }) {
  // Segundo recorrido, el de la plataforma Sinapsis (el que cuenta el proyecto
  // completo). Es secundario: Kinesis ya tiene el suyo.
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <SimboloSinapsis className="size-6" />
      <span>¿Quieres ver el recorrido de toda la plataforma?</span>
      <a
        href={tourUrl()}
        target="_blank"
        rel="noopener"
        onClick={() => openGuidedTour(rol)}
        className="inline-flex items-center gap-1 font-bold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Abrir el recorrido de la plataforma
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </p>
  );
}

// ---------------------------------------------------------------------------

function Decision({
  decision,
  elegida,
  alElegir,
}: {
  decision: Ejemplo["decisiones"][number];
  elegida: number | null | undefined;
  alElegir: (indice: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={decision.pregunta} className="grid min-w-0 gap-3 sm:grid-cols-2">
        {decision.opciones.map((op, i) => {
          const activa = elegida === i;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={activa}
              onClick={() => alElegir(i)}
              className={cn(
                "flex min-h-14 min-w-0 items-start gap-3 rounded-3xl p-4 text-left text-sm font-semibold shadow-card outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/60 [overflow-wrap:anywhere]",
                activa ? "bg-primary text-primary-foreground ring-2 ring-primary" : "bg-card ring-1 ring-border hover:ring-primary/50"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-black",
                  activa ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {activa ? <Check className="size-3.5" /> : String.fromCharCode(65 + i)}
              </span>
              <span>{op.texto}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="min-h-16">
        {elegida != null ? (
          <div className="rounded-3xl border-2 border-dashed border-primary/50 bg-primary/8 p-4 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-extrabold tracking-wide text-primary uppercase">Lo que podría pasar</p>
            <p>{decision.opciones[elegida].resultado}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              ¿Y con la otra opción? Tócala y compara: aquí no hay una respuesta única.
            </p>
          </div>
        ) : (
          <p className="rounded-3xl bg-muted/50 p-4 text-sm text-muted-foreground">
            Toca una opción para ver qué podría pasar.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function VentanaNiky({
  rol,
  ejemplo,
  asignatura,
  acciones,
  alResponder,
}: {
  rol: RolRecorrido;
  ejemplo: Ejemplo;
  asignatura: string;
  acciones: Record<string, "aceptada" | "despues">;
  alResponder: (clave: string, valor: "aceptada" | "despues") => void;
}) {
  const propuestas = accionesDeNiky(rol, ejemplo, asignatura);
  return (
    <div className="flex flex-col gap-5">
      <Vineta personaje="niky" pose="piensa" emocion="curioso">
        Con lo que decidiste hasta aquí, esto es lo que te propondría. Es una respuesta preparada para este caso de ejemplo:
        yo propongo y tú decides.
      </Vineta>

      {/* Ventana de Niky: se parece a su conversación en la plataforma, pero aquí es un ejemplo fijo. */}
      <div className="overflow-hidden rounded-3xl bg-card shadow-card ring-1 ring-border">
        <div className="flex items-center gap-3 bg-primary/12 px-4 py-3">
          <Personaje id="niky" tamano={40} className="size-10" etiqueta="Niky, venado azul" emocion="contento" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold">Niky</p>
            <p className="text-xs text-muted-foreground">Respuesta de ejemplo para este caso</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-card px-2.5 py-1 text-[0.7rem] font-bold text-muted-foreground ring-1 ring-border">
            Ejemplo preparado
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <TextoNiky texto={ejemplo.niky.respuesta} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold">Niky también propone</h3>
        <ul className="flex flex-col gap-3">
          {propuestas.map((p, i) => {
            const clave = `${ejemplo.id}:${i}`;
            const estado = acciones[clave];
            return (
              <li key={clave} className="flex min-w-0 flex-col gap-2 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border">
                <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">
                  <strong className="font-bold">{p.etiqueta}</strong> {p.detalle}
                </p>
                {estado ? (
                  <p role="status" className="text-xs leading-relaxed text-muted-foreground">
                    {estado === "aceptada"
                      ? "Propuesta aceptada en este recorrido de ejemplo. En Kinesis quedaría como borrador hasta que la confirmes. Aquí no se guardó nada."
                      : "Queda para después. Niky no insiste ni hace nada por su cuenta."}{" "}
                    <button
                      type="button"
                      onClick={() => alResponder(clave, estado === "aceptada" ? "despues" : "aceptada")}
                      className="font-bold text-primary underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Cambiar
                    </button>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => alResponder(clave, "aceptada")}>
                      <Check aria-hidden />
                      Aceptar la propuesta
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => alResponder(clave, "despues")}>
                      Ahora no
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="flex flex-col gap-1.5 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Niky propone y quien enseña decide.
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Nada se guarda sin que una persona lo confirme.
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          No se muestra información clínica: el caso usa solo el código del estudiante.
        </li>
      </ul>

      <NikyButton task="explicar" context={ejemplo.titulo}>
        Conversar con Niky en la plataforma
      </NikyButton>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PasoPantalla({ rol, ejemplo, alIr }: { rol: RolRecorrido; ejemplo: Ejemplo; alIr: () => void }) {
  const d = describirPantalla(rol, ejemplo.pantalla);
  return (
    <div className="flex flex-col gap-5">
      <Vineta personaje="sinapso" pose="senala" emocion="animo">
        Ahora vamos a mirar dónde pasa esto en Kinesis. Te explico qué verás y, cuando quieras, te llevo a la pantalla real.
      </Vineta>

      <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border sm:p-5">
        <p className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">Qué verás ahí</p>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed">
          {d.queVes.map((t) => (
            <li key={t} className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 [overflow-wrap:anywhere]">{t}</span>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl bg-primary/10 p-3 text-sm">
          <strong className="font-bold">Prueba esto: </strong>
          {d.prueba}
        </p>
        <p className="text-xs text-muted-foreground">
          Son datos de ejemplo y en esta muestra nada se guarda. Desde allí, el botón «Volver al recorrido» te trae de regreso a
          este paso.
        </p>
        <div>
          <Link href={ejemplo.pantalla} onClick={alIr} className={cn(buttonVariants({ size: "lg" }), "max-w-full")}>
            Ir a esa pantalla
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Cierre({
  rol,
  ejemplo,
  elecciones,
  alRepetir,
  alElegirOtro,
  alReiniciar,
}: {
  rol: RolRecorrido;
  ejemplo: Ejemplo;
  elecciones: Array<number | null>;
  alRepetir: () => void;
  alElegirOtro: () => void;
  alReiniciar: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Vineta personaje="sinapso" pose="celebra" emocion="celebra">
        ¡Lo lograste! Recorriste «{ejemplo.titulo}» como {ETIQUETA_ROL[rol]}. Otra persona habría elegido distinto, y eso está bien.
      </Vineta>

      <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-card ring-1 ring-border sm:p-5">
        <p className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">Lo que decidiste</p>
        <ul className="flex flex-col gap-3 text-sm leading-relaxed">
          {ejemplo.decisiones.map((d, i) => {
            const e = elecciones[i];
            return (
              <li key={d.pregunta} className="min-w-0 [overflow-wrap:anywhere]">
                <span className="font-bold">{d.pregunta}</span>
                <br />
                {e != null ? (
                  <span>
                    {d.opciones[e].texto}. <span className="text-muted-foreground">{d.opciones[e].resultado}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Sin elegir: puedes volver atrás y probar un camino.</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <Vineta personaje="niky" pose="base" emocion="contento" lado="der">
        Recuerda: yo propongo, tú decides, y nada se guarda sin que lo confirmes.
      </Vineta>

      <Vineta personaje="wisfox" pose="saluda" emocion="animo">
        Del otro lado de la plataforma yo acompaño a los estudiantes en su propio portal. Pero esa es otra historia.
      </Vineta>

      <div className="flex flex-wrap gap-3">
        <Button type="button" size="lg" onClick={alElegirOtro}>
          <ListChecks aria-hidden />
          Elegir otro caso
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={alRepetir}>
          <RotateCcw aria-hidden />
          Repetir este caso
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={alReiniciar}>
          Borrar mi avance
        </Button>
      </div>

      <EnlacePlataforma rol={rol} />
    </div>
  );
}
