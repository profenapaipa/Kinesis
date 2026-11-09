import type { ReactNode } from "react";
import type { Emocion, PersonajeId, Pose } from "./tipos";

// Único lugar que sabe DIBUJAR a los cuatro personajes: vectores planos, un
// solo contorno y la misma cara, lienzo de 120 x 120 (igual que la plataforma).
//
// Decisiones de diseño, para quien las retome:
// - Cada personaje va sobre una «baldosa» redonda del color de la tarjeta del
//   entorno (blanca en claro, #13201A en oscuro): así la figura no depende del
//   degradado verde del encabezado, que va de #032214 a #5fbf81 y no admite un
//   solo contorno. En oscuro se añade un halo crema #F4F0E8 (ver .pj-fig en
//   globals.css), como propone reportes/mascotas-contraste.md.
// - Los colores son fijos por personaje (son su identidad); el verde de la
//   marca de Kinesis aparece en la bufanda del oso, que es quien guía todo.
// - Sin degradados. La cara es una sola función: lo que cambia entre animales
//   es lo que va debajo (orejas, hocico, cuernos, tentáculos).

// Contorno fijo, igual en claro y oscuro (reportes/mascotas-contraste.md): con
// la tinta variable, en oscuro las líneas interiores quedaban crema sobre
// relleno claro (1,6 a 2:1). Fija, separa siempre (3,9 a 9,6:1).
const TINTA = "#1A1714";
const BRILLO = "#ffffff";
const BOCA = "#7a2f2f";

interface Paleta {
  piel: string;
  piel2: string;
  claro: string;
  extra: string;
}

const PALETA: Record<PersonajeId, Paleta> = {
  sinapso: { piel: "#7b5238", piel2: "#5c3d29", claro: "#f1dfbf", extra: "#1b7f56" },
  kinesis: { piel: "#2f9e88", piel2: "#217a69", claro: "#c4eadf", extra: "#e9a02c" },
  wisfox: { piel: "#ea8a3c", piel2: "#c36a21", claro: "#fdf1de", extra: "#fffaf0" },
  niky: { piel: "#5b8def", piel2: "#3b6ccc", claro: "#dce9ff", extra: "#e9b64b" },
};

// ---- Brazos por pose --------------------------------------------------------

interface Brazo {
  d: string;
  mano: [number, number];
}
interface Brazos {
  izq: Brazo;
  der: Brazo;
}

const BASE: Brazos = {
  izq: { d: "M40 92 Q31 100 34 111", mano: [34, 111] },
  der: { d: "M80 92 Q89 100 86 111", mano: [86, 111] },
};

const BRAZOS: Record<Pose, Brazos> = {
  base: BASE,
  saluda: { izq: BASE.izq, der: { d: "M80 90 Q97 84 96 62", mano: [96, 62] } },
  senala: { izq: BASE.izq, der: { d: "M80 92 Q99 93 111 80", mano: [111, 80] } },
  piensa: { izq: BASE.izq, der: { d: "M80 93 Q93 88 75 77", mano: [75, 77] } },
  celebra: {
    izq: { d: "M40 90 Q23 80 25 57", mano: [25, 57] },
    der: { d: "M80 90 Q97 80 95 57", mano: [95, 57] },
  },
};

function Extremidad({ d, color, ancho = 5 }: { d: string; color: string; ancho?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={TINTA} strokeWidth={ancho + 4} />
      <path d={d} stroke={color} strokeWidth={ancho} />
    </g>
  );
}

function ParDeBrazos({ pose, color }: { pose: Pose; color: string }) {
  const { izq, der } = BRAZOS[pose];
  return (
    <g>
      <Extremidad d={izq.d} color={color} />
      <Extremidad d={der.d} color={color} />
      {[izq, der].map((b, i) => (
        <circle key={i} cx={b.mano[0]} cy={b.mano[1]} r={5.2} fill={color} stroke={TINTA} strokeWidth={2.4} />
      ))}
    </g>
  );
}

// ---- Cara (compartida) ------------------------------------------------------

