# Bitácora de Desarrollo — Planeación Inclusiva PIAR

Registro cronológico de cambios, decisiones de arquitectura y estado de
verificación del proyecto. Las entradas más recientes van arriba.

---

## Plantilla de entrada (copiar para cada nueva sesión/hito)

## [AAAA-MM-DD] — <título breve>

**Fase activa:** <ej. Fase 1 — Migración estudiante/padre a BD real>

### Cambios implementados
- ...

### Decisiones de arquitectura
- ...

### Estado de `npx tsc --noEmit`
- [ ] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-08-20] — Fase 2: Roster real del docente y cierre de fuga de diagnóstico

**Fase activa:** Fase 2 — Roster real del docente y aislamiento clínico

### Cambios implementados
- Nuevo `lib/data/clinicalInfo.ts`: único punto de acceso a `clinical_info`
  en todo el proyecto (fuera de `db/schema.ts`/`db/seed.ts`). `getClinicalDiagnosis()`
  llama `canViewDiagnosis()` internamente y lanza `PermissionError` si no
  está permitido — fail closed, incluso si el llamador se olvidara de
  verificar antes.
- `lib/permissions.ts`: `isTeacherAssignedToStudentCourse()` pasa de función
  privada a exportada, para reutilizarla como guard de "es mi estudiante" en
  `lib/data/students.ts`.
- `lib/data/students.ts` ampliado: `listMyStudents()` (roster del docente,
  vía `course_teachers` → `enrollments` → `courses`/`users`, con
  `hasPedagogicalProfile` como booleano — sin exponer resumen pedagógico ni
  nada clínico en el listado), `getStudentProfileForTeacher()` y
  `getPedagogicalSummaryForTeacher()` (ambas verifican asignación de curso
  antes de devolver cualquier dato).
- `app/estudiantes/page.tsx` y `components/StudentRoster.tsx` migradas a
  datos reales; se eliminó el bloque de diagnóstico expandible en el roster
  (se consolida en la vista de detalle, ya protegida).
- `app/estudiantes/[studentId]/page.tsx` reescrita: si el estudiante no
  pertenece a un curso del docente, `notFound()`; si `canViewDiagnosis()` es
  falso, la sección clínica se reemplaza por un aviso explícito de acceso
  restringido en vez de ocultarse en silencio. Se agregó una sección nueva
  "Barreras a tener en cuenta" (`pedagogical_barriers`), pertinente para el
  docente y no clínica.
- `components/StudentRoster.tsx`: las pestañas de filtro por grado ya no
  dependen de una lista fija `["8°","9°","10°","11°"]` — se derivan de los
  grados realmente presentes en el roster (`sortGrades()`), así que un curso
  futuro con un grado en otro formato (ej. `"8A"`) obtiene su propia pestaña
  sin tocar código.
- Tarjeta de avance reemplazada por "disponible próximamente" (mismo
  tratamiento que Fase 1 le dio a `/padre` — `progress_entries` sin datos
  reales todavía; se resuelve en Fase 6 de la hoja de ruta).

### Decisiones de arquitectura
- **Hallazgo de seguridad cerrado**: `app/estudiantes/[studentId]/page.tsx`
  mostraba diagnóstico, profesional responsable y última revisión de
  cualquier estudiante a cualquier docente que entrara a la URL, sin pasar
  por `canViewDiagnosis()`. Detectado en la auditoría previa a esta fase.
- El acceso clínico se aisló en un archivo dedicado (`lib/data/clinicalInfo.ts`)
  en vez de agregarlo a `lib/data/students.ts`, para preservar la garantía
  explícita de ese archivo ("nunca importa `clinicalInfo`") establecida en
  Fase 1 — un `grep clinicalInfo lib/` sigue señalando un único archivo.
- `getStudentProfileForTeacher()`/`getPedagogicalSummaryForTeacher()`
  verifican la asignación de curso internamente (no solo en la página),
  siguiendo el mismo patrón que las variantes de padre (`getChildProfile`)
  de Fase 1 — ningún componente decide permisos por su cuenta.
- Se retiró la sección de diagnóstico expandible del roster (`StudentRoster.tsx`):
  la funcionalidad no se pierde, se consolida en la vista de detalle, que
  es la única que ahora aplica el gate correctamente.

### Pendiente conocido
- Retroactivamente se documentó Fase 1 en `CHANGELOG.md` (no se había hecho
  en su momento, solo se actualizó la bitácora).

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-08-18] — Fase 1: Migración de mock data a BD real (Estudiante y Padre)

