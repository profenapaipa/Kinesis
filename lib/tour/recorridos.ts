// Recorridos guiados de ejemplo: 4 roles de Kinesis por 5 casos = 20 ejemplos.
//
// Origen: Sinapsis Education / 07_Feria_CCB / recorrido_por_rol.json (versión
// del 9 de noviembre de 2026). Se copia aquí, ya tipado, porque la
// demostración es un sitio estático y no puede leer nada fuera del repositorio
// en tiempo de ejecución. Si cambia la fuente, se vuelve a generar este módulo
// (no se edita a mano el contenido sin actualizar también el JSON).
//
// Honestidad: las respuestas de Niky son PREPARADAS para cada caso. Nada de
// esto se genera en el momento; la interfaz lo presenta como recorrido de
// ejemplo. Los estudiantes aparecen solo con el código del curso (8A-NN).
// El rol "estudiante" del JSON es del portal Wisfox y no se copia: Kinesis no
// lo atiende.

import type { Ejemplo, RolRecorrido } from "./tipos";

export const RECORRIDOS: Record<RolRecorrido, Ejemplo[]> = {
  "docente": [
    {
      "id": "docente-1",
      "caso": "tecnologia",
      "titulo": "Mi primer programa con Turtle",
      "estudiante": "8A-04",
      "situacion": "Planeas el tercer periodo de Tecnología de 8°. La malla pide programar con Python; esta semana toca el «Hola mundo» y Turtle. El estudiante 8A-04 se detiene ante el primer error.",
      "sinapso": "Esta es tu clase. Tú decides cómo empieza; Kinesis te acompaña con lo que ya sabemos del grupo.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Primero miro la malla que cargaste: Tecnología trabaja por competencias, no por estándares. Dime por dónde quieres arrancar."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo abres la primera sesión?",
          "opciones": [
            {
              "texto": "Con un programa que ya funciona y se cambia una palabra",
              "resultado": "El grupo ve un resultado rápido y el error pasa a ser una pista, no un bloqueo."
            },
            {
              "texto": "Con la explicación de la sintaxis",
              "resultado": "Es un camino posible, pero a quien se frustra con reglas abstractas le conviene ver primero el resultado."
            }
          ]
        },
        {
          "pregunta": "¿Cómo propones trabajar?",
          "opciones": [
            {
              "texto": "En parejas que rotan quién escribe y quién guía",
              "resultado": "Cada pareja se apoya y los roles quedan claros."
            },
            {
              "texto": "Cada quien con su computador",
              "resultado": "Cada persona avanza a su ritmo; conviene dejar retos por niveles."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Objetivo de aprendizaje**: programar en Python un primer programa que dibuje un cuadrado con Turtle.\n\n**Evidencia común**: cada estudiante muestra su programa funcionando y explica qué hace una de sus líneas.\n\n**Tres rutas hacia el mismo objetivo**:\n1. Ruta con imagen y color. Recurso: un «Hola mundo» ya funcionando, proyectado, con cada instrucción de un color y el dibujo al lado. Se cambia una palabra y se mira qué cambió.\n2. Ruta interactiva o práctica. Recurso: trabajo en parejas, una persona escribe y la otra guía, y se turnan cada 10 minutos. Retos por niveles: un cuadrado, un cuadrado con un ciclo, una figura propia.\n3. Ruta oral o con audio. Recurso: los pasos en una guía hablada o grabada, y explicar en voz alta qué hará cada línea antes de escribirla.\n\n**Cómo se elige la ruta**: cada pareja elige por dónde empieza y puede cambiar a mitad de la sesión; tú propones una si alguien se bloquea con el primer error.\n\n**Cierre común**: cada pareja cuenta qué error encontró y qué pista le ayudó a resolverlo."
      },
      "pantalla": "/planeacion/tecnologia-informatica"
    },
    {
      "id": "docente-2",
      "caso": "ingles",
      "titulo": "Mi rutina del día",
      "estudiante": "8A-03",
      "situacion": "Planeas la clase de Inglés. Quieres que 8A-03 pueda seguir la rutina sin leer en voz alta frente al curso ni saltar de una tarea a otra.",
      "sinapso": "Cuando una clase se piensa para todos, los apoyos individuales se reducen a lo que de verdad hace falta.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Abro «Ajustes PIAR» y miro a la derecha qué apoyos tiene 8A-03. Tú decides qué de ahí entra en la clase."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo presentas la rutina?",
          "opciones": [
            {
              "texto": "Una tarjeta con imagen por paso",
              "resultado": "Hay un solo paso a la vista y la imagen acompaña al texto."
            },
            {
              "texto": "Un párrafo con las instrucciones",
              "resultado": "Funciona para parte del curso, pero a 8A-03 le cuesta con instrucciones largas."
            }
          ]
        },
        {
          "pregunta": "¿Cómo entrega 8A-03 su rutina?",
          "opciones": [
            {
              "texto": "Grabada o leída solo al docente",
              "resultado": "Se evalúa la comprensión y la pronunciación por esa vía."
            },
            {
              "texto": "Leída en voz alta frente al curso",
              "resultado": "Es justo lo que le pesa; el apoyo propone evitarlo."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lo que no cambia**: el objetivo de aprendizaje y la evidencia son los mismos que para el resto del grupo: contar su rutina del día en inglés con el present simple.\n\n**Ruta y formato propuestos**: la ruta con imagen y color, con una tarjeta por paso y una imagen junto a cada verbo, porque el apoyo visual le facilita entender sin depender solo de la lectura.\n\n**Cambios concretos**:\n1. Instrucciones en pasos numerados, uno por tarjeta. Razón: le funciona una sola tarea a la vez.\n2. Hasta un 50 % más de tiempo en el desarrollo. Razón: así puede terminar sin prisa.\n3. Entrega grabada o leída solo a ti. Razón: no necesita leer en voz alta frente al curso.\n\n**Ruta alterna**: si hoy escribir le cuesta, puede usar la ruta oral y grabar su rutina en una nota de voz.\n\nPuedes aceptar, cambiar o quitar cualquiera de estos ajustes, y orientación los revisa antes de que lleguen al estudiante."
      },
      "pantalla": "/generador"
    },
    {
      "id": "docente-3",
      "caso": "matematicas",
      "titulo": "Recetas y escalas",
      "estudiante": "8A-07",
      "situacion": "La clase usa palabras nuevas: razón, escala, proporción. 8A-07 necesita el vocabulario a la mano.",
      "sinapso": "Una palabra nueva puede ser una puerta o una pared. Un glosario con dibujos la vuelve puerta.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Dejé el glosario como recurso de la actividad. ¿Lo quieres también en la evaluación?"
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo introduces el vocabulario?",
          "opciones": [
            {
              "texto": "Con una receta real y el glosario ilustrado",
              "resultado": "El contexto cotidiano da sentido a «razón» antes de definirla."
            },
            {
              "texto": "Con la definición formal primero",
              "resultado": "Sirve a quien ya maneja el lenguaje técnico; a otros les cuesta más."
            }
          ]
        },
        {
          "pregunta": "Tras la clase, ¿qué haces?",
          "opciones": [
            {
              "texto": "Anotas en la bitácora que pidió el glosario dos veces",
              "resultado": "Queda un registro con fecha de lo que funcionó."
            },
            {
              "texto": "No registras nada",
              "resultado": "La clase sigue, pero el equipo no sabrá si el apoyo ayudó."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Una **razón** compara dos cantidades. En la receta: 2 tazas de harina por cada 1 de agua es la razón 2 a 1.\n\nSi la receta se duplica, las dos cantidades se duplican y la razón se queda igual.\n\n**Para el glosario:** «razón: comparar dos cantidades; proporción: dos razones iguales; escala: la razón entre un dibujo y lo real». Es un borrador: tú ajustas las palabras."
      },
      "pantalla": "/planeacion/matematicas"
    },
    {
      "id": "docente-4",
      "caso": "ciencias",
      "titulo": "Quién come a quién",
      "estudiante": "8A-02",
      "situacion": "La clase dura casi una hora. 8A-02 necesita moverse y recibir las instrucciones por dos canales.",
      "sinapso": "Moverse también es una forma de aprender. Solo hay que programarlo.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En el DUA de la actividad puedes anotar la pausa y escribir las instrucciones también por escrito."
      },
      "decisiones": [
        {
          "pregunta": "¿Cuándo programas la pausa activa?",
          "opciones": [
            {
              "texto": "A mitad de clase, para todo el curso",
              "resultado": "Nadie queda señalado y el grupo vuelve con más atención."
            },
            {
              "texto": "Solo cuando 8A-02 se agota",
              "resultado": "Llega tarde: conviene anticiparla."
            }
          ]
        },
        {
          "pregunta": "¿Cómo das las instrucciones?",
          "opciones": [
            {
              "texto": "En voz alta y por escrito, a la vez",
              "resultado": "Dos canales para entrar a la tarea."
            },
            {
              "texto": "Solo en voz alta",
              "resultado": "Quien se pierde no tiene a qué volver."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Nota para quien enseña (borrador)**\n\nEl plan coincide con los apoyos del perfil: pausa activa programada, instrucciones por dos canales y roles que rotan.\n\n**Conviene revisar:** que la pausa no reste tiempo a la evidencia y que cada rol (lector, armador, relator, cronometrista) tenga algo que hacer.\n\nDespués de la clase, anota en la bitácora si con la pausa volvió a la tarea."
      },
      "pantalla": "/bitacora"
    },
    {
      "id": "docente-5",
      "caso": "lengua",
      "titulo": "Escribo un cuento corto",
      "estudiante": "8A-05",
      "situacion": "El cuento se comparte, pero 8A-05 no debe leer frente al curso.",
      "sinapso": "Compartir no es lo mismo que leer en voz alta. Hay varias maneras de dar a conocer lo que se escribe.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En «formas de mostrar lo aprendido» puedes escribir las opciones: escrita, grabada o leída solo a ti."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo se comparte el cuento?",
          "opciones": [
            {
              "texto": "Por escrito, entre parejas, y quien quiera lo lee",
              "resultado": "Todos conocen los cuentos sin que nadie lea a la fuerza."
            },
            {
              "texto": "Todos leen frente al curso",
              "resultado": "Deja fuera el apoyo que 8A-05 ya tiene."
            }
          ]
        },
        {
          "pregunta": "¿Qué evalúas?",
          "opciones": [
            {
              "texto": "El inicio, el nudo y el final, sea cual sea el formato",
              "resultado": "La nota mira la escritura, no la lectura pública."
            },
            {
              "texto": "Incluyes la lectura en voz alta",
              "resultado": "Cambia lo que se evalúa para quien tiene ese apoyo."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Hola. Esta semana en Lengua castellana escribimos un cuento corto. Tu hija o hijo puede entregarlo escrito, grabado o leído solo a su docente.\n\n**Cómo acompañar en casa:** escucha su cuento sin corregirlo y pregúntale qué parte le gustó más. Si prefiere grabarlo, anímalo.\n\nSi tienes dudas, escríbele a la persona de orientación."
      },
      "pantalla": "/planeacion/humanidades-lengua"
    }
  ],
  "orientador": [
    {
      "id": "orientacion-1",
      "caso": "tecnologia",
      "titulo": "Mi primer programa con Turtle",
      "estudiante": "8A-04",
      "situacion": "8A-04 tiene cinco apoyos en su PIAR. Quieres ver si lo que el docente prueba en Tecnología coincide con ellos.",
      "sinapso": "Orientación acompaña el tejido: mira el perfil y lo que pasa en el aula, y decide con las dos cosas juntas.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Abro la ficha y la bitácora al lado. La información clínica queda aparte y solo la ves tú."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué miras primero?",
          "opciones": [
            {
              "texto": "La bitácora: qué funcionó en Tecnología",
              "resultado": "Ves que el diagrama antes del código y el trabajo en pareja han ayudado, con fecha."
            },
            {
              "texto": "Solo el perfil",
              "resultado": "Es la base, pero sin lo que pasa en clase no sabes si el apoyo se aplica."
            }
          ]
        },
        {
          "pregunta": "¿Qué dejas como recomendación?",
          "opciones": [
            {
              "texto": "Normalizar el error y dar resultados visibles primero",
              "resultado": "Es una recomendación sin diagnóstico que el docente puede aplicar mañana."
            },
            {
              "texto": "Una recomendación general sin detalles",
              "resultado": "Cuesta aplicarla en el aula."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Nota para el docente (borrador de orientación)**\n\nLos apoyos del perfil se están aplicando: ejemplo que ya funciona, diagrama de flujo, programación en pareja y retos por niveles.\n\n**Recomendación:** tratar el error como parte del proceso («error, pista, nuevo intento») y dar resultados visibles antes de pasar a lo abstracto.\n\n**Pregunta:** ¿cómo vas a avisarle que el reto mínimo basta para aprobar el desempeño?\n\nLa decisión de mantener, ajustar o retirar un apoyo es de orientación."
      },
      "pantalla": "/estudiantes"
    },
    {
      "id": "orientacion-2",
      "caso": "ingles",
      "titulo": "Mi rutina del día",
      "estudiante": "8A-03",
      "situacion": "Antes de la clase quieres confirmar que el PIAR de 8A-03 recoge evitar la lectura en voz alta y el tiempo adicional.",
      "sinapso": "Un perfil completo no es un archivo: es una conversación que se actualiza.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En el inicio te muestro qué perfiles tienen algo por completar. 8A-03 está al día."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo compruebas el perfil?",
          "opciones": [
            {
              "texto": "Lees apoyos, barreras y fortalezas en la ficha",
              "resultado": "Todo está en un solo lugar, redactado sin diagnóstico."
            },
            {
              "texto": "Pides el documento al docente",
              "resultado": "Pierdes tiempo: el PIAR ya está cargado en Documentos."
            }
          ]
        },
        {
          "pregunta": "¿Qué haces con el acta de la familia?",
          "opciones": [
            {
              "texto": "Verificas que esté cargada",
              "resultado": "La lista de verificación marca el acta como presente."
            },
            {
              "texto": "La das por hecha",
              "resultado": "Si falta, la familia no tiene constancia de lo acordado."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura de lo que ves (datos de ejemplo)**\n\n- **Perfil de 8A-03:** apoyos, barreras y fortalezas completos; próxima revisión el 27 de nov.\n- **Documentos:** PIAR y acta de socialización cargados.\n- **Bitácora:** tarjetas con imagen y entrega grabada funcionaron en las últimas clases.\n\nOrientación ve conteos y fichas; el administrador no ve el PIAR de nadie."
      },
      "pantalla": "/estudiantes"
    },
    {
      "id": "orientacion-3",
      "caso": "matematicas",
      "titulo": "Recetas y escalas",
      "estudiante": "8A-07",
      "situacion": "«Vocabulario de apoyo» aún no está en el perfil de 8A-07 y quieres decidirlo con lo que llega del aula.",
      "sinapso": "Los apoyos se confirman cuando se repiten, con fecha para revisarlos. Nada queda para siempre.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Te junto lo que el docente anotó: pidió el glosario y la tabla le ayudó."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué decides?",
          "opciones": [
            {
              "texto": "Confirmar el apoyo con fecha de revisión",
              "resultado": "El docente lo ve y lo aplica; en diciembre se revisa si sigue haciendo falta."
            },
            {
              "texto": "Esperar a más registros",
              "resultado": "Es prudente si solo hay una nota; hoy hay dos."
            }
          ]
        },
        {
          "pregunta": "¿Qué compartes con la familia?",
          "opciones": [
            {
              "texto": "Una sugerencia concreta: escalar una receta de la casa",
              "resultado": "La familia sabe cómo acompañar."
            },
            {
              "texto": "Nada por ahora",
              "resultado": "El apoyo queda solo en el colegio."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Hola. En Matemáticas estamos trabajando razón y proporción con recetas. Tu hija o hijo cuenta con un glosario con dibujos para las palabras nuevas.\n\n**Cómo acompañar en casa:** escalen una receta de la casa a la mitad y cuenten cuántas tazas necesitan. Una conversación corta es suficiente.\n\nSi tienes dudas, escríbele a la persona de orientación."
      },
      "pantalla": "/estudiantes"
    },
    {
      "id": "orientacion-4",
      "caso": "ciencias",
      "titulo": "Quién come a quién",
      "estudiante": "8A-02",
      "situacion": "Se acerca la revisión periódica del PIAR de 8A-02.",
      "sinapso": "Llegar a la revisión con datos del aula cambia la conversación.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Te muestro cuántos registros dicen que las pausas activas funcionaron, con fechas."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué miras para decidir?",
          "opciones": [
            {
              "texto": "La síntesis: seguimiento, acuerdos y lo que funcionó",
              "resultado": "Una sola vista con lo que ya se conversó."
            },
            {
              "texto": "Solo la última nota",
              "resultado": "Pierdes el recorrido de las últimas semanas."
            }
          ]
        },
        {
          "pregunta": "¿Qué dejas para la próxima vez?",
          "opciones": [
            {
              "texto": "La fecha de la siguiente revisión",
              "resultado": "El equipo sabe cuándo volver a mirar."
            },
            {
              "texto": "Nada",
              "resultado": "La revisión depende de que alguien se acuerde."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Síntesis para la revisión (borrador)**\n\n- Las pausas activas programadas funcionaron en los dos registros recientes.\n- Con instrucciones por dos canales mantuvo la atención en la actividad.\n\n**Conviene revisar:** cómo se organiza al trabajar en pareja; hay una nota privada del docente pendiente.\n\nLa decisión de mantener, ajustar o retirar un apoyo es de orientación."
      },
      "pantalla": "/estudiantes"
    },
    {
      "id": "orientacion-5",
      "caso": "lengua",
      "titulo": "Escribo un cuento corto",
      "estudiante": "8A-05",
      "situacion": "«Evitar la lectura en voz alta frente al curso» no es una categoría y tú no administras el catálogo.",
      "sinapso": "Cada rol tiene su parte del tejido: tú propones, quien administra el catálogo lo crea.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Puedes dejar el pedido por escrito y subir la guía institucional de ajustes razonables a Documentos."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo lo resuelves?",
          "opciones": [
            {
              "texto": "Pides la categoría y dejas la guía en Documentos",
              "resultado": "El administrador la crea sin diagnóstico en el nombre."
            },
            {
              "texto": "Lo escribes dentro de otra categoría",
              "resultado": "Se pierde el apoyo exacto y el catálogo se desordena."
            }
          ]
        },
        {
          "pregunta": "¿Cómo redactas el apoyo?",
          "opciones": [
            {
              "texto": "«Entregar el texto escrito, grabado o leído solo al docente»",
              "resultado": "Describe el apoyo, no a la persona."
            },
            {
              "texto": "Con el motivo clínico incluido",
              "resultado": "El catálogo lo ven docentes, familias y estudiantes: no debe llevar diagnóstico."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura del pedido**\n\n- Nombre sugerido: *Evitar la lectura en voz alta frente al curso*.\n- Frase para el estudiante: *Puedes entregar tu texto sin leerlo frente al curso.*\n- Sin diagnóstico ni nombres.\n\nQuien administra el catálogo decide el nombre final y cuándo desactivarlo."
      },
      "pantalla": "/documentos"
    }
  ],
  "padre": [
    {
      "id": "familia-1",
      "caso": "tecnologia",
      "titulo": "Mi primer programa con Turtle",
      "estudiante": "8A-04",
      "situacion": "Quieres saber qué aprende tu hijo o hija en Tecnología y cómo acompañar sin saber programar.",
      "sinapso": "Acompañar no es saber de todo: es estar cerca y preguntar con curiosidad.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En «Para la casa» te dejo ideas sencillas. No hace falta entender el código."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo preguntas por la clase?",
          "opciones": [
            {
              "texto": "«¿Qué dibujaste hoy con el código?»",
              "resultado": "La conversación gira en torno a lo que hizo."
            },
            {
              "texto": "«¿Ya te salió el programa?»",
              "resultado": "Puede sentirse como una evaluación."
            }
          ]
        },
        {
          "pregunta": "Si el programa da error, ¿qué haces?",
          "opciones": [
            {
              "texto": "Celebrar el intento y preguntar qué pista encontró",
              "resultado": "El error se vuelve parte del proceso."
            },
            {
              "texto": "Pedirle que lo repita hasta que salga",
              "resultado": "Aumenta la frustración."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Hola. Esta semana tu hijo o hija programó una figura con Python. Trabaja en pareja y tiene retos por niveles.\n\n**Cómo acompañar en casa:**\n1. Pregúntale qué dibujó hoy con el código.\n2. Si algo no salió, pregúntale qué pista encontró.\n\nCelebra el intento, no la perfección."
      },
      "pantalla": "/padre"
    },
    {
      "id": "familia-2",
      "caso": "ingles",
      "titulo": "Mi rutina del día",
      "estudiante": "8A-03",
      "situacion": "Quieres saber qué tema ve tu hijo o hija en Inglés y qué puedes hacer en casa.",
      "sinapso": "El colegio y la casa son dos orillas del mismo río.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Te muestro «Mi rutina del día» y los apoyos que reciben en clase. La información clínica no se muestra aquí."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué haces con «Para la casa»?",
          "opciones": [
            {
              "texto": "Practicar una lista con dibujos para organizar la tarde",
              "resultado": "Es el mismo apoyo visual que usan en clase."
            },
            {
              "texto": "Dejarlo solo para el colegio",
              "resultado": "Pierdes una oportunidad de reforzar lo que ya funciona."
            }
          ]
        },
        {
          "pregunta": "Si en casa algo funciona, ¿qué haces?",
          "opciones": [
            {
              "texto": "Lo cuentas en la bitácora",
              "resultado": "El docente y orientación lo tienen en cuenta."
            },
            {
              "texto": "Lo guardas para ti",
              "resultado": "Es información valiosa que el colegio no sabría."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Hola. En Inglés trabajamos «Mi rutina del día». Las instrucciones vienen en pasos cortos con imágenes, hay más tiempo para terminar y se comparte la oración en pareja o grabada.\n\n**Cómo acompañar en casa:** pídele que te cuente su rutina en inglés con las tarjetas. Una oración ya es un buen resultado."
      },
      "pantalla": "/padre"
    },
    {
      "id": "familia-3",
      "caso": "matematicas",
      "titulo": "Recetas y escalas",
      "estudiante": "8A-07",
      "situacion": "Quieres ayudar con las recetas en casa.",
      "sinapso": "Cocinar también es matemática.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "El docente decidió compartirte algunos registros. Los ves en la bitácora."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo ayudas?",
          "opciones": [
            {
              "texto": "Escalando una receta de la casa a la mitad",
              "resultado": "La razón y la proporción aparecen en algo real."
            },
            {
              "texto": "Resolviendo los ejercicios por tu hijo",
              "resultado": "Le quita la oportunidad de aprender."
            }
          ]
        },
        {
          "pregunta": "¿Qué lees primero?",
          "opciones": [
            {
              "texto": "El progreso y el comentario del docente",
              "resultado": "Ves cómo va, con una nota y qué sigue."
            },
            {
              "texto": "Solo la nota",
              "resultado": "Sin el comentario no sabes cómo ayudar."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Para escalar una receta a la mitad, cada cantidad se divide entre 2: 2 tazas de harina pasan a 1 taza. La **razón** entre ingredientes se queda igual.\n\nInvítalo a explicarte por qué."
      },
      "pantalla": "/progreso"
    },
    {
      "id": "familia-4",
      "caso": "ciencias",
      "titulo": "Quién come a quién",
      "estudiante": "8A-02",
      "situacion": "Debes autorizar el tratamiento de los datos de tu hijo o hija.",
      "sinapso": "Cuidar los datos de un menor es cuidar a la persona.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En Documentos ves la política de datos y dónde queda guardada tu autorización."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué haces con la autorización?",
          "opciones": [
            {
              "texto": "Leer la política y cargar la autorización firmada",
              "resultado": "Queda guardada con fecha en Documentos."
            },
            {
              "texto": "Firmarla sin leer",
              "resultado": "Es tu derecho conocer qué datos se tratan y quién los ve."
            }
          ]
        },
        {
          "pregunta": "¿Qué dato no aparece nunca aquí?",
          "opciones": [
            {
              "texto": "La información clínica de tu hijo o hija",
              "resultado": "Solo la ve orientación y, si le corresponde, su docente; tú la recibes del profesional."
            },
            {
              "texto": "Las notas de otros estudiantes",
              "resultado": "Nunca se muestran."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Esta es la política de tratamiento de datos del colegio. La autorización que cargues queda en **Documentos** y puedes revocarla cuando quieras.\n\nLa información clínica nunca se muestra a las familias desde esta plataforma."
      },
      "pantalla": "/documentos"
    },
    {
      "id": "familia-5",
      "caso": "lengua",
      "titulo": "Escribo un cuento corto",
      "estudiante": "8A-05",
      "situacion": "Quieres saber cómo evalúan el cuento y revisar el acta del PIAR.",
      "sinapso": "La familia es parte del tejido desde el primer día.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "El acta de socialización está en Documentos. Léela con calma."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué haces con el acta?",
          "opciones": [
            {
              "texto": "Leerla y decir si aceptas los acuerdos o quieres cambios",
              "resultado": "El colegio recibe tu voz."
            },
            {
              "texto": "Archivarla sin leerla",
              "resultado": "Los acuerdos se construyen con la familia."
            }
          ]
        },
        {
          "pregunta": "En casa, ¿cómo escuchas el cuento?",
          "opciones": [
            {
              "texto": "Sin corregirlo y preguntando qué parte le gustó",
              "resultado": "Fortalece su confianza al escribir."
            },
            {
              "texto": "Marcando los errores de ortografía",
              "resultado": "Puede desanimarlo antes de entregar."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "Hola. En Lengua castellana tu hija o hijo escribe un cuento corto y puede entregarlo escrito, grabado o leído solo a su docente.\n\n**Cómo acompañar en casa:** escucha el cuento sin corregirlo y pregúntale qué parte le gustó más."
      },
      "pantalla": "/documentos"
    }
  ],
  "administrador": [
    {
      "id": "coordinacion-1",
      "caso": "tecnologia",
      "titulo": "Mi primer programa con Turtle",
      "estudiante": "8A-04",
      "situacion": "Tecnología necesita su malla cargada y un docente asignado con al menos tres horas semanales.",
      "sinapso": "Coordinar es dejar que cada pieza encaje: personas, tiempos y documentos.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En el resumen te cuento cuántos documentos imprescindibles faltan. No ves datos de ningún estudiante."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué revisas primero?",
          "opciones": [
            {
              "texto": "Que el docente esté asignado al curso",
              "resultado": "Sin asignación no ve a sus estudiantes."
            },
            {
              "texto": "Que la malla esté cargada",
              "resultado": "La lista de verificación te dice qué falta."
            }
          ]
        },
        {
          "pregunta": "¿Qué cargas?",
          "opciones": [
            {
              "texto": "El catálogo de ajustes razonables, con las recomendaciones del MEN",
              "resultado": "Orienta el lenguaje de los apoyos."
            },
            {
              "texto": "Nada más por ahora",
              "resultado": "La lista no avanza."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura de las cifras (datos de ejemplo)**\n\n- **Documentos imprescindibles:** 7 de 11; quedan 4 por cargar, entre ellos la política de datos.\n- **Malla de Tecnología:** cargada.\n- **Asignación del docente:** al día.\n\nCoordinación ve conteos, no los apoyos de ningún estudiante."
      },
      "pantalla": "/documentos"
    },
    {
      "id": "coordinacion-2",
      "caso": "ingles",
      "titulo": "Mi rutina del día",
      "estudiante": "8A-03",
      "situacion": "«Una sola tarea a la vez» y «evitar leer en voz alta» no están en el catálogo de apoyos.",
      "sinapso": "El catálogo describe apoyos, no personas.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Puedes crear las categorías con su frase para el estudiante."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo nombras el apoyo?",
          "opciones": [
            {
              "texto": "«Una sola tarea a la vez»",
              "resultado": "Describe lo que se hace en clase."
            },
            {
              "texto": "«Para estudiantes con ansiedad»",
              "resultado": "Etiqueta a la persona y expone un dato sensible."
            }
          ]
        },
        {
          "pregunta": "¿Qué frase le escribes al estudiante?",
          "opciones": [
            {
              "texto": "«Hoy trabajas una tarea a la vez»",
              "resultado": "Cercana y sin lenguaje clínico."
            },
            {
              "texto": "«Tienes un plan especial»",
              "resultado": "Marca una diferencia que no hace falta."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura del pedido**\n\n- *Una sola tarea a la vez*: «Hoy trabajas una tarea a la vez.»\n- *Evitar la lectura en voz alta frente al curso*: «Puedes entregar tu texto sin leerlo frente al curso.»\n\nSin nombres ni diagnósticos. Tú decides cuándo desactivarlas."
      },
      "pantalla": "/admin/categorias-apoyo"
    },
    {
      "id": "coordinacion-3",
      "caso": "matematicas",
      "titulo": "Recetas y escalas",
      "estudiante": "8A-07",
      "situacion": "El docente de Matemáticas no ve a 8A-07 ni puede planear.",
      "sinapso": "Detrás de cada pantalla vacía suele haber una asignación pendiente.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "En el inicio aparece la alerta «estudiante sin matrícula»."
      },
      "decisiones": [
        {
          "pregunta": "¿Cómo lo resuelves?",
          "opciones": [
            {
              "texto": "Matriculas al estudiante y asignas al docente",
              "resultado": "El docente ya lo ve y puede planear."
            },
            {
              "texto": "Le pides al docente que lo anote a mano",
              "resultado": "No queda registro en la plataforma."
            }
          ]
        },
        {
          "pregunta": "¿Qué más cargas?",
          "opciones": [
            {
              "texto": "La malla de Matemáticas del grado",
              "resultado": "La lista de verificación avanza."
            },
            {
              "texto": "Nada",
              "resultado": "Los ajustes no podrán alinearse con lo que se enseña."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura**\n\n- Estudiante sin matrícula: resuelto al matricularlo en el curso.\n- Docente de Matemáticas: asignado.\n- Malla del grado: cargada.\n\nQuedan por definir el periodo activo y las fechas de revisión."
      },
      "pantalla": "/admin/cursos"
    },
    {
      "id": "coordinacion-4",
      "caso": "ciencias",
      "titulo": "Quién come a quién",
      "estudiante": "8A-02",
      "situacion": "La familia de 8A-02 aún no está vinculada y el periodo no está activo.",
      "sinapso": "Un periodo activo y una familia vinculada abren la puerta a todo lo demás.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Vinculas a la familia con su parentesco y activas el periodo."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué haces primero?",
          "opciones": [
            {
              "texto": "Vincular a la familia",
              "resultado": "La familia ya entra a su panel."
            },
            {
              "texto": "Activar el periodo",
              "resultado": "Las actividades tienen contexto de fechas."
            }
          ]
        },
        {
          "pregunta": "¿Qué subes al final?",
          "opciones": [
            {
              "texto": "El calendario escolar",
              "resultado": "Define cuándo se revisan los apoyos."
            },
            {
              "texto": "Nada",
              "resultado": "Las revisiones quedan sin fecha."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura**\n\n- Familia vinculada: puede ver el panel de su hijo o hija.\n- Periodo activo: define fechas de revisión.\n- Calendario escolar: cargado.\n\nCada paso queda en las novedades de documentos."
      },
      "pantalla": "/admin/acudientes"
    },
    {
      "id": "coordinacion-5",
      "caso": "lengua",
      "titulo": "Escribo un cuento corto",
      "estudiante": "8A-05",
      "situacion": "Quieres saber cuántos documentos y revisiones están pendientes, sin ver a quién.",
      "sinapso": "Ver el panorama sin ver a las personas es una forma de cuidar.",
      "companero": {
        "personaje": "Kinesis",
        "linea": "Tu resumen muestra documentos y novedades de carga, sin información de estudiantes."
      },
      "decisiones": [
        {
          "pregunta": "¿Qué miras primero?",
          "opciones": [
            {
              "texto": "Los documentos imprescindibles que faltan",
              "resultado": "Sabes qué pedir y a quién."
            },
            {
              "texto": "Las notas de seguimiento",
              "resultado": "No te corresponden: son del equipo de apoyo y de los docentes."
            }
          ]
        },
        {
          "pregunta": "¿A quién le recuerdas lo pendiente?",
          "opciones": [
            {
              "texto": "A quien debe cargar cada documento",
              "resultado": "Cada documento tiene un rol responsable."
            },
            {
              "texto": "A todos por igual",
              "resultado": "El mensaje se pierde."
            }
          ]
        }
      ],
      "niky": {
        "respuesta": "**Lectura del resumen**\n\n- Documentos imprescindibles: 7 de 11.\n- Pendientes: política de datos, protocolo clínico, sistema de evaluación y autorizaciones de familias.\n- Responsables: administración y familias.\n\nNo ves seguimiento ni información de estudiantes."
      },
      "pantalla": "/admin"
    }
  ]
};
