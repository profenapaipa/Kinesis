import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DibujoPersonaje } from "./dibujos";
import { NOMBRE_PERSONAJE, type Emocion, type PersonajeId, type Pose } from "./tipos";

// PUNTO ÚNICO DE REEMPLAZO. Todo Kinesis usa a los personajes a través de
// <Personaje /> (o de <Vineta />, que lo envuelve). Si el equipo reemplaza el
// diseño por el definitivo de la plataforma, solo se toca `dibujos.tsx`; la
// firma de este componente copia la de `MT.mascotas.mascota(id, {...})`.

export function Personaje({
  id,
  pose = "base",
  emocion,
  tamano = 96,
  etiqueta,
  className,
}: {
  id: PersonajeId;
  pose?: Pose;
  /** Si falta, «celebra» y «piensa» traen la suya y el resto es «contento», como en la plataforma. */
  emocion?: Emocion;
  /** Ancho en px; el alto es el mismo (lienzo cuadrado). */
  tamano?: number;
  /** Texto alternativo. Sin él el dibujo es decorativo y se oculta a lectores de pantalla. */
  etiqueta?: string;
  className?: string;
}) {
  const idRecorte = `pj-${useId().replace(/:/g, "")}`;
  const emocionFinal: Emocion = emocion ?? (pose === "celebra" ? "celebra" : pose === "piensa" ? "pensando" : "contento");

  return (
    <svg
      viewBox="0 0 120 120"
      width={tamano}
      height={tamano}
      className={cn("pj block shrink-0", className)}
      role={etiqueta ? "img" : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      data-personaje={id}
      data-pose={pose}
      data-emocion={emocionFinal}
    >
      <DibujoPersonaje id={id} pose={pose} emocion={emocionFinal} idRecorte={idRecorte} />
    </svg>
  );
}

// Viñeta: un personaje que habla con un globo. `lado` decide de qué lado queda
// el personaje, para que dos viñetas seguidas se lean como una conversación.
// En celular el personaje se achica; el globo siempre ocupa el resto (min-w-0
// evita que un texto largo empuje la página hacia los lados).
export function Vineta({
  personaje,
  pose,
  emocion,
  lado = "izq",
  children,
  nombre,
  className,
}: {
  personaje: PersonajeId;
  pose?: Pose;
  emocion?: Emocion;
  lado?: "izq" | "der";
  children: ReactNode;
  /** Se muestra sobre el globo; por defecto, el nombre del personaje. */
  nombre?: string;
  className?: string;
}) {
  const quien = nombre ?? NOMBRE_PERSONAJE[personaje];
  return (
    <div className={cn("flex min-w-0 items-end gap-2.5 sm:gap-3", lado === "der" && "flex-row-reverse", className)}>
      <Personaje id={personaje} pose={pose} emocion={emocion} className="size-16 sm:size-24" tamano={96} />
      <div
        className={cn(
          "relative min-w-0 flex-1 rounded-3xl bg-card px-4 py-3 text-sm leading-relaxed shadow-card ring-1 ring-border",
          lado === "izq" ? "rounded-bl-md" : "rounded-br-md"
        )}
      >
        <p className="mb-0.5 text-xs font-extrabold tracking-wide text-primary uppercase">{quien}</p>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}

// Los hilos de los pendones de Sinapsis como recurso gráfico secundario: cuatro
// cuerdas onduladas de los colores del símbolo. Sirven de separador o de borde
// de una tarjeta sin repetir al pulpo en cada pantalla.
export function Hilos({ className }: { className?: string }) {
  const colores = ["#2A9D68", "#3F63C8", "#E9A02C", "#E4507F"];
  return (
    <svg
      viewBox="0 0 240 12"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block h-3 w-full", className)}
    >
      {colores.map((color, i) => (
        <path
          key={color}
          d={`M0 ${3 + i * 2} Q30 ${i % 2 ? 0 : 12} 60 ${3 + i * 2} T120 ${3 + i * 2} T180 ${3 + i * 2} T240 ${3 + i * 2}`}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// Símbolo de Sinapsis (disco de tinta con las piezas y los hilos). Es el de
// LOGOS_SINAPSIS/svg/simbolo_color.svg; tiene su propio disco oscuro, así que
// se lee igual en modo claro y oscuro.
export function SimboloSinapsis({ className, titulo }: { className?: string; titulo?: string }) {
  const id = `ss-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-8 shrink-0", className)}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <clipPath id={id}>
        <circle cx="32" cy="32" r="30" />
      </clipPath>
      <circle cx="32" cy="32" r="32" fill="#1A1714" />
      <g clipPath={`url(#${id})`}>
        <rect x="17" y="2" width="8" height="14" fill="#2A9D68" />
        <rect x="17" y="26" width="8" height="36" fill="#2A9D68" />
        <rect x="2" y="17" width="36" height="8" fill="#3F63C8" />
        <rect x="48" y="17" width="14" height="8" fill="#3F63C8" />
        <rect x="39" y="2" width="8" height="36" fill="#E9A02C" />
        <rect x="39" y="48" width="8" height="14" fill="#E9A02C" />
        <rect x="2" y="39" width="14" height="8" fill="#E4507F" />
        <rect x="26" y="39" width="36" height="8" fill="#E4507F" />
        <path
          fill="#FFFFFF"
          d="M14 2H18V18H2V14a12 12 0 0 1 12 -12ZM18 14h6v4h-6ZM24 2H40V18H24V2ZM36 18h4v6h-4ZM46 2H50a12 12 0 0 1 12 12V18H46V2ZM46 18h4v6h-4ZM2 24H18V40H2V24ZM18 24h6v4h-6ZM14 40h4v6h-4ZM24 24H40V40H24V24ZM24 40h4v6h-4ZM40 36h6v4h-6ZM46 24H62V40H46V24ZM2 46H18V62H14a12 12 0 0 1 -12 -12V46ZM24 46H40V62H24V46ZM40 46h6v4h-6ZM46 46H62V50a12 12 0 0 1 -12 12H46V46Z"
        />
      </g>
    </svg>
  );
}
