# Hoja de ruta — Kinesis (Planeación Inclusiva PIAR)

Documento vivo. Se actualiza cada vez que se completa o se replantea una fase — ver `docs/BITACORA_DESARROLLO.md` para el detalle técnico de cada una y `CHANGELOG.md` para el registro formal de cambios. El porqué y el para quién (problema, propuesta de valor, marco legal, sostenibilidad) están en `docs/PRODUCTO_Y_SOSTENIBILIDAD.md`; la marca, en `docs/IDENTIDAD_DE_MARCA.md`.

## Estado por fase

| Fase | Nombre | Estado |
|---|---|---|
| 0 | Gobernanza, configuración de repositorio y bitácoras | ✅ Completa |
| 1 | Migración de mock data a BD real (estudiante y padre) | ✅ Completa |
| 2 | Roster real del docente y cierre de fuga de diagnóstico | ✅ Completa |
| 3 | Vínculo acudiente-estudiante | ✅ Completa |
| 4 | Planeación de clase real sobre `activities` | ✅ Completa |
| 4.1 | Diseño Universal de Aprendizaje (DUA) en la creación de actividad + reencuadre del modelo VAK | ✅ Completa |
| 5 | Generador de ajustes individuales focalizados (reenfocada — ver más abajo) | 🟡 Iniciada: vista de cruce real en `/generador` (2026-10-16); falta registrar el ajuste |
| 6 | Seguimiento pedagógico y avance | ⏳ Pendiente |
| 7 | Equipo de apoyo / orientador (nueva) | ✅ Completa (acceso institucional completo, confirmado) |
| 8 | Pulido administrativo | ⏳ Pendiente |
| 9 | Calidad, retiro de mock data y despliegue | ⏳ Pendiente |
| — | Demostración pública con datos ficticios (GitHub Pages) | ✅ Completa |
| — | Diseño UX/UI (pista paralela, no bloquea las anteriores) | 🎨 En curso: marca y paneles (2026-10-16) |

## Replanteamiento pedagógico (2026-10-02)

Se hizo una auditoría de la arquitectura contra el marco DUA (CAST), el Decreto 1421 de 2017 (MEN, regula el PIAR en Colombia) y evidencia de ciencia cognitiva. Resultado: 3 decisiones estratégicas confirmadas por el usuario que cambian el resto de la hoja de ruta.

### 1. Fase 5 pasa de "generador reactivo" a "ajustes focalizados" (ya ejecutado en Fase 4.1)

El diseño original generaba adaptaciones *después* de crear la actividad, solo para estudiantes con PIAR — el patrón que DUA busca evitar (diseñar para un "estudiante promedio" y parchar después). `activity_adaptations` ya modelaba correctamente los 3 principios DUA (`representationText`/`actionExpressionText`/`participationText` = Representación / Acción y Expresión / Participación), pero a nivel individual.

**Cambio ejecutado:** se agregaron los mismos 3 principios a nivel de *toda la actividad* (`activities.representation_notes`/`expression_notes`/`engagement_notes`, opcionales) directamente en el formulario de creación (Fase 4, ya construido). Esto reduce lo que falta por construir en la Fase 5 real: ya no hace falta generar adaptaciones para cada estudiante con PIAR desde cero — la mayoría del diseño universal ya ocurrió una sola vez, al crear la actividad. La Fase 5 que queda pendiente es más angosta: ajustes verdaderamente individuales que el diseño universal no alcanza a cubrir.

### 2. El modelo VAK (estilo de aprendizaje visual/auditivo/kinestésico) se reencuadra como preferencia, no como prescripción

La evidencia en ciencia cognitiva no respalda que enseñar según el "estilo preferido" de cada estudiante mejore el aprendizaje — es uno de los mitos educativos más estudiados y refutados. DUA nació en parte como alternativa a esto: ofrecer múltiples canales a todos en vez de clasificar y limitar.

**Cambio ejecutado:** se quitó el uso de `learningStyle` como título/encabezado prescriptivo ("Aprende mejor: Visual") en `app/padre/page.tsx` y `app/estudiantes/[studentId]/page.tsx`. Ahora aparece como una nota secundaria ("Prefiere aprender: Visual — es una preferencia, no un límite"), y a los docentes se les recuerda explícitamente que el diseño universal ya cubre varios formatos. El campo y la tabla `student_learning_preferences` (autoreportada) no se tocan — seguían bien diseñados desde Fase 1.

### 3. Falta un rol que represente al equipo de apoyo (orientador/docente de apoyo pedagógico)

