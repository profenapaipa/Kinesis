#!/usr/bin/env node
// Construye la demostración estática que se publica en GitHub Pages.
//
// Contexto, importante antes de tocar esto: la app real es un servidor de
// punta a punta — sesiones con cookie httpOnly, 21 handlers de API, proxy.ts
// consultando la BD en cada navegación y SQLite en disco. GitHub Pages solo
// sirve archivos estáticos, así que la app real NO puede correr ahí. Lo que
// se publica es una demostración navegable de la interfaz.
//
// Cómo se logra sin duplicar la app: en un export estático los Server
// Components se ejecutan DURANTE el build, en Node. O sea que SQLite sí
// funciona mientras compila. Por eso esta demostración usa las páginas,
// `lib/data/*` y `lib/permissions.ts` REALES, sin copias paralelas que se
// desincronicen. Solo se cambian tres cosas, sobre un árbol desechable:
//
//   1. `lib/auth/session.ts` <- `lib/demo/session.ts` (el export estático no
//      admite `cookies()`; el rol se fija con DEMO_ROLE).
//   2. Se borran `app/api/**`, `app/login/` y `proxy.ts` (no exportables).
//   3. Se inyecta `generateStaticParams()` en las rutas dinámicas.
//
// La base de datos se siembra desde cero con `db/seed.ts` (10 estudiantes
// ficticios), así que nunca se publica información de estudiantes reales.
//
// Un build por rol, cada uno con su propio `basePath`, porque sin servidor el
// rol tiene que quedar fijo en tiempo de compilación.
//
// Uso:  npm run demo:build                      (salida en demo-out/)
//       DEMO_BASE_PATH=/otro-repo npm run demo:build

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BUILD_DIR = join(ROOT, ".demo-build");
const OUT_DIR = join(ROOT, "demo-out");

// Ruta en la que GitHub Pages sirve el repositorio: para
// https://usuario.github.io/planeacion-inclusiva-piar/ es
// "/planeacion-inclusiva-piar". El workflow la calcula del nombre del repo.
const BASE_PATH = (process.env.DEMO_BASE_PATH ?? "/planeacion-inclusiva-piar").replace(/\/+$/, "");

// Un sub-sitio por rol. `keep` son las entradas de `app/` que ese rol puede
// ver, derivadas de NAV_BY_ROLE/ROLE_HOME en components/AppShell.tsx. El resto
// se borra antes de compilar: así cada sub-sitio contiene solo sus propias
// pantallas, sin rutas prohibidas que acaben en 404.
const ROLES = [
  {
    role: "docente",
    label: "Docente",
    home: "/",
    keep: ["page.tsx", "estudiantes", "planeacion", "generador"],
    blurb:
      "Su lista de estudiantes, la planeación por asignatura con los tres principios del DUA y el generador de ajustes.",
  },
  {
    role: "orientador",
    label: "Orientador/a",
    home: "/estudiantes",
    keep: ["estudiantes"],
    blurb:
      "Equipo de apoyo pedagógico (Decreto 1421 de 2017): ve a los estudiantes de todo el colegio, con diagnóstico completo.",
  },
  {
    role: "administrador",
    label: "Administrador",
    home: "/admin",
    keep: ["admin"],
    blurb:
      "Usuarios, cursos, vínculos de acudientes, categorías de apoyo y periodos académicos. No ve diagnósticos clínicos.",
  },
  {
    role: "estudiante",
    label: "Estudiante",
    home: "/estudiante",
    keep: ["estudiante"],
    blurb:
      "Su propio panel: sus asignaturas, sus apoyos explicados en lenguaje cercano y su prueba adaptada.",
  },
  {
    role: "padre",
    label: "Acudiente",
    home: "/padre",
    keep: ["padre"],
    blurb:
      "Panel de la familia: el resumen pedagógico de su hijo o hija, sin acceso al diagnóstico clínico.",
  },
];

// Entradas de `app/` que todos los roles necesitan.
const ALWAYS_KEEP = ["layout.tsx", "globals.css", "favicon.ico"];

// Lo que el export estático no admite (ver la guía de Next en
// node_modules/next/dist/docs/01-app/02-guides/static-exports.md).
const UNSUPPORTED = ["app/api", "app/login", "proxy.ts"];

// Página dinámica -> función de lib/demo/params.ts que enumera sus rutas.
const STATIC_PARAMS = {
  "app/estudiantes/[studentId]/page.tsx": "studentIdParams",
  "app/planeacion/[subjectId]/page.tsx": "planeacionSubjectParams",
  "app/estudiante/[subjectId]/page.tsx": "estudianteSubjectParams",
};

// Se copia una sola vez; `app/` se repone en cada rol.
const BASE_DIRS = ["components", "db", "lib", "public", "types"];
const BASE_FILES = [
  "package.json",
  "tsconfig.json",
  "next-env.d.ts",
  "postcss.config.mjs",
  "drizzle.config.ts",
];

