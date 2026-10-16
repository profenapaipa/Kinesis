# Insumos para el artículo base (Equipo 3)

Datos verificables, tomados del repositorio y de la carpeta de Drive, para llenar `Articulo_base.docx` (carpeta *E) 26 y 27 de agosto*). **No es el artículo:** el artículo lo redactan Camila y Santiago con sus palabras. Aquí están los hechos para que no tengan que reconstruirlos de memoria, organizados con las mismas secciones del formato.

Lo marcado con ✍️ solo lo pueden escribir ustedes.

## Título (máximo 20 palabras)

Qué construyeron, para quién y dónde. Datos: una aplicación web, para docentes, orientadores, familias y estudiantes, en el Instituto Infantil y Juvenil, para organizar el PIAR y planear con DUA. Nombre del producto: *Kinesis* (ver `docs/IDENTIDAD_DE_MARCA.md`). ✍️

## 1.1 El problema

- Hecho normativo: el Decreto 1421 de 2017 exige un PIAR para cada estudiante con discapacidad, construido entre el docente, el apoyo pedagógico y la familia.
- Lo que ustedes escribieron el 30 de julio: "Muchos estudiantes con TDAH y/o TEA tienen dificultades para mantener la atención, autorregularse y acceder al aprendizaje mediante herramientas que se adapten a sus necesidades individuales".
- ✍️ Dónde lo observaron y qué evidencia tienen: entrevistas u observación de las sesiones del 22 y 23 de julio.

## 1.3 Pregunta y propósito

- La pregunta del documento de avance: "¿Cómo eliminamos barreras para que el estudiante pueda aprender?"
- ✍️ Pásenla a una pregunta de investigación. La guía del 19 y 20 de agosto anotaba que todavía no estaba escrita.

## 2. Metodología (Design Thinking)

| Fase | Qué hicieron (hechos) | Qué produjo |
|---|---|---|
| Empatizar | Observación del contexto (22 y 23 de julio) | ✍️ Registro de lo observado |
| Definir | Primera propuesta: mandos de videojuego ergonómicos para personas con autismo, con Arduino e impresión 3D | `propuesta_borrador_v0` |
| Idear | **Giro del 30 de julio**: abandonan el mando y pasan a una aplicación de apoyo para profesores con roles de papá, profe y estudiante | Documento `avance` |
| Prototipar | Esqueleto en Next.js con datos simulados (10 de agosto); login por rol (11 de agosto); base de datos real y permisos (agosto a octubre) | Repositorio en GitHub, demostración pública |
| Evaluar o ajustar | ✍️ Pruebas con docentes antes de la muestra | ✍️ |

La decisión del 30 de julio es el punto más interesante para contar: cambiaron de solución sin cambiar de problema.

## 3.1 Qué debe hacer la solución (3 acciones y cómo se comprueba)

1. **El docente crea una actividad pensando en todo el curso** (los tres principios del DUA). Se comprueba en el inicio del docente, con el porcentaje de actividades con DUA completo.
2. **El docente ve, al lado de su actividad, qué necesita cada estudiante con PIAR** de ese curso. Se comprueba en la pantalla *Ajustes PIAR*.
3. **Cada persona ve solo lo que le corresponde**: el estudiante y la familia no ven el diagnóstico; el docente lo ve solo de sus cursos. Se comprueba entrando con cada usuario de demostración.

## 3.2 Con qué se construyó (versiones exactas, de `package.json`)

- Next.js 16.3.0 (App Router), React 19.2.8, TypeScript 5
- Tailwind CSS 4, componentes shadcn/ui sobre @base-ui/react 1.7
- Drizzle ORM 0.45 sobre SQLite (better-sqlite3 13)
- Visual Studio Code, Git y GitHub; demostración en GitHub Pages
- Claude (asistente de IA) para generar y revisar código, como aparece en el Formato 1

## 3.3 Cómo funciona (las tres cajas)

- **Entra:** la persona inicia sesión con usuario y contraseña; el docente escribe su actividad.
- **Hace:** el sistema revisa qué rol tiene y qué estudiantes le corresponden, y cruza la actividad con los perfiles pedagógicos de su curso.
- **Sale:** a cada rol, su panel: el docente ve sus clases y los ajustes, la familia el resumen de su hijo o hija, el estudiante sus apoyos en lenguaje cercano.

## 3.4 Qué funciona hoy y qué no (16 de octubre)

**Funciona:** inicio de sesión real, con las contraseñas guardadas como hash (scrypt) y nunca en texto plano; cinco roles (docente, orientador, administrador, acudiente, estudiante); administración de usuarios, cursos, periodos y vínculos de acudientes; creación de actividades con DUA; paneles de inicio del docente, del orientador y de la administración, y vista de ajustes PIAR, todos leyendo la base de datos; un aviso en cada pantalla de que los datos son ficticios; protección del diagnóstico verificada en la versión publicada; demostración pública.

**No funciona todavía:** el registro de un ajuste individual por estudiante (Fase 5); el seguimiento después de la clase (Fase 6); la gráfica de avance (se retiró porque mostraba datos inventados); la carga de archivos de planeación; el despliegue para uso real en el colegio.

✍️ Agreguen lo que ustedes vean que falla al usarla.

## 3.5 Decisiones técnicas (elijan 2 o 3)

1. **Abandonar el mando físico por una aplicación** (30 de julio): una herramienta para el docente llega a todos sus estudiantes, no a uno.
2. **Separar el diagnóstico en una tabla aparte** (`clinical_info`), con una sola función que decide quién lo ve. El administrador no ve diagnósticos aunque administre el sistema.
3. **Diseñar para todos antes de adaptar para uno** (2 de octubre): los tres principios del DUA pasaron a escribirse al crear la actividad, en vez de generar adaptaciones después solo para los estudiantes con PIAR.
4. **Tratar el estilo de aprendizaje (VAK) como una preferencia y no como una regla**, porque la evidencia no respalda enseñar según el "estilo" de cada estudiante.
5. **Publicar una demostración en vez de la app real**: GitHub Pages no puede ejecutar el servidor, así que se publicó una versión con datos ficticios y se dejó dicho en la portada.

## 4.1 Aprendizajes y limitaciones

✍️ Qué saben hacer hoy que no sabían en julio. Su Formato 1 pedía tres habilidades: manejar errores con `try/catch`, diseñar una interfaz accesible y validar lo que escribe el usuario. Las tres están en el código (por ejemplo, `app/login/page.tsx`).

## 5.2 Referencias (para completar la matriz)

- Ministerio de Educación Nacional. (2017). *Decreto 1421 de 2017*. Por el cual se reglamenta en el marco de la educación inclusiva la atención educativa a la población con discapacidad.
- Congreso de Colombia. (1994). *Ley 115 de 1994*, Ley General de Educación.
- Congreso de Colombia. (2012). *Ley Estatutaria 1581 de 2012*, de protección de datos personales.
- CAST. (2018). *Universal Design for Learning Guidelines version 2.2*. http://udlguidelines.cast.org
- Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.
- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest, 9*(3), 105–119.

Verifiquen cada referencia antes de usarla, como pide la sesión del 12 y 13 de agosto.
