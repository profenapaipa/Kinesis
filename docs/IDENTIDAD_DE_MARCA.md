# Identidad de marca — Kinesis

Documento de referencia para cualquiera que escriba una pantalla, un texto o una pieza de difusión del proyecto. La implementación vive en `lib/brand.ts` (nombre y textos), `components/brand/BrandMark.tsx` (logo) y `app/globals.css` (color y tipografía).

> **Estado: decidido el 2026-10-16.** El nombre es *Kinesis*. Ese mismo día se había propuesto *Andamio* y se reemplazó por decisión del proyecto. Para cambiarlo otra vez basta tocar `lib/brand.ts` y `app/icon.svg`: el resto de la app lo toma solo.

## 1. El nombre

**Kinesis** · *Planeación inclusiva con PIAR y DUA*

*Kínesis* (κίνησις) es la palabra griega para **movimiento**. En la sesión del 9 y 10 de septiembre el semillero pidió nombres propios, no descripciones, y con una razón que se pueda defender. Esta es la de Kinesis:

- **El PIAR no es una etiqueta: es un plan que se mueve.** El Decreto 1421 de 2017 exige revisarlo de forma periódica, porque el estudiante cambia y sus apoyos también tienen que cambiar. Kinesis nombra ese avance, no una condición fija.
- **Inclusión es quitar lo que frena.** El Diseño Universal de Aprendizaje no busca "arreglar" al estudiante: busca quitar las barreras de la clase para que todos avancen. La app hace eso con la información, que deja de estar quieta en una carpeta y circula entre el docente, el equipo de apoyo y la familia.
- **No señala a nadie.** No menciona discapacidad ni diagnóstico. Una familia puede decir "lo vemos en Kinesis" sin exponer a su hijo o hija.
- **Es corto y se pronuncia igual en español y en inglés**, lo que ayuda si el proyecto llega a otros colegios o a eventos fuera del país.

### Dos riesgos y cómo se manejan

1. **"Kinesis" suena a "kinestésico".** El proyecto dejó explícitamente de usar el modelo VAK (visual, auditivo, kinestésico) como prescripción, porque la evidencia no lo respalda (ver el replanteamiento en `docs/HOJA_DE_RUTA.md`). Por eso la marca **nunca** se asocia a "aprender haciendo" ni a un estilo de aprendizaje: el movimiento del nombre es el **progreso**, no un canal sensorial. El lema lo fija: *"Aprender en movimiento: apoyos que avanzan con cada estudiante."* También puede evocar *kinesiología* (fisioterapia). Por eso conviene presentar siempre el nombre junto al descriptor.
2. **Otras marcas ya usan el nombre.** Por ejemplo Amazon Kinesis (un servicio de AWS) y Kinesis Corporation (teclados ergonómicos). Para un proyecto escolar sin fines comerciales no es un problema inmediato. Si Kinesis se va a ofrecer a otros colegios, antes hay que consultar la base de marcas de la Superintendencia de Industria y Comercio (SIC) en las clases de software y de servicios educativos.

## 2. El logo

Una **"K" en movimiento**: el brazo superior sigue de largo como una trayectoria y termina en un punto, el estudiante que avanza. Es una sola forma, en dos colores y sin sombras: la regla de logo del semillero ("si al achicarlo al tamaño de una uña todavía se entiende, sirve"). Se comprobó renderizándolo a 16 px.

| Uso | Archivo | Colores |
|---|---|---|
| Dentro de la app | `components/brand/BrandMark.tsx` | Sigue el tema: `--primary` de fondo, `--primary-foreground` de trazo y punto |
| Pestaña del navegador | `app/icon.svg` | Fijos: pizarra `#5b7088` y blanco en modo claro, turquesa `#3fd9c4` y `#08201d` en modo oscuro |
| Portada de la demostración | `scripts/demo-landing.html` | Color de acción de la portada y blanco |

Reglas:
- No se estira, no se gira, no se le agregan sombras ni degradados.
- El punto no se separa de la K ni se usa solo como logo.
- El espacio libre alrededor del logo es, como mínimo, el grosor del trazo.
- Tamaño mínimo: 16 px, el de la pestaña del navegador.
- Al lado del logo va el nombre en Nunito 900 (`BrandLockup`). El descriptor solo se agrega donde quepa sin apretar.