function Cara({ ojosY, emocion, mejillas }: { ojosY: number; emocion: Emocion; mejillas: string }) {
  const ey = ojosY;
  const my = ey + 15;
  const [lx, rx] = [49, 71];
  const trazo = { stroke: TINTA, strokeWidth: 2.4, strokeLinecap: "round" as const, fill: "none" };
  const ojo = (cx: number, cy: number, r = 3.3) => (
    <g key={cx}>
      <circle cx={cx} cy={cy} r={r} fill={TINTA} />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.35} r={r * 0.32} fill={BRILLO} />
    </g>
  );

  let contenido: ReactNode;
  switch (emocion) {
    case "curioso":
      contenido = (
        <>
          {ojo(lx, ey)}
          {ojo(rx, ey, 3.8)}
          <path {...trazo} d={`M${lx - 5} ${ey - 8} L${lx + 4} ${ey - 9}`} />
          <path {...trazo} d={`M${rx - 4} ${ey - 11} Q${rx + 2} ${ey - 15} ${rx + 6} ${ey - 11}`} />
          <path {...trazo} d={`M55 ${my + 1} Q61 ${my + 5} 66 ${my - 1}`} />
        </>
      );
      break;
    case "pensando":
      contenido = (
        <>
          {ojo(lx + 2, ey - 1, 3)}
          {ojo(rx + 2, ey - 1, 3)}
          <path {...trazo} d={`M${lx - 3} ${ey - 9} L${lx + 6} ${ey - 8}`} />
          <path {...trazo} d={`M${rx - 2} ${ey - 8} L${rx + 7} ${ey - 9}`} />
          <path {...trazo} d={`M54 ${my + 2} L65 ${my + 1}`} />
        </>
      );
      break;
    case "celebra":
      contenido = (
        <>
          <g {...trazo}>
            <path d={`M${lx - 5} ${ey + 1} Q${lx} ${ey - 6} ${lx + 5} ${ey + 1}`} />
            <path d={`M${rx - 5} ${ey + 1} Q${rx} ${ey - 6} ${rx + 5} ${ey + 1}`} />
          </g>
          <path
            d={`M50 ${my - 1} Q60 ${my + 13} 70 ${my - 1} Z`}
            fill={BOCA}
            stroke={TINTA}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case "animo":
      contenido = (
        <>
          {ojo(lx, ey)}
          {ojo(rx, ey)}
          <path {...trazo} d={`M${lx - 6} ${ey - 8} L${lx + 4} ${ey - 11}`} />
          <path {...trazo} d={`M${rx - 4} ${ey - 11} L${rx + 6} ${ey - 8}`} />
          <path {...trazo} d={`M51 ${my} Q60 ${my + 10} 69 ${my}`} />
        </>
      );
      break;
    case "sorprendido":
      contenido = (
        <>
          {ojo(lx, ey, 4.3)}
          {ojo(rx, ey, 4.3)}
          <path {...trazo} d={`M${lx - 5} ${ey - 10} Q${lx} ${ey - 14} ${lx + 5} ${ey - 10}`} />
          <path {...trazo} d={`M${rx - 5} ${ey - 10} Q${rx} ${ey - 14} ${rx + 5} ${ey - 10}`} />
          <ellipse cx={60} cy={my + 3} rx={4.4} ry={5.4} fill={BOCA} stroke={TINTA} strokeWidth={2} />
        </>
      );
      break;
    case "duda":
      contenido = (
        <>
          {ojo(lx, ey, 3)}
          {ojo(rx, ey, 3)}
          <path {...trazo} d={`M${lx - 5} ${ey - 11} L${lx + 5} ${ey - 8}`} />
          <path {...trazo} d={`M${rx - 5} ${ey - 8} L${rx + 5} ${ey - 9}`} />
          <path {...trazo} d={`M53 ${my + 2} Q57 ${my - 2} 61 ${my + 2} T68 ${my + 1}`} />
        </>
      );
      break;
    case "contento":
    default:
      contenido = (
        <>
          {ojo(lx, ey)}
          {ojo(rx, ey)}
          <path {...trazo} d={`M52 ${my} Q60 ${my + 8} 68 ${my}`} />
        </>
      );
  }

  return (
    <g>
      <circle cx={40} cy={ey + 9} r={4.2} fill={mejillas} opacity={0.55} />
      <circle cx={80} cy={ey + 9} r={4.2} fill={mejillas} opacity={0.55} />
      {contenido}
    </g>
  );
}

