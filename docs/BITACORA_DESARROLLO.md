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