Pendiente: `app/favicon.ico` sigue siendo el ícono por defecto de Next. Los navegadores modernos prefieren `icon.svg`, pero falta exportar un `.ico` con el logo para los que no leen SVG.

## 3. Color

La paleta ya estaba definida (2026-10-14, ver `docs/HOJA_DE_RUTA.md`). Lo que agrega este documento es para qué sirve cada color.

| Rol | Claro ("Dirección B") | Oscuro ("Dirección C") | Uso |
|---|---|---|---|
| Acción | `#5b7088` pizarra | `#3fd9c4` turquesa | Botones, enlaces, cifras, el logo. **Un solo color de acción por pantalla.** |
| Fondo | `#fafaf8` hueso | `#16222b` azul noche | Lienzo |
| Superficie | `#ffffff` | `#1d2e39` | Tarjetas y paneles |
| Texto | `#24303f` | `#e8f1f2` | — |
| Texto secundario | `#5b6573` | `#9aa5b1` | Descripciones, pistas |
| Asignaturas | `lib/subjects.ts` | igual | Solo como fondo o ícono, **nunca como texto**: siempre van acompañados del nombre del área |
| PIAR | ámbar | ámbar | Marca lo que pide atención del equipo de apoyo. Nunca rojo: un PIAR no es un error |

## 4. Tipografía

**Nunito**, una sola familia para todo: tiene terminaciones redondeadas y sigue viéndose amable en pesos altos.

- Títulos de pantalla: 900, entre 30 y 36 px.
- Cifras de los paneles: 900, en el color de acción y con `tabular-nums`.
- Texto corrido: 400 a 600, mínimo 14 px. Ninguna instrucción para estudiantes va por debajo de 16 px.

## 5. Voz y tono

Kinesis le habla a cuatro públicos, pero siempre con la misma voz: **cercana y concreta, sin tecnicismos**. Cambia el registro; el respeto es el mismo para todos.

| Público | Registro | Sí | No |
|---|---|---|---|
| Docente | Colega que propone, no que ordena | "Completa el DUA de esta actividad" | "Error: campos obligatorios vacíos" |
| Orientador/a | Técnico cuando hace falta | "Barreras activas", "apoyos que han funcionado" | Jerga clínica en pantallas que no la necesitan |
| Familia | Cálido, en tercera persona sobre el estudiante | "Lo que le ayuda a Valentina" | El diagnóstico como titular |
| Estudiante | Segunda persona, frases cortas | "Tienes más tiempo para terminar" | "Ajuste razonable por condición de…" |

Tres reglas que no se negocian:
1. **Se habla de barreras, no de déficits.** La barrera está en la clase, no en el estudiante: es el marco del DUA y del Decreto 1421.
2. **El estilo de aprendizaje es una preferencia, no un límite** (ver el replanteamiento VAK en la hoja de ruta).
3. **Ningún texto de la interfaz incluye un diagnóstico, salvo donde `canViewDiagnosis()` ya lo autorizó.** Esto vale también para los catálogos: una categoría de apoyo se llama "Pausas activas", no "Santiago – tiene TDAH".

## 6. Paneles

Lo que tienen en común todas las pantallas de inicio (`components/panel/Panel.tsx`), tomado de las referencias de `referencias visuales/`:

1. **Un saludo grande.** El titular dice dónde está la persona, no el nombre del sistema.
2. **Un solo siguiente paso.** Lo que más destraba hoy, con un verbo: "Crea", "Completa", "Revisa".
3. **Las cifras como protagonistas**, en una sola franja y no en una tarjeta por número.
4. **Estados vacíos que enseñan.** Un panel vacío explica qué va a aparecer ahí y cómo se consigue.
5. **Accesible de entrada:** contraste AA, `aria-current` en la navegación, foco visible y animaciones que respetan `prefers-reduced-motion`.

## Historial del nombre

| Fecha | Nombre | Por qué cambió |
|---|---|---|
| hasta el 2026-10-15 | Planeación Inclusiva PIAR | Describía lo que hace la app, pero no era un nombre propio |
| 2026-10-16 | Andamio (propuesta) | El apoyo que se retira cuando ya no hace falta. Además, era uno de los ejemplos de la sesión del 9 y 10 de septiembre |
| 2026-10-16 | **Kinesis** | Decisión del proyecto: el aprendizaje y el PIAR como algo en movimiento |
