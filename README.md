# Planeación Inclusiva PIAR

Plataforma para que un docente cruce su planeación de clase con los perfiles
PIAR de sus estudiantes, diseñe desde los tres principios del **Diseño
Universal de Aprendizaje (DUA)** y genere los ajustes individuales que el
diseño universal no alcanza a cubrir.

Marco normativo colombiano: las áreas curriculares siguen la **Ley 115 de
1994** (Art. 23) y los roles y el PIAR siguen el **Decreto 1421 de 2017**, que
exige que el PIAR lo defina un equipo interdisciplinario (docente + apoyo
pedagógico + familia), no el docente solo.

## Cómo correrla

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run db:migrate   # crea data/app.db con el esquema
npm run db:seed      # siembra datos ficticios de demostración
npm run dev          # http://localhost:3000
```

En Windows, `Iniciar App.bat` hace lo anterior y abre el navegador solo.

### Usuarios de demostración

Los crea `npm run db:seed`. **Todos los estudiantes son ficticios.**

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Docente | `docente` | `docente123` |
| Orientador/a | `orientador.demo` | `orientador123` |
| Acudiente | `padre.demo` | `padre123` |
| Estudiante | `nombre.apellido` | `estudiante123` |

### Otros comandos

| Comando | Para qué |
|---|---|
| `npx tsc --noEmit` | Verificación de tipos (correr antes de cerrar una fase) |
| `npm run lint` | ESLint |
| `npm run db:studio` | Explorador visual de la base de datos |
| `npm run build` | Build de producción |
| `npm run demo:build` | Demostración estática (ver abajo) |

## Demostración pública

Hay una demostración navegable publicada en GitHub Pages con **datos
ficticios**. Se construye con `npm run demo:build` (sale en `demo-out/`) y se
publica sola en cada push a `main`.

**No es la aplicación en uso, y la diferencia importa:** GitHub Pages solo
sirve archivos estáticos, y esta app es un servidor de punta a punta —
sesiones con cookie httpOnly, handlers de API, control de acceso por rol en
cada navegación y SQLite en disco. En la demostración no hay inicio de sesión
real y nada de lo que se escriba se guarda.

Para que un colegio la use de verdad hace falta un host que ejecute Node con
disco persistente. Los detalles de cómo está armada la demostración están en
el comentario de cabecera de `scripts/build-demo.mjs`.

Para publicarla en otro repositorio, una sola vez: **Settings → Pages → Build
and deployment → Source: "GitHub Actions"**.

## Reglas de arquitectura que no se negocian

Están completas en [`CLAUDE.md`](CLAUDE.md); el resumen:

- **La información clínica está aislada.** La tabla `clinical_info` nunca se
  lee ni se expone sin pasar por `canViewDiagnosis()` (`lib/permissions.ts`).
  Por defecto el administrador **no** ve el diagnóstico: no hay atajos de
  "el admin ve todo". El `orientador` es la única excepción documentada,
  porque esa es justamente su función según el Decreto 1421.
- **El control de acceso está centralizado.** Ningún componente ni route
  handler decide permisos por su cuenta: todo pasa por `accessLevel()` /
  `requireAccess()` o por las funciones contextuales de
  `lib/permissions.ts`.
- **El catálogo de asignaturas tiene una sola fuente de verdad**, el union
  `SubjectId` (`types/index.ts`) y `lib/subjects.ts`. La tabla `subjects`
  existe solo por integridad referencial.

## Documentación

- [`docs/HOJA_DE_RUTA.md`](docs/HOJA_DE_RUTA.md) — estado por fase y
  decisiones pedagógicas y de diseño.
- [`docs/BITACORA_DESARROLLO.md`](docs/BITACORA_DESARROLLO.md) — registro
  técnico de cada fase.
- [`CHANGELOG.md`](CHANGELOG.md) — registro formal de cambios.

## Stack

Next.js 16 (App Router) · React 19.2 · TypeScript · Tailwind CSS v4 ·
Drizzle ORM sobre SQLite (`better-sqlite3`). Tipografía Nunito; paleta clara
y oscura definidas en `app/globals.css`.