**Fase activa:** Fase 1 — Migración de Mock Data a BD Real para Estudiante y Padre

### Cambios implementados
- Nuevo `lib/data/students.ts`: `getMyStudentProfile`, `getMyPedagogicalSummary`,
  `getGuardianChildren`, `getChildProfile`, `getChildPedagogicalSummary` —
  consultan datos básicos, curso activo, `student_learning_preferences` y el
  resumen pedagógico (fortalezas/barreras/apoyos efectivos) vía Drizzle. Este
  archivo nunca importa `clinicalInfo`.
- `lib/permissions.ts`: nuevo helper `isGuardianOfStudent()`, mismo patrón que
  `isTeacherAssignedToStudentCourse()`, usado por `lib/data/students.ts` para
  verificar la relación acudiente-estudiante antes de exponer datos.
- `lib/studentFriendlyText.ts`: nuevo `LEARNING_PREFERENCE_LABEL` para las
  opciones de `student_learning_preferences`.
- `lib/testGenerator.ts`: `generateAdaptedTest` ahora recibe
  `AdaptedTestStudentInput` (`{ id, hasPiar, adjustmentTypes: string[] }`) en
  vez del `Student` mock completo, desacoplándolo del modelo antiguo.
- `app/estudiante/page.tsx`, `app/estudiante/[subjectId]/page.tsx` y
  `app/padre/page.tsx` reescritas como Server Components: usan
  `requireRole()` + `lib/data/students.ts` en vez de `useSession()` +
  `findMockStudentBySessionName`.
- Eliminado `lib/legacyStudentBridge.ts` (verificado sin referencias activas).

### Decisiones de arquitectura
- Las 3 páginas pasaron de Client Component a Server Component: Drizzle/
  better-sqlite3 solo corre en servidor, y el resto del proyecto (`/admin/*`)
  ya usaba ese patrón (`requireRole()` + `lib/data/*.ts`).
- **Corrección de aislamiento clínico**: el mock mostraba `diagnosis`,
  `responsibleProfessional` y `lastReview` a estudiante y padre. Esos campos
  viven en `clinical_info`, restringida por `canViewDiagnosis()` a docentes
  asignados. Se retiraron de ambas vistas — no es solo migración de datos,
  corrige una fuga que tenía el prototipo.
- Alcance acordado explícitamente con el usuario antes de implementar:
  `mockLessonPlans` se mantiene (no hay `activities` real poblada todavía);
  la tarjeta de avance en `/padre` se reemplaza por un aviso "disponible
  próximamente" en vez de mostrar un gráfico en 0% (`progress_entries` sin
  sembrar); `app/estudiante/[subjectId]/page.tsx` se incluyó en el alcance
  aunque no estaba en la lista original, porque era la única forma de
  eliminar `legacyStudentBridge.ts` sin dejar referencias activas.
- `lib/mockData.ts`, `lib/progress.ts`, `components/ProgressChart.tsx`,
  `components/StudentRoster.tsx` y `app/estudiantes/[studentId]/page.tsx`
  no se tocaron — fuera de alcance de esta fase.

### Pendiente conocido
- `db/seed.ts` no siembra usuarios `padre` ni filas en `guardian_students`;
  `/padre` funciona pero siempre mostrará "sin estudiantes vinculados" hasta
  que se agregue esa semilla.

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-08-18] — Fase 0: Gobernanza, configuración de repositorio y bitácoras

**Fase activa:** Fase 0 — Gobernanza, Configuración de Repositorio y Bitácoras

### Cambios implementados
- Creado `CLAUDE.md` con stack, reglas de seguridad y comandos de desarrollo.
- Ampliado `.gitignore` (editor, bases de datos SQLite locales, logs).
- Creado `docs/BITACORA_DESARROLLO.md` (este archivo).
- Creado `CHANGELOG.md` bajo Keep a Changelog, versión 0.1.0.
- Inicializado el repositorio git y commit inicial de gobernanza.

### Decisiones de arquitectura
- `CLAUDE.md` conserva `@AGENTS.md` como importación inicial: ese archivo lo
  regenera `next dev` con advertencias sobre las diferencias de esta versión
  de Next.js; no se elimina ni se duplica su contenido.
- El aislamiento de `clinical_info` y la matriz de `lib/permissions.ts` ya
  existían en el código; Fase 0 los formaliza como reglas explícitas de
  gobernanza, no los reimplementa.
- El commit inicial de git incluye solo los 4 artefactos de gobernanza; el
  resto del código fuente existente queda sin trackear hasta la siguiente
  fase (decisión explícita, ver plan de Fase 0).

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):
