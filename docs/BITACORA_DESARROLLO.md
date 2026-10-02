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

## [2026-08-21] — Fase 3: Vínculo acudiente-estudiante

**Fase activa:** Fase 3 — Vínculo acudiente-estudiante

### Cambios implementados
- Nuevo `lib/data/guardianStudents.ts`: `listGuardianLinks()` (primer
  self-join del proyecto, alias de `users` para acudiente y estudiante),
  `createGuardianLink()` (valida que el par acudiente-estudiante no exista
  ya) y `deleteGuardianLink()` (primer borrado físico del proyecto — hasta
  ahora todo era activar/desactivar; tiene sentido aquí por ser una fila de
  relación, no una entidad con ciclo de vida propio).
- `app/api/admin/guardian-students/route.ts` (GET/POST) y
  `[id]/route.ts` (DELETE), mismo patrón que el resto de `/api/admin/*`.
- `components/admin/CreateGuardianLinkForm.tsx` y
  `RemoveGuardianLinkButton.tsx` + `app/admin/acudientes/page.tsx`, nueva
  sección en el nav de admin (`components/AppShell.tsx`).
- `db/seed.ts`: acudiente de demostración (`padre.demo`/`padre123`)
  vinculado a Valentina Rodríguez Gómez — antes era imposible probar
  `/padre` con datos reales (Fase 1 solo pudo verificar el estado vacío).

### Decisiones de arquitectura
- `authorizedForDiagnosis` se captura en el formulario y se guarda, pero
  **no se conecta a `canViewDiagnosis()`** — esa función sigue devolviendo
  `false` para cualquier rol distinto de docente. Marcarlo hoy no otorga
  ningún acceso clínico; conectarlo es una decisión de política aparte,
  fuera de esta fase.
- Duplicados de un mismo par acudiente-estudiante se rechazan a nivel de
  aplicación (chequeo antes del insert, mismo patrón que `createUser` con
  el username), no con una restricción única en el esquema.

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-10-02] — Fase 7: Rol de orientador (equipo de apoyo pedagógico)

**Fase activa:** Fase 7 — Equipo de apoyo / orientador

### Cambios implementados
- `types/index.ts` + `db/schema.ts`: nuevo rol `orientador` (sin migración,
  el enum es solo a nivel TypeScript para columnas `text` en SQLite).
- `lib/permissions.ts`: fila `orientador` en la matriz de permisos;
  `canViewDiagnosis()` devuelve `true` para `orientador` sin condición de
  curso — única excepción documentada a "sin atajos" en todo el proyecto.
- `lib/data/students.ts`: `listAllStudentsForSupport()`,
  `getStudentProfileForSupport()`, `getPedagogicalSummaryForSupport()` —
  mismo patrón que las variantes de docente (`...ForTeacher`) y padre
  (`getChild...`), sin el filtro de curso asignado.
- `app/estudiantes/page.tsx` y `app/estudiantes/[studentId]/page.tsx`:
  `requireRole("docente", "orientador")`, con una rama según el rol —
  se reutiliza el roster y la vista de detalle de Fase 2 en vez de construir
  pantallas nuevas.
- `components/AppShell.tsx`, `proxy.ts`, `app/login/page.tsx`,
  `app/admin/usuarios/page.tsx`, `components/admin/CreateUserForm.tsx`:
  nav, redirecciones post-login y selector de rol de administración
  actualizados (varios de estos `Record<Role, ...>` — TypeScript obligó a
  completarlos, atrapando 2 sitios que se habrían quedado desactualizados).
- `db/seed.ts`: usuario de demostración `orientador.demo`/`orientador123`.

### Decisiones de arquitectura
- Se reutilizó el roster/detalle de Fase 2 en vez de construir un
  `/orientador/**` nuevo: la única diferencia real es el alcance de la
  consulta (una asignación de curso vs. todo el colegio), no la UI.
- El `catch` en `app/estudiantes/[studentId]/page.tsx` se amplió de
  `PermissionError` a cualquier `Error` → `notFound()`, porque la variante
  de orientador no tiene chequeo de asignación (solo de rol), así que un id
  inválido llega como "no encontrado" en vez de "sin permiso" — ambos deben
  verse como 404, nunca como un error sin manejar.

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-10-02] — Fase 4.1: Diseño Universal de Aprendizaje + reencuadre VAK

**Fase activa:** Fase 4.1 — Replanteamiento pedagógico (DUA-primero) y ajuste del modelo VAK

### Cambios implementados
- `db/schema.ts` + migración `0001_bent_hannibal_king.sql`: nuevas columnas
  opcionales en `activities` — `representation_notes`, `expression_notes`,
  `engagement_notes` (los 3 principios DUA aplicados a toda la actividad,
  no a un estudiante puntual).
- `lib/data/activities.ts`, `app/api/docente/activities/route.ts`,
  `components/CreateActivityForm.tsx`: los 3 campos se capturan (opcionales,
  con preguntas guía) y se muestran en `app/planeacion/[subjectId]/page.tsx`.
