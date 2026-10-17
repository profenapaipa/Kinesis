# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

### Added
- Fase 1 — Migración de mock data a BD real (estudiante y padre):
  - `lib/data/students.ts` con las consultas reales de perfil básico, curso
    activo, preferencias de aprendizaje y resumen pedagógico.
  - `app/estudiante/page.tsx`, `app/estudiante/[subjectId]/page.tsx` y
    `app/padre/page.tsx` migradas a Server Components sobre datos reales.
  - Eliminado `lib/legacyStudentBridge.ts`.
- Fase 2 — Roster real del docente y cierre de fuga de diagnóstico:
  - `lib/data/clinicalInfo.ts`: único punto de acceso a `clinical_info` del
    proyecto, siempre gateado por `canViewDiagnosis()`.
  - `lib/data/students.ts` ampliado con `listMyStudents()`,
    `getStudentProfileForTeacher()` y `getPedagogicalSummaryForTeacher()`.
  - `lib/permissions.ts`: `isTeacherAssignedToStudentCourse()` ahora exportada.
  - `app/estudiantes/page.tsx`, `components/StudentRoster.tsx` y
    `app/estudiantes/[studentId]/page.tsx` migradas a datos reales.
  - Pestañas de filtro por grado en `StudentRoster.tsx` derivadas de los
    grados reales presentes (ya no una lista fija), compatibles con
    futuros cursos/grupos en cualquier formato.

- Fase 3 — Vínculo acudiente-estudiante:
  - `lib/data/guardianStudents.ts` (crear/listar/eliminar vínculos) +
    `app/api/admin/guardian-students/**` + UI de administración
    (`app/admin/acudientes/page.tsx`).
  - Acudiente de demostración sembrado en `db/seed.ts`, vinculado a un
    estudiante real — `/padre` ya se puede probar con datos reales.
- Fase 4 — Planeación de clase real:
  - `lib/data/activities.ts`: consultas y creación de actividades reales
    sobre la tabla `activities`, con guard nuevo
    `isTeacherAssignedToCourseSubject()` en `lib/permissions.ts`.
  - `components/CreateActivityForm.tsx` + `app/api/docente/activities/route.ts`
    (primera ruta API docente, fuera de `/api/admin/*`).
  - `app/planeacion/**`, `app/estudiante/**` y `app/padre/page.tsx` migradas
    de `mockLessonPlans` a `activities` real — cierra el pendiente de Fase 1.
  - `lib/testGenerator.ts` adaptado al modelo real (instrucciones en texto
    libre en vez de sub-actividades estructuradas).
  - Eliminado `components/FileUploadDropzone.tsx` (sin persistencia real).
- Fase 4.1 — Diseño Universal de Aprendizaje (DUA) y reencuadre del modelo VAK:
  - `activities` gana 3 campos opcionales (representación/expresión/
    participación) capturados al crear la actividad, no generados después.
  - Nuevo `docs/HOJA_DE_RUTA.md` como documento vivo de fases.
- Fase 7 — Rol de orientador (equipo de apoyo pedagógico, Decreto 1421):
  - Nuevo rol `orientador` con acceso institucional completo a estudiantes
    y diagnóstico clínico (`canViewDiagnosis()`).
  - `lib/data/students.ts`: `listAllStudentsForSupport()` y variantes
    `...ForSupport()`, reutilizando el roster/detalle de Fase 2.
  - Usuario de demostración `orientador.demo`/`orientador123`.
- Demostración estática publicable en GitHub Pages:
  - `scripts/build-demo.mjs` (`npm run demo:build`) compila un sub-sitio por
    rol sobre una base de datos ficticia recién sembrada, reutilizando las
    páginas, `lib/data/*` y `lib/permissions.ts` reales.
  - `lib/demo/session.ts` (sesión fija por `DEMO_ROLE`, sin `cookies()`) y
    `lib/demo/params.ts` (`generateStaticParams()` de las rutas dinámicas).
  - `components/DemoBanner.tsx`: cinta permanente de "datos ficticios" con
    selector de rol, activa solo con `NEXT_PUBLIC_DEMO=1`.
  - `scripts/demo-landing.html` y `scripts/demo-404.html`: portada y 404.
  - `.github/workflows/deploy-demo.yml`: publicación automática en cada push
    a `main` (requiere Settings -> Pages -> Source: "GitHub Actions").

- Identidad de marca *Kinesis* (del griego, "movimiento"): logo de una "K"
  cuyo brazo termina en un punto que avanza, `lib/brand.ts`,
  `components/brand/BrandMark.tsx`, `app/icon.svg` y plantilla de título
  "Sección · Kinesis" en `app/layout.tsx`. Reemplaza a *Andamio*, propuesto
  y publicado el mismo día (`1a9ffe3`). La variable de entorno pasa a
  llamarse `NEXT_PUBLIC_KINESIS_DATOS_REALES`.
- Estilo de la referencia final de diseño en toda la app
  (`referencias visuales/Referencia final diseño.html`): encabezados en
  degradado (`PanelHeader`, también en versión compacta con "volver"), cifras
  montadas sobre el degradado, tarjetas redondeadas con sombra, pestañas
  tipo píldora, barra de navegación flotante en el celular y entrada
  escalonada de los bloques. Login, portada y 404 de la demostración
  rediseñados con la misma línea.
- Menú **Apariencia** (`components/theme/`, `lib/theme.ts`): modo Sistema /
  Claro / Oscuro, seis colores principales (Kinesis, Océano, Uva, Coral,
  Pizarra, Daltónico), color personalizado con contraste AA garantizado y
  "texto más grande". La paleta completa se deriva del color elegido con
  `color-mix()`; un script en `<head>` evita el destello del tema.
