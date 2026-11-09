import type { Role } from "@/types";

// Cinco casos por cinco roles = 25 ejemplos para la pantalla «Guía por rol»
// (/guia). Son los mismos cinco casos de la exposición guiada de la plataforma
// Sinapsis (Inglés, Matemáticas, Ciencias naturales, Lengua castellana y
// Ciencias sociales), para que cada rol vea qué puede hacer y con qué
// herramienta, con un ejemplo puntual.
//
// Origen: auditoría de Kinesis del 8 de noviembre de 2026. Cada paso lleva una
// etiqueta honesta de su estado:
//   - "hoy":   ya existía en Kinesis antes de esta rama.
//   - "nuevo": lo agrega esta rama (bitácora, documentos, mi forma de aprender,
//              resumen por rol). En la demostración se ve pero no se guarda.
//   - "pronto": todavía NO existe (editar el PIAR desde la pantalla, ajustes
//              devueltos con nota, IA conectada). Se dice, no se simula.
// Los estudiantes se nombran solo con el código de la plataforma (8A-03…); la
// demostración de Kinesis usa nombres ficticios y no hay que confundirlos.

export type StepStatus = "hoy" | "nuevo" | "pronto";

export interface GuideStep {
  text: string;
  status: StepStatus;
  /** Pantalla de Kinesis donde se hace; solo rutas que existen para ese rol. */
  href?: string;
}

export interface GuideExample {
  situation: string;
  steps: GuideStep[];
  result: string;
  decides: string;
}

export interface GuideCase {
  id: number;
  subject: string;
  activity: string;
  student: string;
  supports: string;
}

export const GUIDE_CASES: GuideCase[] = [
  {
    id: 6,
    subject: "Tecnología e informática",
    activity: "Mi primer programa con Turtle (Python)",
    student: "8A-04",
    supports: "pasos con un ejemplo que ya funciona, apoyo visual, programación en pareja, retos por niveles y editor con letra grande",
  },
  {
    id: 1,
    subject: "Inglés",
    activity: "Mi rutina del día",
    student: "8A-03",
    supports: "pasos cortos, apoyo visual, tiempo adicional, evitar leer en voz alta y una sola tarea a la vez",
  },
  {
    id: 2,
    subject: "Matemáticas",
    activity: "Recetas y escalas: razón y proporción",
    student: "8A-07",
    supports: "vocabulario de apoyo y tiempo adicional",
  },
  {
    id: 3,
    subject: "Ciencias naturales",
    activity: "Quién come a quién: cadenas alimentarias",
    student: "8A-02",
    supports: "descansos activos e instrucciones orales y escritas",
  },
  {
    id: 4,
    subject: "Lengua castellana",
    activity: "Escribo un cuento corto",
    student: "8A-05",
    supports: "evitar leer en voz alta frente al curso y pasos cortos",
  },
  {
    id: 5,
    subject: "Ciencias sociales",
    activity: "Línea de tiempo de la Independencia",
    student: "8A-08",
    supports: "apoyo visual y una sola tarea; orientación devuelve el ajuste con una nota",
  },
];

