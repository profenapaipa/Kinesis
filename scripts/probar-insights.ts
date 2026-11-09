// Prueba de «Niky sugiere» (lib/data/nikyInsights.ts) contra la base sembrada.
//
// El repositorio no tiene un runner de pruebas, así que esto es un script que
// se corre con tsx y falla (código de salida 1) si algo no se cumple:
//
//     npx tsx scripts/probar-insights.ts
//
// Crea una base de datos NUEVA en una carpeta temporal (migra y siembra con
// db/seed.ts), así que no toca data/app.db. Lo que verifica, por rol:
//   - qué ítems salen (y que sean de 3 a 5, con enlace interno);
//   - que el estudiante y la familia NUNCA reciban a otro estudiante ni nada clínico;
//   - que el administrador no reciba datos de estudiantes;
//   - que la «acción rápida» nunca sea más que abrir a Niky (no modifica nada).

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const ROOT = process.cwd();
const TMP = mkdtempSync(path.join(process.env.CLAUDE_TMP ?? tmpdir(), "kinesis-insights-"));
mkdirSync(path.join(TMP, "data"), { recursive: true });

// 1. Esquema y semilla en la carpeta temporal. `db/index.ts` abre
//    `process.cwd()/data/app.db`; por eso la semilla corre con cwd = TMP.
const raw = new Database(path.join(TMP, "data", "app.db"));
migrate(drizzle(raw), { migrationsFolder: path.join(ROOT, "db", "migrations") });
raw.close();
const seed = spawnSync(process.execPath, [path.join(ROOT, "node_modules", "tsx", "dist", "cli.mjs"), path.join(ROOT, "db", "seed.ts")], {
  cwd: TMP,
  encoding: "utf8",
});
if (seed.status !== 0) {
  console.error(seed.stdout, seed.stderr);
  throw new Error("No se pudo sembrar la base temporal.");
}

// 2. Desde aquí `@/db` ya apunta a la base temporal.
process.chdir(TMP);

// Se sale de la carpeta temporal antes de borrarla (Windows no deja borrar el cwd).
function cleanup() {
  try {
    process.chdir(ROOT);
    rmSync(TMP, { recursive: true, force: true });
  } catch {
    // Si el sistema aún tiene abierto el archivo, la carpeta temporal se limpia sola más tarde.
  }
}