// ---- Los cuatro -------------------------------------------------------------

interface Props {
  pose: Pose;
  emocion: Emocion;
}

function Sinapso({ pose, emocion }: Props) {
  const c = PALETA.sinapso;
  const ey = 52;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx={60} cy={100} rx={25} ry={20} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={102} rx={14} ry={12} fill={c.claro} opacity={0.9} />
      {/* orejas */}
      <circle cx={33} cy={29} r={10} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <circle cx={33} cy={29} r={5} fill={c.claro} />
      <circle cx={87} cy={29} r={10} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <circle cx={87} cy={29} r={5} fill={c.claro} />
      <ellipse cx={60} cy={54} rx={31} ry={28} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      {/* anteojos: dos anillos claros y separados, como las manchas del oso de anteojos */}
      <circle cx={49} cy={ey} r={11} fill={c.claro} stroke={TINTA} strokeWidth={2.6} />
      <circle cx={71} cy={ey} r={11} fill={c.claro} stroke={TINTA} strokeWidth={2.6} />
      <ellipse cx={60} cy={67} rx={13} ry={9.5} fill={c.claro} stroke={TINTA} strokeWidth={2} />
      <ellipse cx={60} cy={62.5} rx={4.6} ry={3.2} fill={TINTA} />
      <Cara ojosY={ey} emocion={emocion} mejillas="#e9806f" />
      {/* bufanda verde: el hilo que une al guía con el resto de la marca */}
      <path d="M44 83 Q60 92 76 83" fill="none" stroke={TINTA} strokeWidth={9} />
      <path d="M44 83 Q60 92 76 83" fill="none" stroke={c.extra} strokeWidth={5.4} />
      <ParDeBrazos pose={pose} color={c.piel} />
    </g>
  );
}

function Kinesis({ pose, emocion }: Props) {
  const c = PALETA.kinesis;
  const ey = 52;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* dos tentáculos del centro; los de los lados hacen de brazos según la pose */}
      {/* tentáculos de los lados, enroscados: son lo que distingue al pulpo de una tortuga */}
      <Extremidad d="M42 94 Q20 98 24 112 Q28 119 35 113" color={c.piel} ancho={8} />
      <Extremidad d="M78 94 Q100 98 96 112 Q92 119 85 113" color={c.piel} ancho={8} />
      <Extremidad d="M52 90 Q44 106 54 114 Q59 117 61 111" color={c.piel} ancho={8} />
      <Extremidad d="M68 90 Q76 106 66 114 Q61 117 59 111" color={c.piel} ancho={8} />
      <ellipse cx={60} cy={92} rx={22} ry={12} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={50} rx={32} ry={32} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <circle cx={42} cy={28} r={3.2} fill={c.claro} />
      <circle cx={52} cy={22} r={2.2} fill={c.claro} />
      <circle cx={80} cy={30} r={2.8} fill={c.claro} />
      <ellipse cx={60} cy={67} rx={17} ry={10} fill={c.claro} opacity={0.5} />
      <Cara ojosY={ey} emocion={emocion} mejillas="#f08f8f" />
      <ParDeBrazos pose={pose} color={c.piel} />
    </g>
  );
}

function Wisfox({ pose, emocion }: Props) {
  const c = PALETA.wisfox;
  const ey = 53;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* cola con la punta clara */}
      <path d="M82 104 Q108 106 104 80 Q96 92 84 92 Z" fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <path d="M104 80 Q106 92 96 99 Q103 97 104.5 90 Z" fill={c.extra} />
      <ellipse cx={60} cy={100} rx={24} ry={20} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={103} rx={13} ry={12} fill={c.claro} />
      {/* orejas en punta */}
      <path d="M31 46 L30 14 L52 30 Z" fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <path d="M36 38 L36 24 L46 31 Z" fill={c.piel2} />
      <path d="M89 46 L90 14 L68 30 Z" fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <path d="M84 38 L84 24 L74 31 Z" fill={c.piel2} />
      <ellipse cx={60} cy={55} rx={33} ry={27} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      {/* antifaz claro de zorro: de las mejillas al hocico */}
      <path d="M27 58 Q40 70 60 64 Q80 70 93 58 Q84 82 60 82 Q36 82 27 58 Z" fill={c.claro} />
      <path d="M27 58 Q36 82 60 82 Q84 82 93 58" fill="none" stroke={TINTA} strokeWidth={3} />
      <path d="M55 62 L65 62 L60 68 Z" fill={TINTA} />
      <Cara ojosY={ey} emocion={emocion} mejillas="#f08f6f" />
      <ParDeBrazos pose={pose} color={c.piel} />
    </g>
  );
}