export const GUIDE_BY_ROLE: Record<Role, GuideExample[]> = {
  docente: [
    {
      situation:
        "Planeas el tercer periodo de Tecnología de 8°. La malla pide desarrollar videojuegos sencillos con PyGame, y esta semana toca «Hola mundo» y Turtle. El estudiante del caso se detiene ante el primer error.",
      steps: [
        { text: "Mira que la malla de Tecnología y tu plan de aula con DUA estén cargados. Tecnología no tiene estándares sino competencias y componentes.", status: "nuevo", href: "/documentos" },
        { text: "Crea la actividad «Mi primer programa con Turtle»: una instrucción por línea, con el ejemplo que ya funciona en Recursos y la evidencia de la malla.", status: "hoy", href: "/planeacion/tecnologia-informatica" },
        { text: "Escribe los tres principios del DUA: ejemplo y diagrama de flujo, código o bloques o explicación oral, y elegir la figura con pareja y pausa.", status: "hoy", href: "/planeacion/tecnologia-informatica" },
        { text: "En Ajustes PIAR contrasta con el estudiante: ejemplo funcionando, retos por niveles y programación en pareja.", status: "hoy", href: "/generador" },
        { text: "Tras la sesión, registra: «con el diagrama de flujo antes del código terminó el cuadrado». Pídele a Niky que ordene la nota.", status: "nuevo", href: "/bitacora" },
        { text: "Califica la actividad en Progreso: nota de 1,0 a 5,0 y un comentario. El quiz de Wisfox es evidencia, la nota es tuya.", status: "nuevo", href: "/progreso" },
      ],
      result: "La actividad queda alineada con la malla y con los apoyos del estudiante, y la bitácora guarda qué funcionó con fecha.",
      decides: "Qué evidencias de la malla trabajas en esta actividad (no hay que cubrirlas todas) y cuál es el reto mínimo.",
    },
    {
      situation:
        "Planeas la clase de Inglés y quieres que el estudiante pueda seguir la rutina sin leer en voz alta ni saltar de una tarea a otra.",
      steps: [
        { text: "Crea la actividad «Mi rutina del día»: una instrucción por línea y tarjetas de imágenes en Recursos.", status: "hoy", href: "/planeacion" },
        { text: "Escribe los tres principios del DUA: presentar con imágenes y texto, responder por dibujo, oral o escrito, y elegir de su rutina.", status: "hoy", href: "/planeacion" },
        { text: "Abre Ajustes PIAR y lee a la derecha las barreras y los apoyos del estudiante.", status: "hoy", href: "/generador" },
        { text: "Después de la clase, registra lo que funcionó: «con una tarjeta por paso terminó la tarea».", status: "nuevo", href: "/bitacora" },
      ],
      result: "La actividad queda con su DUA junto al estudiante y la bitácora guarda qué se probó.",
      decides: "Qué principios del DUA ya cubren al estudiante y qué ajuste individual queda pendiente.",
    },
    {
      situation:
        "La clase usa palabras como razón, escala y proporción, y el estudiante necesita el vocabulario a mano.",
      steps: [
        { text: "Crea la actividad y pon «Glosario ilustrado: razón, proporción, escala» en Recursos.", status: "hoy", href: "/planeacion" },
        { text: "Contrasta en Ajustes PIAR con las barreras del estudiante.", status: "hoy", href: "/generador" },
        { text: "Escribe una novedad: «pidió el glosario dos veces». Pídele a Niky que la ordene.", status: "nuevo", href: "/bitacora" },
        { text: "Que Niky sugiera un glosario simple como borrador para que lo corrijas.", status: "pronto" },
      ],
      result: "La actividad queda con su recurso, y la novedad llega al equipo de apoyo.",
      decides: "Qué palabras entran al glosario y qué se evalúa.",
    },
    {
      situation: "La clase dura casi una hora y el estudiante necesita moverse y recibir las instrucciones por dos canales.",
      steps: [
        { text: "Crea la actividad con instrucciones paso a paso.", status: "hoy", href: "/planeacion" },
        { text: "Escribe el DUA: video y texto, armar la cadena con tarjetas o dibujarla, rotación de roles.", status: "hoy", href: "/planeacion" },
        { text: "Durante la clase, registra: «con la pausa activa volvió a la tarea». Elige «Actividad kinestésica» y «Funcionó».", status: "nuevo", href: "/bitacora" },
        { text: "Mira el resumen: cuántos registros dicen que funcionó, con fecha.", status: "nuevo", href: "/bitacora" },
      ],
      result: "Queda evidencia de qué ayudó, redactada en pasado y con fecha, sin etiquetar al estudiante.",
      decides: "Cuándo es la pausa y cómo explicas oral y por escrito.",
    },
    {
      situation: "El cuento se comparte con el curso, pero el estudiante no debe leer en voz alta frente a los demás.",
      steps: [
        { text: "Crea la actividad con los pasos del cuento, uno por línea.", status: "hoy", href: "/planeacion" },
        { text: "En «formas de mostrar lo aprendido» escribe: entrega escrita, grabada o leída solo al docente.", status: "hoy", href: "/planeacion" },
        { text: "Después, registra cómo entregó: «entregó grabado y se sintió tranquilo». Márcalo para compartir con la familia.", status: "nuevo", href: "/bitacora" },
      ],
      result: "La planeación y el registro quedan juntos; la familia ve lo que compartiste.",
      decides: "Cómo se comparte el cuento sin leerlo en voz alta.",
    },
    {
      situation: "Quieres proponer un ajuste para el estudiante y que orientación lo revise.",
      steps: [
        { text: "Crea la actividad en Ciencias sociales con DUA y mira el apoyo visual del estudiante.", status: "hoy", href: "/generador" },
        { text: "Registra lo que probaste: «línea con imágenes y una sola tarea».", status: "nuevo", href: "/bitacora" },
        { text: "Proponer el ajuste y leer la nota con que orientación lo devuelve.", status: "pronto" },
      ],
      result: "Hoy queda la evidencia en la bitácora; el ajuste con nota de revisión es la siguiente fase.",
      decides: "Aceptar, corregir o rechazar la nota de orientación.",
    },
  ],
  orientador: [
    {
      situation:
        "El estudiante del caso de Tecnología tiene cinco apoyos en su PIAR. Quieres ver si lo que el docente prueba coincide con ellos y si los documentos están completos.",
      steps: [
        { text: "En Inicio revisa que el perfil no figure entre los «por completar».", status: "hoy", href: "/orientacion" },
        { text: "Abre la ficha: apoyos, barreras y fortalezas del estudiante.", status: "hoy", href: "/estudiantes" },
        { text: "Mira en la bitácora qué funcionó en Tecnología: diagrama antes del código, trabajo en pareja.", status: "nuevo", href: "/bitacora" },
        { text: "En la ficha, deja una recomendación de orientación sin diagnóstico («normalizar el error, resultados visibles primero») y la fecha de la próxima revisión.", status: "nuevo", href: "/estudiantes" },
        { text: "Revisa en Documentos que estén el PIAR y la valoración pedagógica.", status: "nuevo", href: "/documentos" },
        { text: "Confirmar «retos por niveles» como apoyo con fecha de revisión.", status: "pronto" },
      ],
      result: "Ves el perfil junto a lo que pasó en clase y sabes qué documento falta.",
      decides: "Si los retos por niveles se mantienen, se ajustan o se retiran.",
    },
    {
      situation: "Antes de la clase quieres confirmar que el PIAR recoge evitar leer en voz alta y el tiempo adicional.",
      steps: [
        { text: "En Inicio revisa si el estudiante aparece en «Perfiles PIAR por completar».", status: "hoy", href: "/orientacion" },
        { text: "Abre la ficha y lee apoyos, barreras y diagnóstico.", status: "hoy", href: "/estudiantes" },
        { text: "Mira en la bitácora qué ha funcionado en clase, con fechas.", status: "nuevo", href: "/bitacora" },
        { text: "Editar los apoyos de la ficha desde la pantalla.", status: "pronto" },
      ],
      result: "Ves el perfil y lo que pasó en el aula; corregir el PIAR todavía se hace fuera de Kinesis.",
      decides: "Si el perfil es suficiente para que el docente planee.",
    },
    {
      situation: "«Vocabulario de apoyo» no está entre los apoyos del estudiante y quieres decidirlo con lo que llega del aula.",
      steps: [
        { text: "Abre la ficha del estudiante.", status: "hoy", href: "/estudiantes" },
        { text: "Lee en la bitácora los registros «lo que funcionó» sobre el glosario.", status: "nuevo", href: "/bitacora" },
        { text: "Confirmar «vocabulario de apoyo» como apoyo con fecha de revisión.", status: "pronto" },
      ],
      result: "Decides con evidencia del aula; el apoyo confirmado en pantalla es la siguiente fase.",
      decides: "Si el apoyo se mantiene, se cambia o se retira.",
    },
    {
      situation: "Se acerca la revisión periódica del PIAR del estudiante.",
      steps: [
        { text: "Lee apoyos, barreras y fecha de la última revisión en la ficha.", status: "hoy", href: "/estudiantes" },
        { text: "Mira cuántos registros dicen que las pausas activas funcionaron.", status: "nuevo", href: "/bitacora" },
        { text: "Revisa que el PIAR y el acta con la familia estén cargados.", status: "nuevo", href: "/documentos" },
      ],
      result: "Llegas a la revisión con datos del aula y con los documentos al día.",
      decides: "Mantener, ajustar o retirar el apoyo.",
    },
    {
      situation: "«Evitar leer en voz alta frente al curso» no es una categoría y tú no puedes crearla.",
      steps: [
        { text: "Lee la ficha del estudiante.", status: "hoy", href: "/estudiantes" },
        { text: "Pide al administrador la categoría, sin diagnóstico en el nombre.", status: "hoy" },
        { text: "Sube la guía institucional de ajustes razonables a la lista de documentos.", status: "nuevo", href: "/documentos" },
      ],
      result: "La guía queda cargada y la categoría la crea quien administra el catálogo.",
      decides: "La redacción del apoyo, que no use diagnóstico.",
    },
    {
      situation: "Revisas el ajuste que propuso el docente y lo devuelves con una nota.",
      steps: [
        { text: "Mira la ficha del estudiante.", status: "hoy", href: "/estudiantes" },
        { text: "Revisa las novedades del docente en la bitácora.", status: "nuevo", href: "/bitacora" },
        { text: "Abrir el ajuste propuesto y devolverlo con una nota.", status: "pronto" },
      ],
      result: "Hoy ves lo que el docente probó; devolver el ajuste con nota es la siguiente fase.",
      decides: "Aprobar o devolver.",
    },
  ],
  administrador: [
    {
      situation:
        "Tecnología necesita su malla cargada y un docente asignado con al menos tres horas semanales: las Orientaciones del MEN lo piden para estudiantes con discapacidad.",
      steps: [
        { text: "Confirma que el docente de Tecnología esté asignado al curso.", status: "hoy", href: "/admin/cursos" },
        { text: "Mira en la lista de verificación que la malla de Tecnología esté cargada.", status: "nuevo", href: "/documentos" },
        { text: "Carga el catálogo de ajustes razonables, que incluye las recomendaciones del MEN.", status: "nuevo", href: "/documentos" },
      ],
      result: "La malla y el catálogo quedan cargados, y la lista avanza sin que veas datos de ningún estudiante.",
      decides: "La intensidad horaria del área en el PEI (por confirmar en la fuente oficial).",
    },
    {
      situation: "«Una sola tarea a la vez» y «evitar leer en voz alta» no están en el catálogo de apoyos.",
      steps: [
        { text: "Crea «Una sola tarea a la vez» con su frase para el estudiante.", status: "hoy", href: "/admin/categorias-apoyo" },
        { text: "Crea «Evitar la lectura en voz alta frente al curso», sin nombres ni diagnósticos.", status: "hoy", href: "/admin/categorias-apoyo" },
        { text: "Abre la lista de verificación y mira lo que falta para operar.", status: "nuevo", href: "/documentos" },
      ],
      result: "Las categorías quedan activas y ves cuántos documentos faltan, sin ver datos de ningún estudiante.",
      decides: "Los nombres de las categorías y cuándo desactivarlas.",
    },
    {
      situation: "El docente de Matemáticas no ve al estudiante ni puede planear.",
      steps: [
        { text: "En Inicio revisa la alerta «estudiante sin matrícula».", status: "hoy", href: "/admin" },
        { text: "Matricula al estudiante y asigna al docente en Matemáticas.", status: "hoy", href: "/admin/cursos" },
        { text: "Sube la malla curricular de Matemáticas del grado y mira cómo avanza la lista.", status: "nuevo", href: "/documentos" },
      ],
      result: "El docente ve al estudiante y la malla queda cargada.",
      decides: "Las asignaciones y el periodo activo.",
    },
    {
      situation: "La familia del estudiante aún no está vinculada y el periodo no está activo.",
      steps: [
        { text: "Vincula a la familia con el parentesco.", status: "hoy", href: "/admin/acudientes" },
        { text: "Activa el periodo académico.", status: "hoy", href: "/admin/periodos" },
        { text: "Sube el calendario escolar y mira las novedades de documentos en tu resumen.", status: "nuevo", href: "/documentos" },
      ],
      result: "La familia ya entra a su panel y el calendario queda cargado.",
      decides: "A quién se vincula y desde cuándo.",
    },
    {
      situation: "Hay que crear la categoría de apoyo y dejar la guía institucional a mano.",
      steps: [
        { text: "Crea «Evitar la lectura en voz alta frente al curso».", status: "hoy", href: "/admin/categorias-apoyo" },
        { text: "Escribe la frase al estudiante: «Puedes entregar tu texto sin leerlo frente al curso».", status: "hoy", href: "/admin/categorias-apoyo" },
        { text: "Sube el sistema institucional de evaluación para que los ajustes de formato coincidan.", status: "nuevo", href: "/documentos" },
      ],
      result: "La categoría queda activa y el sistema de evaluación cargado.",
      decides: "El nombre y la frase.",
    },
    {
      situation: "Quieres saber cuántos documentos y revisiones están pendientes, sin ver a quién.",
      steps: [
        { text: "Mira las cifras y alertas de tu Inicio.", status: "hoy", href: "/admin" },
        { text: "Mira el resumen: documentos imprescindibles y novedades de carga.", status: "nuevo", href: "/admin" },
        { text: "Ver «ajustes por revisar» y «seguimientos pendientes».", status: "pronto" },
      ],
      result: "Una cifra agregada de documentos, sin datos del estudiante.",
      decides: "A quién recordarle.",
    },
  ],
  padre: [
    {
      situation:
        "La familia quiere saber qué aprende su hijo o hija en Tecnología y cómo acompañar sin saber programar.",
      steps: [
        { text: "Mira «Mi primer programa con Turtle (Python)» como tema de Tecnología.", status: "hoy", href: "/padre" },
        { text: "Lee «Para la casa»: preguntarle qué dibujó hoy con el código y celebrar el intento aunque falle.", status: "hoy", href: "/padre" },
        { text: "Cuenta lo que ves en casa: «dibujó su inicial con el código».", status: "nuevo", href: "/bitacora" },
        { text: "Lee las recomendaciones que el colegio compartió contigo y cómo va en Progreso.", status: "nuevo", href: "/progreso" },
      ],
      result: "La familia acompaña sin necesidad de entender el código y el colegio sabe qué se vio en casa.",
      decides: "Cómo celebrar el intento en casa.",
    },
    {
      situation: "La familia quiere saber qué tema ve su hija o hijo y qué puede hacer en casa.",
      steps: [
        { text: "Mira «Mi rutina del día» bajo «Lo que está aprendiendo».", status: "hoy", href: "/padre" },
        { text: "Lee «Su plan de apoyos» y «Para la casa».", status: "hoy", href: "/padre" },
        { text: "Escribe una observación breve: «en casa, la lista con dibujos le sirvió». Llega al docente y a orientación.", status: "nuevo", href: "/bitacora" },
      ],
      result: "La familia aporta lo que ve en casa y el colegio lo tiene en cuenta.",
      decides: "Qué practicar en casa y si lo cuenta al colegio.",
    },
    {
      situation: "La familia quiere ayudar con las recetas en casa.",
      steps: [
        { text: "Mira «Recetas y escalas: razón y proporción» como tema de Matemáticas.", status: "hoy", href: "/padre" },
        { text: "Lee «Para la casa».", status: "hoy", href: "/padre" },
        { text: "Lee los registros que el docente decidió compartir contigo.", status: "nuevo", href: "/bitacora" },
      ],
      result: "Ves el tema, los apoyos y lo que el docente quiso compartir.",
      decides: "Si lo prueban en casa y cuándo.",
    },
    {
      situation: "La familia debe autorizar el tratamiento de los datos de su hijo o hija.",
      steps: [
        { text: "Mira «Pausas activas» y su descripción en «Para la casa».", status: "hoy", href: "/padre" },
        { text: "Lee la política de tratamiento y carga la autorización firmada.", status: "nuevo", href: "/documentos" },
        { text: "El colegio ve que el consentimiento está en la lista de verificación.", status: "nuevo", href: "/documentos" },
      ],
      result: "Queda el consentimiento con fecha.",
      decides: "Autorizar o no.",
    },
    {
      situation: "La familia quiere saber cómo evalúan el cuento y revisar el acta del PIAR.",
      steps: [
        { text: "Mira «Escribo un cuento corto».", status: "hoy", href: "/padre" },
        { text: "Abre el acta de socialización que el orientador cargó.", status: "nuevo", href: "/documentos" },
        { text: "Cuenta cómo le fue en casa con la actividad.", status: "nuevo", href: "/bitacora" },
      ],
      result: "La familia tiene el acta a la mano y su voz queda en la bitácora.",
      decides: "Aceptar o pedir cambios.",
    },
    {
      situation: "La familia quiere saber qué ajuste recibe en Ciencias sociales.",
      steps: [
        { text: "Mira «Línea de tiempo de la Independencia» y los ajustes en clase.", status: "hoy", href: "/padre" },
        { text: "Lee los registros compartidos sobre la línea con imágenes.", status: "nuevo", href: "/bitacora" },
        { text: "Ver el resumen del ajuste aplicado a esa actividad.", status: "pronto" },
      ],
      result: "Ves los ajustes del plan y lo compartido por el docente.",
      decides: "Si lo refuerzan en casa.",
    },
  ],
  estudiante: [
    {
      situation:
        "Abres la clase de Tecnología y quieres saber qué vas a programar y qué hacer si el programa da error.",
      steps: [
        { text: "Lee los pasos: cada uno trae un ejemplo que ya funciona y que puedes cambiar.", status: "hoy", href: "/estudiante" },
        { text: "Marca en «Mi forma de aprender»: imágenes y trabajar con un compañero.", status: "nuevo", href: "/estudiante" },
        { text: "Si te da error, recuerda: error, pista, nuevo intento. Después cuenta qué te ayudó.", status: "nuevo", href: "/bitacora" },
        { text: "Mira tu nota y el comentario de tu docente en Mi progreso.", status: "nuevo", href: "/progreso" },
      ],
      result: "Tu docente sabe qué te ayuda a programar.",
      decides: "Con qué reto empiezas: mínimo, esperado o extra.",
    },
    {
      situation: "Abres la clase de Inglés y quieres saber qué tienes que hacer y cuánto tiempo tienes.",
      steps: [
        { text: "Lee «Qué vamos a hacer»: un paso por línea.", status: "hoy", href: "/estudiante" },
        { text: "Mira tu prueba adaptada con notas como «puedes apoyarte en un dibujo».", status: "hoy", href: "/estudiante" },
        { text: "Marca «Mi forma de aprender» y cuenta qué te ayudó hoy.", status: "nuevo", href: "/bitacora" },
      ],
      result: "Tu docente ve lo que dijiste que te ayuda.",
      decides: "Con qué apoyo empiezas.",
    },
    {
      situation: "Encuentras una palabra que no entiendes en la actividad de Matemáticas.",
      steps: [
        { text: "Lee las instrucciones y la prueba adaptada.", status: "hoy", href: "/estudiante" },
        { text: "Cuenta qué te ayudó: «el glosario con dibujos».", status: "nuevo", href: "/bitacora" },
        { text: "Tocar una palabra y pedir su definición.", status: "pronto" },
      ],
      result: "Tu nota llega al docente y puede mejorar el glosario.",
      decides: "Pedir ayuda cuando no entiendes.",
    },
    {
      situation: "Te cansas en medio de la tarea de Ciencias naturales.",
      steps: [
        { text: "Lee las instrucciones y la prueba con respuesta oral.", status: "hoy", href: "/estudiante" },
        { text: "Marca en «Mi forma de aprender»: explicaciones del profesor y paso a paso.", status: "nuevo", href: "/estudiante" },
        { text: "Escribe: «con la pausa volví a concentrarme».", status: "nuevo", href: "/bitacora" },
      ],
      result: "Tu docente sabe qué te sirve y cuándo.",
      decides: "Cuándo tomar la pausa.",
    },
    {
      situation: "Quieres entregar el cuento sin leerlo frente al curso.",
      steps: [
        { text: "Mira los pasos cortos y la opción de responder en voz alta.", status: "hoy", href: "/estudiante" },
        { text: "Marca que prefieres practicar directamente y ejemplos.", status: "nuevo", href: "/estudiante" },
        { text: "Cuenta cómo entregaste y cómo te fue.", status: "nuevo", href: "/bitacora" },
      ],
      result: "Tu elección queda a la vista de tu docente.",
      decides: "Cómo entregas.",
    },
    {
      situation: "Abres la actividad de la línea de tiempo y quieres decir si el ajuste te sirvió.",
      steps: [
        { text: "Mira los pasos y la prueba con apoyo visual.", status: "hoy", href: "/estudiante" },
        { text: "Cuenta si la línea con imágenes y una sola tarea te ayudó.", status: "nuevo", href: "/bitacora" },
        { text: "Ver «Tu ajuste de hoy» con una frase para ti.", status: "pronto" },
      ],
      result: "Tu respuesta alimenta la revisión del ajuste.",
      decides: "Si el ajuste te sirve.",
    },
  ],
};

export const STATUS_LABEL: Record<StepStatus, string> = {
  hoy: "Ya funciona",
  nuevo: "Nuevo",
  pronto: "Próximamente",
};
