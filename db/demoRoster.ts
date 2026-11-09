// Datos SIMULADOS de la demostración: estudiantes con código, perfiles PIAR,
// actividades con DUA y categorías de apoyo nuevas. Reemplaza a lib/mockData.ts
// en la semilla. Ningún estudiante tiene nombre: solo código (P-01 a P-10), para
// que quede claro que son datos simulados y para que coincidan con los códigos
// de la exposición guiada de la plataforma Sinapsis.
//
// Origen del contenido: documentos de ejemplo del proyecto
// (Mosaico Telar/Documentos/EJEMPLOS_PARA_CARGAR), construidos sobre la malla de
// Tecnología de 8° y las Orientaciones Curriculares del MEN (2022).
// Las "impresiones" clínicas son ficticias y no tienen valor clínico.

export const DEMO_STUDENT_CODES = Array.from({ length: 10 }, (_, i) => `P-${String(i + 1).padStart(2, "0")}`);

/** El estudiante y la familia de la demostración (la plataforma empieza por este caso). */
export const DEMO_GUARDIAN_CHILD = "P-03";

export interface DemoPiar {
  learningStyle: "visual" | "auditivo" | "kinestesico" | "lectoescritura";
  strengths: string[];
  barriers: string[];
  /** [nombre de la categoría de apoyo, cómo se aplica en clase] */
  supports: Array<[string, string]>;
  impresion: string;
  professional: string;
  notes: string;
}

export const DEMO_PIAR: Record<string, DemoPiar> = {
  "P-03": {
    learningStyle: "visual",
    strengths: ["Buena memoria visual", "Mantiene el orden cuando la tarea es una sola", "Colabora y escucha en trabajo de a dos"],
    barriers: ["Pierde la atención con instrucciones extensas", "Ansiedad al leer en voz alta frente al curso", "Le cuesta pasar de una tarea a otra sin una pausa"],
    supports: [
      ["Instrucciones simplificadas", "Una instrucción por línea, en pasos cortos y numerados."],
      ["Apoyo visual", "Una tarjeta o imagen por paso; esquemas antes que párrafos."],
      ["Tiempos extendidos", "Hasta un 50 % más del tiempo en actividades y evaluaciones."],
      ["Evitar la lectura en voz alta frente al curso", "Puede entregar grabado o leerle solo al docente."],
      ["Una sola tarea a la vez", "Se entrega la siguiente tarea cuando termina la anterior."],
    ],
    impresion: "Rasgos de ansiedad ante la exposición oral y dificultad para sostener la atención con instrucciones largas (simulado).",
    professional: "PR-01, psicología educativa externa (simulado)",
    notes: "Dividir instrucciones en pasos cortos; anticipar cambios de actividad con una señal visual; no forzar la exposición oral; ofrecer entrega grabada.",
  },
  "P-07": {
    learningStyle: "visual",
    strengths: ["Cálculo mental ágil", "Perseverante cuando entiende el contexto", "Ordenado con sus cuadernos"],
    barriers: ["Vocabulario técnico nuevo (razón, escala, proporción)", "Ritmo más lento con enunciados largos", "Evita preguntar delante del curso"],
    supports: [
      ["Vocabulario de apoyo", "Glosario ilustrado a la mano con cada palabra nueva y un ejemplo de la vida diaria."],
      ["Tiempos extendidos", "Tiempo adicional en problemas con enunciado largo."],
      ["Apoyo visual", "Tablas y esquemas para organizar los datos."],
    ],
    impresion: "Procesamiento más lento del lenguaje técnico, sin compromiso del razonamiento numérico (simulado).",
    professional: "PR-02, fonoaudiología externa (simulado)",
    notes: "Presentar el vocabulario nuevo con imagen y ejemplo antes de la actividad; tiempo adicional en enunciados largos; verificar la comprensión del enunciado.",
  },
  "P-02": {
    learningStyle: "kinestesico",
    strengths: ["Curiosidad por los seres vivos", "Manipula material con facilidad", "Asume bien el rol de líder del grupo"],
    barriers: ["Dificultad para permanecer quieto más de 25 minutos", "Se pierde si las instrucciones son solo orales", "Le cuesta organizar tareas de varios pasos"],
    supports: [
      ["Pausas activas", "Una pausa de tres a cinco minutos cada 25 minutos de clase."],
      ["Apoyo auditivo", "Instrucciones dichas en voz alta y repetidas cuando las necesite."],
      ["Instrucciones simplificadas", "Las mismas instrucciones también por escrito, en pasos."],
      ["Agrupamiento flexible", "Roles que rotan en el grupo para moverse y participar."],
    ],
    impresion: "Necesidad de movimiento frecuente y dificultad con la atención sostenida (simulado).",
    professional: "PR-03, terapia ocupacional externa (simulado)",
    notes: "Pausas activas programadas; instrucciones por dos canales; roles activos en el trabajo en grupo.",
  },
  "P-05": {
    learningStyle: "auditivo",
    strengths: ["Imaginación y vocabulario amplio al conversar", "Escucha con atención", "Cuida el detalle de sus dibujos"],
    barriers: ["Bloqueo al leer en voz alta frente al curso", "Dificultad para organizar ideas en textos largos"],
    supports: [
      ["Evitar la lectura en voz alta frente al curso", "Entrega su texto escrito, grabado o leído solo al docente."],
      ["Instrucciones simplificadas", "Pasos cortos para planear, escribir y revisar el cuento."],
      ["Evaluación oral", "Puede explicar su cuento hablando con el docente."],
    ],
    impresion: "Bloqueo ante la exposición pública, sin dificultad de lectura silenciosa (simulado).",
    professional: "PR-01, psicología educativa externa (simulado)",
    notes: "Evitar la exposición pública forzada; ofrecer formatos de entrega alternativos desde el diseño de la actividad.",
  },
  "P-08": {
    learningStyle: "visual",
    strengths: ["Interés por las historias y los personajes", "Buen dibujo", "Pregunta cuando algo no le queda claro"],
    barriers: ["Ubicar hechos en secuencia temporal", "Hacer varias tareas a la vez"],
    // «Una sola tarea a la vez» falta a propósito: es el ajuste que el docente propone
    // y que orientación debe revisar (caso 5 de la exposición).
    supports: [["Apoyo visual", "Líneas de tiempo con imágenes y colores por periodo."]],
    impresion: "Dificultad con la organización secuencial (simulado).",
    professional: "PR-02, fonoaudiología externa (simulado)",
    notes: "Usar apoyos visuales de secuencia; entregar una tarea cada vez (propuesto, en revisión).",
  },
  "P-04": {
    learningStyle: "visual",
    strengths: ["Creatividad visual", "Constancia con retos cuyo resultado se ve", "Buen compañero de pareja"],
    barriers: ["Instrucciones abstractas de varios pasos (sintaxis)", "Se frustra y se detiene ante el primer error"],
    supports: [
      ["Instrucciones simplificadas", "Cada paso con un ejemplo que ya funciona y que puede copiar y cambiar."],
      ["Apoyo visual", "Diagramas de flujo y Turtle: el resultado del código se ve en pantalla."],
      ["Agrupamiento flexible", "Programación en pareja con roles que rotan: quien escribe y quien guía."],
      ["Reducción de carga de trabajo", "Retos por niveles: mínimo, esperado y extra; el mínimo basta para aprobar el desempeño."],
      ["Uso de tecnología asistiva", "Editor con letra grande y alto contraste."],
    ],
    impresion: "Baja tolerancia a la frustración ante tareas con reglas abstractas (simulado).",
    professional: "PR-03, terapia ocupacional externa (simulado)",
    notes: "Normalizar el error («error, pista, nuevo intento»); resultados visibles y rápidos antes de lo abstracto; trabajo en pareja con roles claros.",
  },
};

