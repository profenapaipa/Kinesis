# De proyecto de semillero a solución sostenible

Qué es Andamio, qué hace falta para que un colegio lo use de verdad y para que siga funcionando cuando el equipo que lo creó se gradúe. Es un documento vivo: complementa `docs/HOJA_DE_RUTA.md` (qué se construye) con el porqué y el para quién.

> **Estado de los datos: todos ficticios.** Ningún estudiante, diagnóstico, PIAR, planeación ni usuario de la base de datos corresponde a una persona real, incluidos los registros que el equipo creó a mano para probar. La app lo dice en cada pantalla con una cinta de "Entorno de pruebas" (`lib/dataMode.ts`), y esa cinta solo se apaga a propósito, después de cumplir la lista de la sección 5.

Fuentes: carpeta del Equipo 3 en Drive (propuesta, avance del 30 de julio, Formato 1 de necesidades, guía del 19 y 20 de agosto, ruta del semestre 2026-II) y el estado del repositorio al 16 de octubre de 2026.

## 1. Cómo llegó hasta aquí

| Fecha | Qué pasó | Evidencia |
|---|---|---|
| 23–30 jul | La primera propuesta eran mandos de videojuego ergonómicos para personas con autismo, con Arduino e impresión 3D. | `00_Propuesta/propuesta_borrador_v0` |
| 30 jul | **Giro**: "ya no se desarrollará el control". El proyecto pasa a ser un sistema de apoyo al aprendizaje inclusivo, con roles de padre, profesor y estudiante, botón de ayuda y materiales del docente. | `00_Propuesta/avance` |
| 6 ago | Entregable para la muestra: "una interfaz clara y sencilla manejada por un profesor". Se considera lograda si a los profesores se les facilita organizar actividades que antes les tomaban más tiempo. | `04_Desarrollo/Formato1_Necesidades_Equipo03` |
| 10–11 ago | Primer esqueleto en Next.js con datos simulados y un selector de rol sin contraseña. | `00_Propuesta/Vs Code montaje` |
| 18 ago – 14 oct | Fases 0 a 7: base de datos real, sesiones con contraseña, permisos centralizados, aislamiento del diagnóstico, DUA en cada actividad, rol de orientador y demostración pública. | `CHANGELOG.md`, `docs/BITACORA_DESARROLLO.md` |
| 16 oct | Identidad de marca y paneles sobre datos reales: el inicio del docente y la vista de ajustes dejan de usar datos simulados. | Este documento |

El giro del 30 de julio fue una buena decisión de producto, y conviene contarlo así en la muestra: el equipo cambió de solución sin cambiar de problema. La barrera sigue siendo la misma, que **el aprendizaje no se adapta a quien lo necesita**. Lo que cambió fue el punto de apoyo: en vez de un objeto para un estudiante, una herramienta para el docente, que llega a todos los estudiantes de su curso.

## 2. El problema, en una frase

En Colombia, el Decreto 1421 de 2017 obliga a cada colegio a construir un **PIAR** (Plan Individual de Ajustes Razonables) para cada estudiante con discapacidad, y a hacerlo entre el docente, el equipo de apoyo pedagógico y la familia. En la práctica el PIAR queda en un documento que el docente no tiene a mano cuando planea su clase, y los ajustes llegan tarde, como parche.

## 3. La propuesta de valor

| Para | Andamio le permite | En vez de |
|---|---|---|
| **Docente** | Diseñar la actividad una vez para todo el curso (DUA) y ver al lado qué necesita cada estudiante con PIAR | Buscar el PIAR en una carpeta y adaptar estudiante por estudiante después de clase |
| **Orientador/a** | Tener a todos los estudiantes del colegio, con su diagnóstico, en un solo lugar con acceso controlado | Hojas de cálculo compartidas con información clínica abierta a cualquiera |
| **Familia** | Ver qué le ayuda a su hijo o hija y cómo apoyar en casa, sin exponer el diagnóstico | Enterarse de los ajustes solo en la entrega de notas |
| **Estudiante** | Conocer sus apoyos explicados en segunda persona, sin lenguaje clínico | No saber que tiene derecho a más tiempo o a responder de forma oral |
| **Colegio** | Tener evidencia de que cumple el Decreto 1421 | Reconstruir esa evidencia a mano cuando la piden |