const BIN = {
  next: join(ROOT, "node_modules", "next", "dist", "bin", "next"),
  tsx: join(ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
  drizzleKit: join(ROOT, "node_modules", "drizzle-kit", "bin.cjs"),
};

// `fs.cpSync(dir, dir, { recursive: true })` mata el proceso de golpe en
// Node 24 sobre Windows: sin excepción, sin código de salida útil y sin
// alcanzar los manejadores de `exit`. La copia recursiva va a mano con las
// primitivas que sí se comportan.
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else if (entry.isFile()) copyFileSync(source, target);
  }
}

// Espera sincronica sin dependencias, para los reintentos de moveDir().
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// En Windows un `rename` recien terminado de escribir puede fallar con EPERM
// porque el antivirus, el indexador o un worker del build todavia tiene abierto
// alguno de los archivos. Se reintenta y, si insiste, se copia y se borra.
function moveDir(from, to) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      renameSync(from, to);
      return;
    } catch {
      if (attempt === 4) {
        copyDir(from, to);
        rmSync(from, { recursive: true, force: true });
        return;
      }
      sleepSync(400 * attempt);
    }
  }
}

function log(message) {
  console.log(`\n\u001b[36m> ${message}\u001b[0m`);
}

// Cada binario se invoca con el Node actual en vez de los shims de
// node_modules/.bin, que en Windows son .cmd y necesitarían shell.
function run(label, binary, args, env = {}) {
  const result = spawnSync(process.execPath, [binary, ...args], {
    cwd: BUILD_DIR,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    throw new Error(`${label} falló (código ${result.status ?? "sin código"}).`);
  }
}

function assertProjectRoot() {
  const manifest = join(ROOT, "package.json");
  if (!existsSync(manifest)) throw new Error(`No se encontró package.json en ${ROOT}.`);

  const { name } = JSON.parse(readFileSync(manifest, "utf8"));
  if (name !== "planeacion-piar") {
    throw new Error(`Se esperaba el proyecto "planeacion-piar" y se encontró "${name}".`);
  }
  for (const [label, binary] of Object.entries(BIN)) {
    if (!existsSync(binary)) {
      throw new Error(`Falta ${label} en node_modules (${binary}). ¿Se corrió npm install?`);
    }
  }
}

function copyBaseTree() {
  rmSync(BUILD_DIR, { recursive: true, force: true });
  mkdirSync(BUILD_DIR, { recursive: true });

  for (const dir of BASE_DIRS) {
    copyDir(join(ROOT, dir), join(BUILD_DIR, dir));
  }
  for (const file of BASE_FILES) {
    if (existsSync(join(ROOT, file))) copyFileSync(join(ROOT, file), join(BUILD_DIR, file));
  }

  // El export estático no admite cookies(): la sesión pasa a ser un rol fijo
  // de build. Es el ÚNICO módulo de la app que se sustituye.
  copyFileSync(
    join(BUILD_DIR, "lib", "demo", "session.ts"),
    join(BUILD_DIR, "lib", "auth", "session.ts")
  );
}

// Base de datos ficticia, nueva en cada corrida: `db/index.ts` la abre en
// `process.cwd()/data/app.db` y drizzle.config.ts usa la misma ruta relativa,
// así que correr con cwd = .demo-build/ basta para no tocar la BD de trabajo.
function seedDemoDatabase() {
  log("Sembrando base de datos ficticia (db/seed.ts)");
  mkdirSync(join(BUILD_DIR, "data"), { recursive: true });
  run("drizzle-kit migrate", BIN.drizzleKit, ["migrate"]);
  run("db/seed.ts", BIN.tsx, ["db/seed.ts"]);
}

// `app/` se repone desde el árbol real en cada rol: así el único estado que
// cambia entre builds es el del rol, nunca restos del anterior.
function resetAppTree() {
  const appDir = join(BUILD_DIR, "app");
  rmSync(appDir, { recursive: true, force: true });
  copyDir(join(ROOT, "app"), appDir);

  for (const target of UNSUPPORTED) {
    rmSync(join(BUILD_DIR, target), { recursive: true, force: true });
  }
}

function pruneToRole({ keep }) {
  const appDir = join(BUILD_DIR, "app");
  const allowed = new Set([...keep, ...ALWAYS_KEEP]);
  for (const entry of readdirSync(appDir)) {
    if (!allowed.has(entry)) rmSync(join(appDir, entry), { recursive: true, force: true });
  }
}

// La raíz de cada sub-sitio ("/") es el dashboard del docente. Para los demás
// roles se reemplaza por una redirección al panel que sí les corresponde, en
// vez de mostrarles una pantalla ajena.
function writeHomeStub({ home }) {
  if (home === "/") return;
  writeFileSync(
    join(BUILD_DIR, "app", "page.tsx"),
    `"use client";

// Generado por scripts/build-demo.mjs — no es parte de la app real.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("${home}");
  }, [router]);

  return <p className="text-sm text-muted-foreground">Abriendo el panel…</p>;
}
`
  );
}

// Sin servidor no hay rutas bajo demanda: cada ruta dinámica tiene que
// declarar de antemano qué páginas existen.
function injectStaticParams() {
  for (const [relativePath, fn] of Object.entries(STATIC_PARAMS)) {
    const file = join(BUILD_DIR, relativePath);
    if (!existsSync(file)) continue; // esa ruta no aplica a este rol

    const source = readFileSync(file, "utf8");
    if (source.includes("generateStaticParams")) {
      throw new Error(
        `${relativePath} ya exporta generateStaticParams(); revisa si todavía ` +
          `hace falta inyectarlo desde scripts/build-demo.mjs.`
      );
    }

    writeFileSync(
      file,
      `${source}
// --- Agregado por scripts/build-demo.mjs (solo build de demostración) ---
export async function generateStaticParams() {
  const { ${fn} } = await import("@/lib/demo/params");
  return ${fn}();
}
`
    );
  }
}

function writeNextConfig({ role }) {
  writeFileSync(
    join(BUILD_DIR, "next.config.ts"),
    `import type { NextConfig } from "next";

// Generado por scripts/build-demo.mjs — no editar a mano.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "${BASE_PATH}/${role}",
  // Los hosts estáticos resuelven /ruta/ -> /ruta/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
`
  );
}

// URL de entrada de un rol, relativa a la raíz del sitio: su sub-sitio más su
// pantalla inicial (ej. "orientador/estudiantes/").
function entryPath({ role, home }) {
  return home === "/" ? `${role}/` : `${role}${home}/`;
}

function buildRole(entry) {
  const { role } = entry;
  log(`Compilando el sub-sitio del rol "${role}"`);

  resetAppTree();
  pruneToRole(entry);
  writeHomeStub(entry);
  injectStaticParams();
  writeNextConfig(entry);

  // Cada rol tiene un basePath distinto: reutilizar el caché de .next entre
  // builds solo confundiría las rutas de los assets.
  rmSync(join(BUILD_DIR, ".next"), { recursive: true, force: true });
  rmSync(join(BUILD_DIR, "out"), { recursive: true, force: true });

  run("next build", BIN.next, ["build"], {
    DEMO_ROLE: role,
    NEXT_PUBLIC_DEMO: "1",
    NEXT_PUBLIC_DEMO_ROLE: role,
    NEXT_PUBLIC_DEMO_ROOT: `${BASE_PATH}/`,
    // components/DemoBanner.tsx lee esto para pintar el selector de rol: este
    // script es la única fuente de verdad de qué roles se publican y dónde.
    NEXT_PUBLIC_DEMO_ROLES: JSON.stringify(
      ROLES.map((item) => ({ role: item.role, label: item.label, path: entryPath(item) }))
    ),
    NEXT_TELEMETRY_DISABLED: "1",
  });

  const exported = join(BUILD_DIR, "out");
  if (!existsSync(exported)) {
    throw new Error(`next build no generó ${exported}. ¿Se perdió output: "export"?`);
  }
  moveDir(exported, join(OUT_DIR, role));
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Portada y 404 del sitio: no pertenecen a ningún rol, así que no son páginas
// de Next. Se arman desde las plantillas de scripts/, que usan Nunito y las
// dos direcciones de color de `referencias visuales/`, igual que la app.
function renderTemplate(name, replacements) {
  const template = readFileSync(join(ROOT, "scripts", name), "utf8");
  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.split(`{{${key}}}`).join(value),
    template
  );
}

function writeLanding() {
  log("Escribiendo portada y archivos propios de GitHub Pages");

  const cards = ROLES.map(
    (item) => `      <a class="card" href="${BASE_PATH}/${entryPath(item)}">
        <span class="role">${escapeHtml(item.label)}</span>
        <span class="blurb">${escapeHtml(item.blurb)}</span>
        <span class="cta">Entrar &rarr;</span>
      </a>`
  ).join("\n");

  writeFileSync(
    join(OUT_DIR, "index.html"),
    renderTemplate("demo-landing.html", { BASE_PATH, CARDS: cards })
  );

  writeFileSync(
    join(OUT_DIR, "404.html"),
    renderTemplate("demo-404.html", { BASE_PATH })
  );

  // Sin esto GitHub Pages pasa el sitio por Jekyll, que descarta las carpetas
  // que empiezan por "_" — incluida _next/, o sea todos los assets.
  writeFileSync(join(OUT_DIR, ".nojekyll"), "");
}

function main() {
  assertProjectRoot();

  log(`Preparando el árbol de build (basePath "${BASE_PATH}")`);
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  copyBaseTree();
  seedDemoDatabase();

  for (const entry of ROLES) buildRole(entry);

  writeLanding();
  rmSync(BUILD_DIR, { recursive: true, force: true });

  log(`Listo: demo-out/ con ${ROLES.length} roles`);
  console.log(`  Portada         ->  ${BASE_PATH}/`);
  for (const entry of ROLES) {
    console.log(`  ${entry.label.padEnd(15)} ->  ${BASE_PATH}/${entryPath(entry)}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`\n\u001b[31mx ${error instanceof Error ? error.message : error}\u001b[0m`);
  process.exit(1);
}
