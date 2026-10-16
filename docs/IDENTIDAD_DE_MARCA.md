# Identidad de marca — Andamio

Documento de referencia para cualquiera que escriba una pantalla, un texto o una pieza de difusión del proyecto. La implementación vive en `lib/brand.ts` (nombre y textos), `components/brand/BrandMark.tsx` (logo) y `app/globals.css` (color y tipografía).

> **Estado: propuesta.** El nombre lo decide el Equipo 3 (Camila Segura y Santiago Vanegas). Si eligen otro, se cambia en `lib/brand.ts` y `app/icon.svg` y el resto de la app lo toma solo. Ver "Alternativas" al final.

## 1. El nombre

**Andamio** · *Planeación inclusiva con PIAR y DUA*

En la sesión del 9 y 10 de septiembre el semillero pidió nombres propios, no descripciones, y con una razón que se pueda defender. "Planeación Inclusiva PIAR" describe lo que hace la app, pero nadie se acuerda de un nombre así. La razón de este:

- **Un andamio es un apoyo que sostiene mientras se construye y se quita cuando la obra ya se sostiene sola.** Eso mismo es un ajuste razonable: no se queda para siempre, se revisa y se retira cuando el estudiante ya no lo necesita. El Decreto 1421 de 2017 pide justamente eso, revisar el PIAR de forma periódica.
- **En pedagogía la palabra ya tiene ese sentido.** Wood, Bruner y Ross (1976) llamaron *andamiaje* (*scaffolding*) al apoyo que un adulto le da a un niño y que va retirando a medida que el niño avanza. Los docentes la reconocen.
- **No señala a nadie.** No menciona discapacidad ni diagnóstico. Una familia puede decir "lo vemos en Andamio" sin exponer a su hijo o hija, y el estudiante puede usar la app frente a sus compañeros sin que lo marque.

Riesgo conocido: "Andamio" fue uno de los seis *ejemplos* de la sesión del 9 y 10 de septiembre (con Pulpo, Micelio, Fragua, Órbita y Bitácora). Si el semillero lo eligió como nombre propio, hay que escoger otro para no confundir el proyecto con el semillero.

## 2. El logo

Una **"A" dibujada como andamio de tijera**: dos patas que se apoyan una en la otra y dos travesaños para subir. Es una sola forma, en dos colores y sin sombras, que es la regla de logo del semillero ("si al achicarlo al tamaño de una uña todavía se entiende, sirve").

| Uso | Archivo | Colores |
|---|---|---|
| Dentro de la app | `components/brand/BrandMark.tsx` | Sigue el tema: `--primary` de fondo, `--primary-foreground` de trazo |
| Pestaña del navegador | `app/icon.svg` | Fijos: pizarra `#5b7088` y blanco en modo claro, turquesa `#3fd9c4` y `#08201d` en modo oscuro |

Reglas:
- No se estira, no se gira, no se le agregan sombras ni degradados.
- El espacio libre alrededor del logo es, como mínimo, el grosor de un travesaño.
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

Andamio le habla a cuatro públicos, pero siempre con la misma voz: **cercana y concreta, sin tecnicismos**. Cambia el registro; el respeto es el mismo para todos.

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

## Alternativas, si el equipo prefiere otro nombre

| Nombre | La razón en dos líneas |
|---|---|
| **Puente** | Une lo que planea el docente con lo que necesita cada estudiante. Es más genérico y ya hay muchos productos con ese nombre. |
| **Tejido** | El PIAR lo arman entre varios: docente, apoyo y familia (Decreto 1421). Se entiende menos a primera vista. |
| **Brújula** | Orienta sin decidir por nadie. Es frecuente en educación y diferencia poco. |