let failures = 0;
function check(ok: boolean, label: string) {
  console.log(`${ok ? "  ok " : "  FALLA"} ${label}`);
  if (!ok) failures += 1;
}

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { getNikyInsights } = await import("@/lib/data/nikyInsights");
  const { DEMO_PIAR, DEMO_STUDENT_CODES } = await import("@/db/demoRoster");
  type Session = import("@/lib/auth/session").Session;

  async function sessionOf(username: string): Promise<Session> {
    const user = await db.select().from(users).where(eq(users.username, username)).get();
    if (!user) throw new Error(`No existe el usuario ${username}`);
    return { userId: user.id, username: user.username, fullName: user.fullName, role: user.role };
  }

  const clinicalNeedles = [
    // Nada de diagnóstico ni de «impresiones» (los títulos de documentos del colegio, como
    // «Protocolo de acceso a información clínica», no son contenido clínico).
    /diagn[oó]stic/i,
    /impresi[oó]n/i,
    ...Object.values(DEMO_PIAR).flatMap((piar) => [piar.impresion, piar.professional, piar.notes]),
  ];
  const codesIn = (text: string) => [...new Set(text.match(/8A-\d\d/g) ?? [])];
  const flat = (data: unknown) => JSON.stringify(data);
  const textOf = (data: Awaited<ReturnType<typeof getNikyInsights>>) =>
    flat({ items: data.items, quick: data.quick, templates: data.templates });

  function commonChecks(role: string, data: Awaited<ReturnType<typeof getNikyInsights>>) {
    check(data.items.length >= 3 && data.items.length <= 5, `${role}: entre 3 y 5 ítems (hay ${data.items.length})`);
    check(
      data.items.every((item) => item.href.startsWith("/") && item.text.length > 10 && !/[—–]/.test(item.text)),
      `${role}: cada ítem lleva enlace interno, texto y sin raya larga`
    );
    check(
      data.items.every((item) => !item.action || ["pista", "explicar", "ajustar-actividad", "ordenar-nota-bitacora"].includes(item.action.task)),
      `${role}: las acciones rápidas solo abren a Niky con una tarea válida`
    );
    check(
      data.items.every((item) => !item.action || item.action.context.length <= 200),
      `${role}: el contexto para Niky cabe en 200 caracteres`
    );
    check(data.quick.length >= 2, `${role}: al menos 2 preguntas rápidas`);
    check(
      data.quick.every((quick) => quick.summary.length > 5),
      `${role}: cada pregunta rápida trae su respuesta`
    );
    for (const needle of clinicalNeedles) {
      const found = typeof needle === "string" ? textOf(data).includes(needle) : needle.test(textOf(data));
      if (found) check(false, `${role}: aparece contenido clínico (${String(needle).slice(0, 40)})`);
    }
    check(true, `${role}: sin contenido clínico`);
  }

  const ids = (data: Awaited<ReturnType<typeof getNikyInsights>>) => data.items.map((item) => item.id);

  console.log("\nDocente");
  const docente = await getNikyInsights(await sessionOf("docente"));
  commonChecks("docente", docente);
  check(ids(docente).includes("sin-calificar") && docente.items.find((i) => i.id === "sin-calificar")?.kind === "alerta", "docente: alerta de entregadas sin calificar");
  check(ids(docente).some((id) => id.startsWith("dua-")), "docente: actividad sin DUA completo");
  check(docente.quick.some((q) => q.id === "evaluacion" && (q.table?.rows.length ?? 0) > 0), "docente: evaluación rápida con tabla");
  check(docente.quick.some((q) => q.id === "han-funcionado" && /funcionó/.test(flat(q))), "docente: «funcionó en N de M, último»");
  check(docente.templates.length === 3 && docente.templates.every((t) => /^\/planeacion\/[\w-]+#plantilla=[\w-]+&fecha=\d{4}-\d{2}-\d{2}$/.test(t.href)), "docente: 3 plantillas con hash");
  check(!docente.templates.some((t) => /Hoja de cálculo/.test(t.topic)), "docente: ninguna plantilla sale de una actividad sin DUA completo");

  console.log("\nOrientador");
  const orientador = await getNikyInsights(await sessionOf("orientador.demo"));
  commonChecks("orientador", orientador);
  check(orientador.items.find((i) => i.id === "revision-vencida")?.kind === "alerta", "orientador: revisión vencida");
  check(ids(orientador).includes("revision-proxima"), "orientador: revisión próxima");
  const apoyo = orientador.items.find((i) => i.id === "apoyo-confirmable");
  check(Boolean(apoyo && /lo confirma una persona/.test(apoyo.text)), "orientador: apoyo repetido, «lo confirma una persona»");
  check(ids(orientador).includes("documentos-faltan"), "orientador: documentos imprescindibles que faltan");

  console.log("\nAdministrador");
  const admin = await getNikyInsights(await sessionOf("admin"));
  commonChecks("administrador", admin);
  check(codesIn(textOf(admin)).length === 0 && !/Estudiante/.test(textOf(admin)), "administrador: ningún dato de estudiantes");
  check(ids(admin).includes("documentos-faltan"), "administrador: documentos que faltan");
  check(!/PIAR del estudiante|Autorización de tratamiento de datos de menores|Acta de socialización/.test(textOf(admin)), "administrador: ningún documento por estudiante");

  console.log("\nFamilia");
  const padre = await getNikyInsights(await sessionOf("padre.demo"));
  commonChecks("padre", padre);
  check(codesIn(textOf(padre)).length === 0, "padre: ningún código de estudiante");
  check(ids(padre).includes("revision") && ids(padre).includes("documento") && ids(padre).includes("compartido"), "padre: revisión, documento que falta y lo compartido");
  // Lo que el docente NO compartió no puede aparecer: el registro de 8A-03 sin compartir.
  check(!/Escuchar el vocabulario sin la tarjeta/.test(textOf(padre)), "padre: nada de lo no compartido");
  check(!/Roster|8A-0[24578]/.test(textOf(padre)), "padre: ningún otro estudiante");

  console.log("\nEstudiante (cada uno solo ve lo suyo)");
  for (const code of DEMO_STUDENT_CODES) {
    const data = await getNikyInsights(await sessionOf(code.toLowerCase()));
    const text = textOf(data);
    const others = codesIn(text).filter((found) => found !== code);
    check(others.length === 0, `${code}: ningún otro estudiante (${others.join(", ") || "ninguno"})`);
    for (const needle of clinicalNeedles) {
      const found = typeof needle === "string" ? text.includes(needle) : needle.test(text);
      if (found) check(false, `${code}: contenido clínico (${String(needle).slice(0, 40)})`);
    }
  }
  const e03 = await getNikyInsights(await sessionOf("8a-03"));
  commonChecks("estudiante 8A-03", e03);
  check(ids(e03).includes("sigue"), "estudiante 8A-03: qué sigue");
  check(/comentario|escribió/.test(flat(e03)), "estudiante 8A-03: comentarios del docente");
  // 8A-07 no ve los comentarios del docente a otros estudiantes (las actividades del curso sí son de todos).
  const e07 = await getNikyInsights(await sessionOf("8a-07"));
  check(!/Muy buen orden|Tu rutina grabada|Tu cuadrado|Tu cadena/.test(textOf(e07)), "estudiante 8A-07: nada de lo de 8A-03");

  cleanup();
  console.log(failures ? `\n${failures} verificación(es) fallaron.` : "\nTodo en orden.");
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  cleanup();
  process.exit(1);
});
