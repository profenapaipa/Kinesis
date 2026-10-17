// Apariencia de Kinesis: modo (sistema, claro, oscuro), color principal y
// tamaño de texto. Es una preferencia de cada dispositivo, no de la cuenta:
// se guarda en localStorage y no viaja al servidor.
//
// El color principal es lo único que se elige; fondos, superficies, bordes
// y el degradado de los encabezados se derivan de él en app/globals.css con
// color-mix(). Por eso cada color trae dos tonos (uno para cada modo) y el
// color del texto que va encima, con contraste AA comprobado (≥ 4.5:1).
//
// Ver docs/IDENTIDAD_DE_MARCA.md, sección "Apariencia".

export type ThemeMode = "system" | "light" | "dark";

export interface AccentTokens {
  /** Color de acción en modo claro. Con texto blanco encima: ≥ 4.5:1. */
  light: string;
  /** Color de acción en modo oscuro: claro, para leerse sobre fondo oscuro. */
  dark: string;
  /** Texto sobre `light`. */
  onLight: string;
  /** Texto sobre `dark`. */
  onDark: string;
}

export interface AccentPreset extends AccentTokens {
  id: string;
  label: string;
  description: string;
}

// El primero es el de la marca (verde de la referencia final de diseño).
export const ACCENT_PRESETS: readonly AccentPreset[] = [
  {
    id: "kinesis",
    label: "Kinesis",
    description: "Verde bosque, el color de la marca",
    light: "#1b7f56",
    dark: "#6fd08c",
    onLight: "#ffffff",
    onDark: "#05231a",
  },
  {
    id: "oceano",
    label: "Océano",
    description: "Azul tranquilo",
    light: "#1d6fb8",
    dark: "#7cc0f5",
    onLight: "#ffffff",
    onDark: "#06192b",
  },
  {
    id: "uva",
    label: "Uva",
    description: "Violeta suave",
    light: "#6b4fc8",
    dark: "#b9a6ff",
    onLight: "#ffffff",
    onDark: "#1a1238",
  },
  {
    id: "coral",
    label: "Coral",
    description: "Naranja cálido",
    light: "#c2410c",
    dark: "#ff9a6b",
    onLight: "#ffffff",
    onDark: "#2b0f02",
  },
  {
    id: "pizarra",
    label: "Pizarra",
    description: "La paleta anterior: azul pizarra y turquesa",
    light: "#5b7088",
    dark: "#3fd9c4",
    onLight: "#ffffff",
    onDark: "#08201d",
  },
  {
    // Okabe-Ito: azul y naranja que se distinguen con cualquier tipo de
    // daltonismo. Es el tema "cb" de la referencia final de diseño.
    id: "daltonico",
    label: "Daltónico",
    description: "Azul seguro para cualquier tipo de daltonismo",
    light: "#0072b2",
    dark: "#56b4e9",
    onLight: "#ffffff",
    onDark: "#04121f",
  },
] as const;

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].id;
export const CUSTOM_ACCENT = "custom";

export interface ThemePreferences {
  mode: ThemeMode;
  /** id de un preset o "custom". */
  accent: string;
  /** Solo con accent === "custom": el color que eligió la persona y sus tonos derivados. */
  custom?: AccentTokens & { source: string };
  largeText: boolean;
}

export const DEFAULT_PREFERENCES: ThemePreferences = {
  mode: "system",
  accent: DEFAULT_ACCENT,
  largeText: false,
};

export const THEME_STORAGE_KEY = "kinesis-apariencia";

// Variables CSS que reemplaza un color personalizado (ver app/globals.css).
export const ACCENT_CSS_VARS: Record<keyof AccentTokens, string> = {
  light: "--accent-light",
  dark: "--accent-dark",
  onLight: "--accent-on-light",
  onDark: "--accent-on-dark",
};

// Se ejecuta en <head> antes del primer pintado (app/layout.tsx), así la
// página nunca aparece un instante con el tema equivocado. Repite a mano lo
// que hace applyPreferences(): aquí no hay módulos ni React.
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,p=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})||"{}"),m=p.mode||"system",k=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.mode=k?"dark":"light";d.dataset.accent=p.accent||${JSON.stringify(
  DEFAULT_ACCENT
)};if(p.accent===${JSON.stringify(CUSTOM_ACCENT)}&&p.custom){var v=${JSON.stringify(
  ACCENT_CSS_VARS
)};for(var n in v)if(p.custom[n])d.style.setProperty(v[n],p.custom[n])}if(p.largeText)d.dataset.textSize="large"}catch(e){}})()`;

export function readPreferences(): ThemePreferences {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    const mode: ThemeMode =
      parsed.mode === "light" || parsed.mode === "dark" ? parsed.mode : "system";
    const knownAccent =
      parsed.accent === CUSTOM_ACCENT
        ? Boolean(parsed.custom)
        : ACCENT_PRESETS.some((preset) => preset.id === parsed.accent);
    return {
      mode,
      accent: knownAccent && parsed.accent ? parsed.accent : DEFAULT_ACCENT,
      custom: parsed.custom,
      largeText: parsed.largeText === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: ThemePreferences): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema se aplica igual,
    // solo que no se recuerda en la próxima visita.
  }
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "system") return matchMedia("(prefers-color-scheme: dark)").matches;
  return mode === "dark";
}

export function applyPreferences(preferences: ThemePreferences): void {
  const root = document.documentElement;
  root.dataset.mode = resolveIsDark(preferences.mode) ? "dark" : "light";
  root.dataset.accent = preferences.accent;
  for (const [key, cssVar] of Object.entries(ACCENT_CSS_VARS)) {
    const value =
      preferences.accent === CUSTOM_ACCENT
        ? preferences.custom?.[key as keyof AccentTokens]
        : undefined;
    if (value) root.style.setProperty(cssVar, value);
    else root.style.removeProperty(cssVar);
  }
  if (preferences.largeText) root.dataset.textSize = "large";
  else delete root.dataset.textSize;
}

// ---------------------------------------------------------------------------
// Color personalizado: a partir de cualquier color se calculan los dos tonos
// y su texto, oscureciendo o aclarando hasta pasar el contraste AA. Así nadie
// puede elegir un amarillo pálido y dejar los botones ilegibles.

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrastRatio(a: string, b: string): number {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const [hi, lo] = [luminance(ra), luminance(rb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(color: Rgb, toward: Rgb, amount: number): Rgb {
  return color.map((c, i) => c + (toward[i] - c) * amount) as Rgb;
}

// Mueve el color hacia `toward` en pasos pequeños hasta alcanzar el
// contraste pedido contra `against`.
function adjustForContrast(color: Rgb, toward: Rgb, against: string, target: number): Rgb {
  let current = color;
  for (let step = 0; step <= 20; step++) {
    if (contrastRatio(rgbToHex(current), against) >= target) return current;
    current = mix(color, toward, step / 20);
  }
  return current;
}

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];
// Fondo de tarjeta aproximado del modo oscuro (ver globals.css).
const DARK_SURFACE = "#0e1714";

export function deriveCustomAccent(source: string): (AccentTokens & { source: string }) | null {
  const rgb = hexToRgb(source);
  if (!rgb) return null;
  const light = adjustForContrast(rgb, BLACK, "#ffffff", 4.6);
  const dark = adjustForContrast(rgb, WHITE, DARK_SURFACE, 7);
  return {
    source: rgbToHex(rgb),
    light: rgbToHex(light),
    dark: rgbToHex(dark),
    onLight: "#ffffff",
    onDark: rgbToHex(mix(dark, BLACK, 0.85)),
  };
}