El Decreto 1421 exige que el PIAR lo defina un equipo interdisciplinario (docente + apoyo pedagógico + familia), no el docente solo. Hoy el sistema tiene 4 roles y el profesional de apoyo solo existe como texto libre dentro de `clinical_info`.

**Ejecutado:** se agregó el rol `orientador` con acceso institucional completo (opción 1 de las dos evaluadas), confirmado explícitamente por el usuario dado que toca la única regla "no negociable" del proyecto.

- `types/index.ts` y `db/schema.ts`: `orientador` agregado a `Role`/`users.role` (sin migración — el enum es solo a nivel de TypeScript en SQLite).
- `lib/permissions.ts`: fila `orientador` en la matriz; `canViewDiagnosis()` devuelve `true` para `orientador` sin condición de curso — única excepción documentada a "sin atajos", porque es justamente la función real de ese rol.
- `lib/data/students.ts`: `listAllStudentsForSupport()`/`getStudentProfileForSupport()`/`getPedagogicalSummaryForSupport()` — mismo patrón que las variantes de docente/padre, pero sin el filtro por curso.
- Reutiliza el roster y la vista de detalle ya construidos en Fase 2 (`app/estudiantes/**`) en vez de construir pantallas nuevas — `requireRole("docente", "orientador")` y una rama según el rol.
- Usuario de demostración: `orientador.demo` / `orientador123` en `db/seed.ts`.
- Verificado con servidor real: ve los 10 estudiantes del colegio (no solo los de un curso), ve diagnóstico completo (ej. TDAH de Valentina) sin restricción, un id inventado da 404, y los demás roles no ganaron acceso a `/estudiantes`.

## Pista paralela: Diseño UX/UI

Diagnóstico: la interfaz actual usa los patrones típicos de "generado sin dirección de diseño" (tarjetas con borde de acento, tipografía funcional sin carácter) — no transmite la calidez que busca una plataforma de educación inclusiva para niños y familias.

**Decidido el 2026-10-14** (sobre el comparador `referencias visuales/Opciones de tipografía PIAR.html`, que mostraba 6 opciones en modo claro y oscuro):

- **Tipografía: Nunito** (opción 2), una sola familia para títulos y texto. Terminaciones redondeadas, la más amable y cercana de las comparadas — coherente con que la usen niños y familias, no solo docentes. Títulos en peso 900.
- **Color: dos direcciones reales**, ya aplicadas en `app/globals.css`:
  - *Dirección B* en modo claro: fondo hueso (`#fafaf8`), superficies blancas, bordes casi imperceptibles, azul pizarra desaturado (`#5b7088`) como color de acción.
  - *Dirección C* en modo oscuro: azul noche (`#16222b`), tarjetas un paso más claras (`#1d2e39`) y turquesa (`#3fd9c4`) como único color de acción.
- El modo oscuro se activa por `prefers-color-scheme`, no por una clase `.dark`: la app no tiene interruptor de tema y la clase nunca se activaba, así que las utilidades `dark:` ya escritas en los componentes estaban muertas.

Siguiente paso: con la tipografía y la paleta fijadas, construir el sistema de diseño completo (densidad, jerarquía de tarjetas, estados vacíos, ilustración). Pendiente de revisar con el estilo nuevo: los pesos de `CardTitle` y los encabezados de sección (`text-lg`), que siguen en 600 y podrían subir.

## Despliegue: demostración estática en GitHub Pages (2026-10-14)

La app real **no puede correr en GitHub Pages**, que solo sirve archivos estáticos: depende de `cookies()`, 21 handlers de API, `proxy.ts` consultando la BD en cada navegación y SQLite en disco — todo en la lista de "no soportado" del export estático de Next.

Lo que se publica es una **demostración navegable con datos ficticios** (`npm run demo:build`, `.github/workflows/deploy-demo.yml`), rotulada como tal en la portada y en una cinta permanente. Un sub-sitio por rol, porque sin servidor el rol tiene que quedar fijo al compilar.

Decisión clave: la demostración usa las páginas, `lib/data/*` y `lib/permissions.ts` **reales**, no copias. En un export estático los Server Components corren durante el build, en Node, así que SQLite funciona mientras compila. Se verificó contra el HTML publicado que `administrador`, `estudiante` y `padre` no contienen el texto del diagnóstico en ningún archivo, y que `docente` (asignado al curso) y `orientador` sí: `canViewDiagnosis()` siguió siendo la única puerta.

Esto **no reemplaza** el despliegue de la Fase 9: para que el colegio la use de verdad hace falta un host con Node y disco persistente (o mover SQLite a libSQL/Turso si se va a serverless).