function Niky({ pose, emocion }: Props) {
  const c = PALETA.niky;
  const ey = 54;
  const cuernoIzq = "M45 30 Q40 16 30 12 M40 22 Q34 22 29 26 M44 27 L46 10";
  const cuernoDer = "M75 30 Q80 16 90 12 M80 22 Q86 22 91 26 M76 27 L74 10";
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx={60} cy={100} rx={23} ry={20} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={103} rx={12} ry={12} fill={c.claro} />
      {/* cuernos con una chispa: la ayuda que propone, no la que decide */}
      <path d={cuernoIzq} fill="none" stroke={TINTA} strokeWidth={7} />
      <path d={cuernoIzq} fill="none" stroke={c.extra} strokeWidth={3.4} />
      <path d={cuernoDer} fill="none" stroke={TINTA} strokeWidth={7} />
      <path d={cuernoDer} fill="none" stroke={c.extra} strokeWidth={3.4} />
      <path
        d="M96 4 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6 Z"
        fill={c.extra}
        stroke={TINTA}
        strokeWidth={1.2}
      />
      <ellipse cx={31} cy={44} rx={9} ry={5.5} transform="rotate(-28 31 44)" fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={89} cy={44} rx={9} ry={5.5} transform="rotate(28 89 44)" fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={57} rx={28} ry={29} fill={c.piel} stroke={TINTA} strokeWidth={3} />
      <ellipse cx={60} cy={71} rx={15} ry={10.5} fill={c.claro} stroke={TINTA} strokeWidth={2} />
      <ellipse cx={60} cy={66} rx={4.4} ry={3} fill={TINTA} />
      <circle cx={52} cy={38} r={2} fill={c.claro} />
      <circle cx={60} cy={34} r={2.4} fill={c.claro} />
      <circle cx={68} cy={38} r={2} fill={c.claro} />
      <Cara ojosY={ey} emocion={emocion} mejillas="#f4a0a0" />
      <ParDeBrazos pose={pose} color={c.piel} />
    </g>
  );
}

const DIBUJOS: Record<PersonajeId, (p: Props) => ReactNode> = {
  sinapso: Sinapso,
  kinesis: Kinesis,
  wisfox: Wisfox,
  niky: Niky,
};

// Confeti para la pose «celebra», en los colores de los hilos de Sinapsis (no
// en los del personaje) para no competir con él.
function Confeti() {
  return (
    <g strokeLinecap="round">
      <path d="M14 22 l5 5 M19 22 l-5 5" stroke="#E4507F" strokeWidth={2.4} />
      <path d="M102 14 l5 5 M107 14 l-5 5" stroke="#3F63C8" strokeWidth={2.4} />
      <circle cx={10} cy={46} r={2.4} fill="#E9A02C" />
      <circle cx={110} cy={44} r={2.4} fill="#2A9D68" />
    </g>
  );
}

export function DibujoPersonaje({
  id,
  pose,
  emocion,
  idRecorte,
}: {
  id: PersonajeId;
  pose: Pose;
  emocion: Emocion;
  idRecorte: string;
}) {
  const Dibujo = DIBUJOS[id];
  return (
    <>
      <defs>
        <clipPath id={idRecorte}>
          <circle cx={60} cy={60} r={57} />
        </clipPath>
      </defs>
      {/* baldosa: clara en los dos modos, ver nota al inicio del archivo */}
      <circle cx={60} cy={60} r={58} fill="var(--pj-baldosa, #e8f2ed)" stroke="var(--pj-borde, #b9d3c7)" strokeWidth={1.5} />
      <g clipPath={`url(#${idRecorte})`}>
        <g className="pj-fig">
          <Dibujo pose={pose} emocion={emocion} />
        </g>
        {(emocion === "celebra" || pose === "celebra") && <Confeti />}
      </g>
    </>
  );
}