- `app/padre/page.tsx` y `app/estudiantes/[studentId]/page.tsx`: se retiró
  el uso de `learningStyle` como título/encabezado prescriptivo ("Aprende
  mejor: Visual"). Ahora es una nota secundaria enmarcada como preferencia,
  no como regla de capacidad.
- Nuevo `docs/HOJA_DE_RUTA.md`: documento vivo con el estado de fases y el
  replanteamiento pedagógico (antes esto solo vivía en el archivo de plan
  efímero de Claude y en el chat).

### Decisiones de arquitectura
- Se reenfocó la Fase 5 (generador de adaptaciones) de reactiva a
  DUA-primero: el diseño universal ocurre una vez, al crear la actividad
  (Fase 4, ampliada aquí); lo que falta en Fase 5 se reduce a ajustes
  verdaderamente individuales. Detalle completo en `docs/HOJA_DE_RUTA.md`.
- El modelo VAK (`learningStyle`) se reencuadra como señal de preferencia/
  motivación, no como criterio para decidir formato — la ciencia cognitiva
  no respalda usarlo de forma prescriptiva. No se tocó el esquema ni
  `student_learning_preferences` (ya estaba bien diseñado como autoreporte).
- `lib/adaptationEngine.ts` (el motor viejo basado en el `Student` mock,
  usado solo por `app/generador/page.tsx`) deliberadamente NO se tocó en
  esta fase — está destinado a reemplazarse completo en la Fase 5
  reenfocada, no tenía sentido parcharlo dos veces.
- Se confirmó agregar un rol `orientador` (equipo de apoyo pedagógico, por
  Decreto 1421) pero se pospuso su implementación: el alcance de acceso a
  `clinical_info` para ese rol es una decisión explícita pendiente, dado
  que es la única regla "no negociable" del proyecto.

### Hallazgo durante la verificación
- Un `npm run dev` arrancado con caché de Turbopack (`.next/`) de una
  sesión anterior sirvió una versión compilada vieja de
  `lib/data/activities.ts` — los 3 campos DUA nuevos no se persistían pese
  a que el código y la migración eran correctos (confirmado insertando
  directo con Drizzle vía `tsx`, sin pasar por el servidor). Se resolvió
  borrando `.next/` y reiniciando. Anotado por si se repite: ante un campo
  nuevo que "no se guarda" pero el código se ve bien, limpiar `.next/`
  antes de seguir depurando.

### Estado de `npx tsc --noEmit`
- [x] Sin errores
- [ ] Errores pendientes (detallar):

---

## [2026-10-02] — Fase 4: Planeación de clase real sobre `activities`

**Fase activa:** Fase 4 — Planeación de clase real

### Cambios implementados
- Nuevo `lib/data/activities.ts`: `listMySubjectsSummary()` y
  `listMyCoursesForSubject()` (para el selector del formulario),
  `listActivitiesForSubject()`/`createActivity()` (vista del docente,
  verificadas con `isTeacherAssignedToCourseSubject()`), y
  `listActivitiesForCourseSubject()`/`listLatestActivityPerSubject()` (lectura
  para estudiante/padre, sin chequeo propio — el `courseId` ya llega resuelto
  desde un perfil validado en `lib/data/students.ts`).
- `lib/permissions.ts`: nuevo `isTeacherAssignedToCourseSubject()` — a
  diferencia de `isTeacherAssignedToStudentCourse()`, exige curso **y**
  asignatura exactos, no solo el curso.
- `lib/data/students.ts`: `StudentBasicProfile` ahora incluye `courseId`
  (necesario para unir con `activities` por curso real, no por coincidencia
  de texto de grado como hacía el mock).
- `lib/testGenerator.ts`: `generateAdaptedTest()` recibe `ActivityContent`
  (`{id, topic, objective, instructions}`) en vez de `LessonPlan`. El modelo
  real no tiene una lista estructurada de sub-actividades — `instructions`
  es texto libre del docente — así que se parte en líneas no vacías para
  generar una pregunta por paso, igual que antes.
- Nuevo `components/CreateActivityForm.tsx` + `app/api/docente/activities/route.ts`
  (primera ruta API fuera de `/api/admin/*`).
- `app/planeacion/page.tsx` y `[subjectId]/page.tsx`, `app/estudiante/page.tsx`,
  `app/estudiante/[subjectId]/page.tsx` y `app/padre/page.tsx` migradas de
  `mockLessonPlans` a datos reales — cierra el pendiente dejado explícitamente
  en Fase 1.
- Eliminado `components/FileUploadDropzone.tsx` (solo guardaba metadata en
  `localStorage`, sin persistencia real; reemplazado por el campo de
  recursos real del formulario).
- `db/seed.ts`: 2 actividades de demostración (Matemáticas, Ciencias
  Naturales) para que las vistas reales tengan contenido de inmediato.

### Decisiones de arquitectura
- El formulario de actividad no replica la estructura antigua de
  sub-actividades con duración individual — el esquema real modela una
  actividad como un único bloque de instrucciones. Se mantiene así
  deliberadamente en vez de forzar una estructura que la tabla no tiene.
- `status` (`preparada`/`pendiente_adaptacion`/.../`pendiente_seguimiento`)
  se guarda con su valor por defecto (`preparada`) pero **no** se construyó
  UI de transición de estado en esta fase — eso pertenece a Fase 5/6
  (generador de adaptaciones y seguimiento), donde el estado tiene sentido
  real dentro del flujo.
- `listActivitiesForCourseSubject()`/`listLatestActivityPerSubject()` no
  repiten el chequeo de permisos porque el `courseId` que reciben ya fue
  resuelto por una función gateada (`getMyStudentProfile`/`getChildProfile`);
  el contenido que exponen (tema, objetivo, instrucciones, recursos) no es
  clínico ni restringido.

### Hallazgo durante la verificación (no es un bug de esta fase)
- La base de datos real tenía activo el período académico "2027" (sin
  cursos ni matrículas) en vez de "2026" (donde vive todo el curso 8°-A
  sembrado) — probablemente activado manualmente desde `/admin/periodos`
  en algún momento. Esto hacía que `getMyStudentProfile()` devolviera
  `grade: null` para cualquier estudiante, afectando a todas las fases
  anteriores también, no solo a esta. Se reactivó "2026" usando la función
  de administración ya existente para poder verificar esta fase con datos
  reales — queda como decisión del usuario cuál período mantener activo.

### Estado de `npx tsc --noEmit`
- [x] Sin errores
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
