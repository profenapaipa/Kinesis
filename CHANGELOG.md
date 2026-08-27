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

### Security
- Fase 1: se retiraron `diagnosis`, `responsibleProfessional` y `lastReview`
  de las vistas de estudiante y padre (información clínica restringida).
- Fase 2: `app/estudiantes/[studentId]` mostraba diagnóstico de cualquier
  estudiante a cualquier docente, sin verificar asignación de curso. Ahora
  pasa por `canViewDiagnosis()`/`isTeacherAssignedToStudentCourse()`.

## [0.1.0] - 2026-08-18

### Added
- Fase 0 — Gobernanza, Configuración de Repositorio y Bitácoras:
  - `CLAUDE.md` con stack, reglas de seguridad (aislamiento de `clinical_info`,
    catálogo de asignaturas MEN, matriz de permisos) y comandos de desarrollo.
  - `.gitignore` ampliado (editor, bases de datos SQLite locales, logs).
  - `docs/BITACORA_DESARROLLO.md` como plantilla de auditoría de avances.
  - Inicialización del repositorio git.
