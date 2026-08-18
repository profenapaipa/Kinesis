@AGENTS.md

# Planeación Inclusiva PIAR — Contexto del proyecto

## Stack
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- Drizzle ORM + SQLite (better-sqlite3) — base de datos en `data/app.db`

## Reglas de seguridad y arquitectura (no negociables)
- **Información clínica aislada**: la tabla `clinical_info` (`db/schema.ts`) nunca se lee ni se expone sin pasar por `canViewDiagnosis()` (`lib/permissions.ts`). No crear atajos tipo "el admin ve todo": por defecto el administrador NO tiene acceso al diagnóstico clínico.
- **Catálogo de asignaturas**: las áreas curriculares (Ley 115/1994, Art. 23, MEN) tienen como fuente de verdad el union `SubjectId` (`types/index.ts`) / `lib/subjects.ts`. La tabla `subjects` en BD existe solo por integridad referencial, no es editable libremente desde la UI de administración.
- **Control de acceso centralizado**: ningún componente ni route handler decide permisos por su cuenta. Todo acceso pasa por `accessLevel()` / `requireAccess()` o las funciones contextuales (`canViewDiagnosis`, `canViewPiarCompleto`) de `lib/permissions.ts`.

## Comandos de desarrollo
- `npm run dev` — servidor de desarrollo
- `npx tsc --noEmit` — verificación de tipos (ejecutar antes de cerrar cualquier fase)
- `npx drizzle-kit studio` (equivalente ya definido: `npm run db:studio`) — explorador visual de la base de datos
- `npm run db:generate` / `npm run db:migrate` — migraciones Drizzle
- `npm run db:seed` — poblar datos semilla
- `npm run lint` — ESLint
