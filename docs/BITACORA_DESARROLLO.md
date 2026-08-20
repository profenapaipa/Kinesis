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