- Paneles de la familia (`/padre`) y del estudiante (`/estudiante`) con las
  piezas de `components/panel/`, cada uno con su tono. La familia ve a todos
  sus hijos vinculados (antes solo el primero).
- El paquete pasa a llamarse `kinesis` (antes `planeacion-piar`), igual que
  el repositorio y la carpeta; `Iniciar App.bat` también dice Kinesis.
- `components/panel/Panel.tsx`: encabezado con saludo, franja de cifras,
  tarjeta de siguiente paso y estado vacío, compartidos por los paneles.
- `lib/data/teacherDashboard.ts`: inicio del docente sobre datos reales.
- `/generador` pasa a "Ajustes PIAR", sobre datos reales:
  `components/AdjustmentsView.tsx`, `app/generador/[activityId]`,
  `listMyActivities()`/`getMyActivity()` en `lib/data/activities.ts` y
  `listCourseStudentsWithSummaryForTeacher()` en `lib/data/students.ts`.
- `lib/roles.ts`: `ROLE_HOME` y `ROLE_LABEL` en un solo lugar.
- Aviso permanente de **datos ficticios** en la app real:
  `lib/dataMode.ts` y `components/FictionalDataBanner.tsx`, más una nota en
  el login. Está encendido por defecto y solo se apaga compilando con
  `NEXT_PUBLIC_KINESIS_DATOS_REALES=1`.
- Inicio del orientador (`app/orientacion`, `lib/data/supportDashboard.ts`):
  perfiles PIAR por completar, cursos y % de actividades con DUA en todo el
  colegio. `/orientacion` pasa a ser el inicio del rol.
- Regla de ESLint: `app/**` y `components/**` no pueden importar
  `lib/mockData.ts`.
- Documentación: `docs/IDENTIDAD_DE_MARCA.md`,
  `docs/PRODUCTO_Y_SOSTENIBILIDAD.md` y `docs/INSUMOS_ARTICULO_BASE.md`.

### Changed
- `app/page.tsx` (inicio del docente) deja de leer `lib/mockData.ts`.
- `requireRole()` redirige al panel propio del rol en vez de a `/`.
- Navegación: "Dashboard" pasa a "Inicio" y "Generador PIAR" a "Ajustes PIAR";
  el ítem activo se marca también en las subrutas y lleva `aria-current`.
- Login con la marca; el mensaje de error lleva `role="alert"`.
- Inicio de administración rehecho con `components/panel/`: siguiente paso,
  accesos directos y alertas (incluido el seguimiento pendiente).
- El formulario de categorías de apoyo pide no escribir nombres ni
  diagnósticos, porque ese catálogo lo ven familias y estudiantes.
- `LEARNING_STYLE_LABEL` pasa a `lib/studentFriendlyText.ts`.
- `lib/mockData.ts` queda solo como datos de `db/seed.ts`.
- Tipografía: Nunito (opción 2 del comparador en `referencias visuales/
  Opciones de tipografía PIAR.html`) reemplaza a Geist como familia única de
  títulos y texto. `--font-sans` estaba definida de forma circular en
  `app/globals.css` y la app venía cayendo en la fuente por defecto del
  navegador.
- Color: `app/globals.css` pasa a dos direcciones reales — "Dirección B"
  (clara y serena) en modo claro y "Dirección C" (azul noche con turquesa)
  en modo oscuro. El modo oscuro ahora responde a `prefers-color-scheme` en
  vez de a una clase `.dark` que nunca se activaba, así que las utilidades
  `dark:` ya escritas en los componentes por fin funcionan.
- Títulos de pantalla en peso 900 y cifras de los tableros con el color de
  acción, como en la referencia visual elegida.
- `app/padre/page.tsx` y `app/estudiantes/[studentId]/page.tsx` ya no usan
  el estilo de aprendizaje (VAK) como encabezado prescriptivo — se presenta
  como preferencia, no como regla de capacidad.

### Removed
- `components/AdaptationGenerator.tsx` y `lib/adaptationEngine.ts` (motor de
  reglas sobre estudiantes ficticios).
- `components/ProgressChart.tsx` y `lib/progress.ts`: la gráfica de avance
  simulada, que ya no usaba ninguna página.
- Tipos sin uso en `types/index.ts`: `AdaptedActivity`, `StudentAdaptation`
  y `StudentProgress`.

### Security
- `/` y `/generador` no exigían rol: cualquier usuario con sesión
  (estudiante, acudiente) podía abrir el generador, que mostraba estudiantes
  de `lib/mockData.ts` con diagnóstico. Ahora exigen `docente`, y la vista
  nueva no muestra diagnósticos.
- Fase 1: se retiraron `diagnosis`, `responsibleProfessional` y `lastReview`
  de las vistas de estudiante y padre (información clínica restringida).
- Fase 2: `app/estudiantes/[studentId]` mostraba diagnóstico de cualquier
  estudiante a cualquier docente, sin verificar asignación de curso. Ahora
  pasa por `canViewDiagnosis()`/`isTeacherAssignedToStudentCourse()`.
- Fase 3: `authorizedForDiagnosis` (nuevo en la UI) se captura pero no se
  conecta a ningún chequeo de acceso todavía — `canViewDiagnosis()` sigue
  restringiendo el diagnóstico exclusivamente al docente asignado.

## [0.1.0] - 2026-08-18

### Added
- Fase 0 — Gobernanza, Configuración de Repositorio y Bitácoras:
  - `CLAUDE.md` con stack, reglas de seguridad (aislamiento de `clinical_info`,
    catálogo de asignaturas MEN, matriz de permisos) y comandos de desarrollo.
  - `.gitignore` ampliado (editor, bases de datos SQLite locales, logs).
  - `docs/BITACORA_DESARROLLO.md` como plantilla de auditoría de avances.
  - Inicialización del repositorio git.