Lo que **no** es: no diagnostica, no reemplaza al equipo de apoyo y no le dice al docente qué hacer. Organiza la información para que las personas decidan mejor.

## 4. Cómo sabremos que funciona

El criterio del Formato 1 ("se les facilita organizar las actividades") se puede convertir en indicadores medibles. La app ya guarda todo lo necesario para calcularlos:

| Indicador | Cómo se mide | Dónde está el dato |
|---|---|---|
| Actividades con DUA completo | % de actividades con los 3 principios escritos (ya visible en el inicio del docente) | `activities.*_notes` |
| Tiempo de planeación | Cronómetro en el pilotaje: planear una clase con y sin Andamio | Prueba con usuarios antes de la muestra (la ruta del semestre la ubicaba el 14 y 15 de oct) |
| Cobertura del PIAR | % de estudiantes con PIAR cuyo perfil tiene barreras y apoyos registrados | `pedagogical_*`, `effective_supports` |
| Uso real | Docentes que crearon al menos una actividad en el periodo | `activities.teacher_user_id` |
| Seguimiento | Actividades con seguimiento registrado frente a pendientes | `tracking_entries`, `activities.status` (Fase 6) |

Para la muestra del 28 y 29 de octubre bastan dos: **el % de DUA completo** y **una medición de tiempo** con dos o tres docentes. En la base de datos local ya hay una señal: la única actividad creada desde la interfaz, y no por el script de datos semilla ("Introducción a hojas de cálculo", de una cuenta de prueba del equipo), es también la única con DUA escrito. El script de semilla no escribe esos campos, así que la cifra que cuenta es la de las actividades que crean los docentes.

## 5. Lo que exige la ley, más allá del PIAR

Aquí es donde un proyecto estudiantil suele dejar de ser viable si no se planea. Andamio guarda **datos de salud de menores de edad**, que es la categoría más protegida de la ley colombiana.

| Norma | Qué exige | Cómo está Andamio |
|---|---|---|
| **Ley 1581 de 2012**, Art. 5 | Los datos de salud son *sensibles*: se necesita autorización explícita y solo se tratan para una finalidad concreta | ✅ El diagnóstico está aislado en `clinical_info` y solo lo abre `canViewDiagnosis()`. ⏳ Falta el registro de la autorización de la familia |
| **Ley 1581 de 2012**, Art. 7 | Los datos de niños, niñas y adolescentes solo se tratan en su interés superior y respetando sus derechos | ✅ La vista del estudiante no muestra el diagnóstico. ⏳ Falta una política de tratamiento publicada |
| **Decreto 1074 de 2015** (que compila el Decreto 1377 de 2013) | Política de tratamiento, aviso de privacidad, atención de consultas y reclamos | ⏳ Pendiente: es un documento del colegio, pero la app debe enlazarlo |
| **Decreto 1421 de 2017** | El PIAR lo hacen el docente, el apoyo pedagógico y la familia, y se revisa periódicamente | ✅ Están los roles de docente, orientador y acudiente. ⏳ Falta la fecha de revisión y la firma de la familia (Fase 6) |
| **Ley 1618 de 2013** | Garantiza los derechos de las personas con discapacidad, incluido el acceso a la información | ⏳ Falta una auditoría de accesibilidad WCAG 2.1 AA con lector de pantalla |

**Antes de cargar un solo dato real** tiene que estar lista esta lista. Mientras tanto, solo datos ficticios, como hasta ahora:

- [ ] Consentimiento de cada familia, registrado.
- [ ] Política de tratamiento de datos firmada por el colegio y enlazada desde la app.
- [ ] Copias de seguridad cifradas, con una restauración ya probada.
- [ ] Registro en `audit_log` de cada lectura de `clinical_info`.
- [ ] Catálogos sin datos personales: que una categoría de apoyo no pueda llevar un nombre ni un diagnóstico (en las pruebas apareció "santiago Vanegas / tiene tdh", que es ficticio, pero nada lo impide).
- [ ] Contraseñas de demostración retiradas.
- [ ] Recién entonces, compilar con `NEXT_PUBLIC_ANDAMIO_DATOS_REALES=1` para quitar la cinta de "Entorno de pruebas".