export const NEW_SUPPORT_CATEGORIES = [
  {
    name: "Una sola tarea a la vez",
    description: "Entregar la siguiente tarea cuando termina la anterior, sin saltar entre varias.",
    studentFriendlyText: "Hoy trabajas una tarea a la vez.",
  },
  {
    name: "Evitar la lectura en voz alta frente al curso",
    description: "Ofrecer entrega escrita, grabada o leída solo al docente.",
    studentFriendlyText: "Puedes entregar tu texto sin leerlo frente al curso.",
  },
  {
    name: "Vocabulario de apoyo",
    description: "Tener a la mano un glosario ilustrado con cada palabra nueva.",
    studentFriendlyText: "Tienes un glosario con dibujos para las palabras nuevas.",
  },
];

export interface DemoActivity {
  key: string;
  subjectId: string;
  topic: string;
  objective: string;
  instructions: string;
  resources: string[];
  representation: string;
  expression: string;
  engagement: string;
  evidence: string;
  date: string;
}

// Seis actividades: Tecnología como caso principal y las cinco de la exposición.
export const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    key: "tecnologia",
    subjectId: "tecnologia-informatica",
    topic: "Mi primer programa con Turtle (Python)",
    objective: "Construir algoritmos funcionales con la sintaxis básica de Python y Turtle para dibujar figuras (competencia de la malla del tercer periodo, 8°).",
    instructions: "Abre Thonny y ejecuta el «Hola mundo» que ya funciona\nCambia una palabra y vuelve a ejecutar\nDibuja un cuadrado con Turtle: avanzar y girar\nRepite el cuadrado con un ciclo\nCrea una figura propia y explica qué cambiaste",
    resources: ["Programa de ejemplo que ya funciona", "Diagrama de flujo de cada figura", "Glosario ilustrado: algoritmo, ciclo, variable, error"],
    representation: "Ejemplo que ya funciona proyectado e impreso con el código comentado; diagrama de flujo antes de escribir; el mismo contenido en video corto, en guía escrita y en voz alta.",
    expression: "Escribir el código, armar el programa con bloques o explicarlo con el diagrama; entregar el programa, una grabación de pantalla o una explicación oral. Retos por niveles: mínimo, esperado y extra.",
    engagement: "Elegir qué figura dibujar; trabajo en pareja con roles rotativos y una pausa activa a la mitad; el error se trata como pista: «error, pista, nuevo intento».",
    evidence: "Programa «Hola mundo» y una figura con Turtle que aplica un ciclo",
    date: "2026-11-10",
  },
  {
    key: "ingles",
    subjectId: "humanidades-lengua",
    topic: "Mi rutina del día",
    objective: "Describir en oraciones cortas las actividades de la rutina diaria usando el presente simple.",
    instructions: "Mira las tarjetas con imágenes de tu rutina\nOrdena las tarjetas de tu día\nPon el nombre en inglés a cada tarjeta\nEscribe cinco oraciones sobre tu rutina",
    resources: ["Tarjetas con imagen y palabra", "Audio del vocabulario"],
    representation: "Tarjetas con imagen y palabra por cada actividad; audio del vocabulario; instrucciones en pasos cortos, una por línea.",
    expression: "Responder con dibujo, tarjetas, oración escrita o grabación de voz; nadie lee en voz alta frente al curso.",
    engagement: "Cada quien elige las cinco actividades de su propia rutina; trabajo en parejas para ordenar las tarjetas.",
    evidence: "Cinco oraciones sobre su rutina, escritas o grabadas",
    date: "2026-11-11",
  },
  {
    key: "matematicas",
    subjectId: "matematicas",
    topic: "Recetas y escalas: razón y proporción",
    objective: "Usar razones y proporciones para escalar una receta y una escala de un plano.",
    instructions: "Lee la receta y el glosario ilustrado\nDuplica la receta con una tabla\nReduce la receta a la mitad\nCompara con la escala de un plano",
    resources: ["Receta real", "Glosario ilustrado: razón, proporción, escala", "Tabla de datos"],
    representation: "Receta real y tabla de datos; glosario ilustrado; ejemplo resuelto en voz alta y por escrito.",
    expression: "Resolver con material (tazas, cintas), con tabla o con operaciones; explicar hablando, dibujando o escribiendo.",
    engagement: "Elegir la receta (arepas, limonada, brownie); trabajo en parejas con roles: quien mide y quien anota.",
    evidence: "Receta escalada con la tabla y una explicación de qué es una razón",
    date: "2026-11-12",
  },
  {
    key: "ciencias",
    subjectId: "ciencias-naturales",
    topic: "Quién come a quién: cadenas alimentarias",
    objective: "Explicar cómo fluye la energía en una cadena alimentaria, identificando productores y consumidores.",
    instructions: "Mira el video corto y lee el texto\nElige un ecosistema\nArma una cadena con las tarjetas\nExplica quién produce y quién consume",
    resources: ["Video corto", "Tarjetas de seres vivos"],
    representation: "Video corto, texto y tarjetas con imagen de cada ser vivo; instrucciones orales y escritas al mismo tiempo.",
    expression: "Armar la cadena con tarjetas, dibujarla o explicarla; pausa activa de tres minutos a la mitad.",
    engagement: "Elegir el ecosistema (río, páramo, huerta o patio); roles que rotan: lector, armador, relator, cronometrista.",
    evidence: "Una cadena alimentaria con cuatro eslabones, explicada con sus palabras",
    date: "2026-11-13",
  },
  {
    key: "lengua",
    subjectId: "humanidades-lengua",
    topic: "Escribo un cuento corto",
    objective: "Escribir un cuento corto con inicio, nudo y final, cuidando la coherencia y la ortografía.",
    instructions: "Lee un cuento de ejemplo con sus partes marcadas\nPlanea tu cuento con dibujos o palabras clave\nEscribe inicio, nudo y final\nRevisa y entrega",
    resources: ["Cuentos de ejemplo con colores", "Plantilla de planeación"],
    representation: "Ejemplos de cuentos cortos con inicio, nudo y final marcados con colores; pasos del proceso: planear, escribir, revisar, entregar.",
    expression: "Entregar escrito, grabado o leído solo al docente; plan del cuento con dibujos o con palabras clave.",
    engagement: "Elegir el tema y los personajes; intercambio opcional de cuentos por escrito entre parejas.",
    evidence: "Un cuento corto de al menos tres párrafos, en el formato elegido",
    date: "2026-11-16",
  },
  {
    key: "sociales",
    subjectId: "ciencias-sociales",
    topic: "Línea de tiempo de la Independencia",
    objective: "Ubicar en una línea de tiempo cinco hechos del proceso de Independencia y explicar uno de ellos.",
    instructions: "Mira las tarjetas de hechos con imágenes\nUbica cinco hechos en orden\nDibuja o escribe cada hecho\nExplica uno con tus palabras",
    resources: ["Línea de tiempo con imágenes", "Tarjetas de hechos"],
    representation: "Línea de tiempo con imágenes y un color por periodo; texto breve de cada hecho, leído en voz alta por el docente.",
    expression: "Ubicar tarjetas, dibujar o escribir cada hecho; explicar un hecho hablando o por escrito.",
    engagement: "Elegir cuál hecho explicar; pareja de revisión: cada una verifica el orden de la línea de la otra.",
    evidence: "Línea de tiempo con cinco hechos en orden y la explicación de uno",
    date: "2026-11-17",
  },
];