## Identidad de marca y paneles sobre datos reales (2026-10-16)

Se cruzó el repositorio con la carpeta del Equipo 3 en Drive (propuesta, avance del 30 de julio, Formato 1, guías de sesión y ruta del semestre). Dos hallazgos cambiaron la prioridad:

1. **El inicio del docente (`app/page.tsx`) y el generador (`app/generador`) seguían sobre `lib/mockData.ts`**, aunque el resto de la app ya leía la BD desde la Fase 2. Además, ninguno de los dos exigía rol: un estudiante o un acudiente con sesión podía abrir `/generador` y ver estudiantes ficticios **con diagnóstico**. Los datos eran ficticios, pero el patrón contradecía la regla de aislamiento clínico.
2. **El semillero pidió nombre y logo propios** (sesión del 9 y 10 de septiembre) y la app no tenía identidad: se llamaba "Planeación Inclusiva" y usaba un ícono genérico.

**Ejecutado:**
- **Marca:** primero se propuso *Andamio* y, ese mismo día, el proyecto la cambió por **Kinesis** (el porqué está en `docs/IDENTIDAD_DE_MARCA.md`). El nombre y los textos salen de `lib/brand.ts`, el logo de `components/brand/BrandMark.tsx` y `app/icon.svg`, y las páginas usan la plantilla de título "Sección · Kinesis".
- **Inicio del docente sobre datos reales** (`lib/data/teacherDashboard.ts`): estudiantes y PIAR de sus cursos, actividades, % con DUA completo, próximas clases, actividades con DUA incompleto y un único "siguiente paso".
- **`/generador` → "Ajustes PIAR"**: muestra la actividad real con sus tres principios DUA al lado de las barreras, los apoyos que han funcionado y las fortalezas de cada estudiante con PIAR del curso. No muestra el diagnóstico. Se eliminó `components/AdaptationGenerator.tsx`. La selección va por la ruta `/generador/[activityId]` y no por `?actividad=`, para que la demostración estática siga funcionando.
- **Guards:** `/` y `/generador` exigen `docente`. `requireRole()` ahora devuelve a cada usuario a su propio panel en vez de a `/`, que habría sido un bucle. `ROLE_HOME` y `ROLE_LABEL` quedan centralizados en `lib/roles.ts`; antes había cuatro copias.

**Segunda tanda, el mismo día:**
- **Datos ficticios, explícito.** Todos los datos son ficticios, confirmado por el usuario. La app real lo dice en cada pantalla y en el login (`lib/dataMode.ts`). La cinta está encendida por defecto y solo se apaga compilando con `NEXT_PUBLIC_KINESIS_DATOS_REALES=1`, después de cumplir la lista de la sección 5 de `docs/PRODUCTO_Y_SOSTENIBILIDAD.md`.
- **Inicio del orientador** (`/orientacion`): perfiles PIAR por completar (sin barreras, sin apoyos o sin curso), cursos y % de actividades con DUA en el colegio. No lee `clinical_info`.
- **Inicio de administración** con las piezas de `components/panel/`.
- **Código simulado retirado:** `lib/adaptationEngine.ts`, `lib/progress.ts` y `components/ProgressChart.tsx`. `lib/mockData.ts` se queda **solo** como datos de `db/seed.ts`, y una regla de ESLint impide importarlo desde `app/` o `components/`.

**Tercera tanda (2026-10-16): referencia final de diseño y apariencia configurable.**
- Toda la app sigue `referencias visuales/Referencia final diseño.html`: encabezado en degradado con la hoja de cifras encima, tarjetas redondeadas, pestañas píldora, barra inferior flotante en el celular. Solo se tomó lo visual: la lógica de esa referencia guarda diagnósticos en `localStorage` y la IA se llama desde el navegador con la clave a la vista, dos cosas que la app no debe hacer.
- Menú **Apariencia**: modo Sistema/Claro/Oscuro, seis colores y uno personalizado, texto más grande (ver la sección 3 de `docs/IDENTIDAD_DE_MARCA.md`).
- Paneles de la familia y del estudiante con `components/panel/`. Retirado el bloque "Avance académico — disponible próximamente" de la familia: no había datos detrás, y la regla de los paneles es no mostrar cifras sin respaldo.

**Siguiente en esta pista:** probar los paneles con el Equipo 3 y con dos o tres docentes antes de la muestra (28 y 29 de octubre); exportar `app/favicon.ico` con el logo; decidir si la preferencia de apariencia debe viajar con la cuenta (hoy es por dispositivo).