## 6. Arquitectura para producción

Hoy la app corre en un computador con SQLite en disco, y la demostración de GitHub Pages es estática, sin inicio de sesión real. Hay tres caminos para que el colegio la use:

| Opción | Cómo | A favor | En contra |
|---|---|---|---|
| **A. Servidor propio** (recomendada para el piloto) | Un VPS pequeño con Node y el SQLite de hoy, copias diarias cifradas fuera del servidor y HTTPS | Cero cambios de código; costo mensual bajo | Alguien tiene que administrarlo (actualizaciones, copias) |
| B. Serverless con libSQL/Turso | Vercel u otro similar, con la BD en libSQL (compatible con SQLite, mismo Drizzle) | Sin servidor que mantener | Hay que adaptar `db/index.ts`; la BD de un tercero queda fuera del país, lo que la Ley 1581 obliga a evaluar |
| C. PostgreSQL gestionado | Migrar el esquema de Drizzle a Postgres | Escala a varios colegios | Es una migración real; no hace falta para un solo colegio |

Lo que hace falta antes de producción, en orden:
1. ~~Retirar el código simulado de las pantallas.~~ Hecho el 16 de octubre: ninguna pantalla lee `lib/mockData.ts`, que queda solo para la semilla, y ESLint lo impide.
2. Rotar las contraseñas de demostración y obligar a cambiar la contraseña en el primer ingreso.
3. Escribir en `audit_log` (la tabla ya existe) cada lectura de `clinical_info`: quién vio qué diagnóstico y cuándo.
4. Tener copias de seguridad automáticas y **probar una restauración**.
5. Pruebas automáticas al menos para `lib/permissions.ts`: es la parte cuyo error tiene consecuencias legales.

## 7. Que sobreviva al semillero

El riesgo más grande de sostenibilidad no es técnico: Camila y Santiago se van a graduar. Lo que lo mitiga:

- **Que el dueño sea el colegio**, no las cuentas personales. El repositorio y el despliegue deberían quedar en una organización de GitHub institucional, con al menos dos administradores adultos.
- **Una licencia explícita.** Hoy el repositorio no tiene archivo `LICENSE`. Para que otros colegios puedan usarlo y mejorarlo, una licencia libre (MIT, o AGPL-3.0 si se quiere que las mejoras vuelvan a la comunidad) es una decisión que deben tomar el equipo y el colegio.
- **Relevo dentro del semillero.** Que una nueva cohorte del semillero reciba el proyecto como línea de trabajo, con `docs/` como material de entrada. La bitácora y la hoja de ruta ya están escritas para eso.
- **Reglas que no dependen de la memoria.** Lo crítico ya está escrito en `CLAUDE.md` y en los comentarios del código. Cualquier persona que llegue nueva, o cualquier asistente de IA, las encuentra ahí.

## 8. Lo que sigue

**Antes de la muestra (28 y 29 de oct):**
- [ ] Que el equipo decida el nombre (ver `docs/IDENTIDAD_DE_MARCA.md`).
- [ ] Pilotaje con dos o tres docentes: crear una actividad con DUA y tomar el tiempo.
- [ ] Llevar al artículo base los insumos de `docs/INSUMOS_ARTICULO_BASE.md`.
- [ ] Ensayar la demostración: inicio del docente, luego planeación con DUA, luego ajustes PIAR, luego la vista de la familia.

**Primer semestre de 2027:**
- [ ] Fase 5: ajustes individuales, registrados por estudiante y por actividad (`activity_adaptations`).
- [ ] Fase 6: seguimiento y revisión periódica del PIAR con la familia.
- [ ] Consentimiento de la familia y política de tratamiento de datos.
- [ ] Despliegue piloto (opción A) con un curso real.
