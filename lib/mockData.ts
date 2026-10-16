import type { LessonPlan, Student } from "@/types";

// SOLO para db/seed.ts. Desde el 2026-10-16 ninguna pantalla lee este
// archivo: todas leen la BD a través de lib/data/*. Si una página lo
// importa, se salta lib/permissions.ts y vuelve a mostrar diagnósticos sin
// control de acceso (fue lo que pasaba en app/page.tsx y app/generador).
//
// Roster basado en "listado cursos/estudiantes_PIAR_datos_ficticios.xlsx"
// (curso 8°-A). Datos ficticios para pruebas de la aplicación — no
// representan diagnósticos reales.
export const mockStudents: Student[] = [
  {
    id: "std-001",
    fullName: "Valentina Rodríguez Gómez",
    grade: "8°",
    group: "8°-A",
    hasPiar: true,
    guardianContact: "valentina.rodriguez.padres@correo.com",
    piarProfile: {
      id: "piar-001",
      diagnosis: "TDAH — presentación predominantemente inatenta",
      adjustmentTypes: [
        "Instrucciones simplificadas",
        "Pausas activas",
        "Ubicación preferencial en el aula",
      ],
      learningStyle: "auditivo",
      strengths: [
        "Buena disposición para tareas prácticas y manuales",
        "Responde bien a la retroalimentación inmediata",
      ],
      supportNeeds: [
        "Instrucciones breves y segmentadas",
        "Verificar comprensión",
        "Permitir pausas cortas",
        "Ubicar cerca del docente",
        "Reducir distractores",
      ],
      recommendedResources: [
        "Guía de instrucciones paso a paso",
        "Rutina de pausa activa",
        "Mapa de distribución del aula (puesto cercano al docente)",
      ],
      lastReview: "2026-06-05",
      responsibleProfessional: "Equipo de Orientación Escolar",
    },
  },
  {
    id: "std-002",
    fullName: "Mateo Hernández Silva",
    grade: "8°",
    group: "8°-A",
    hasPiar: true,
    guardianContact: "mateo.hernandez.padres@correo.com",
    piarProfile: {
      id: "piar-002",
      diagnosis: "TDAH — presentación combinada",
      adjustmentTypes: [
        "Instrucciones simplificadas",
        "Pausas activas",
        "Apoyo visual",
      ],
      learningStyle: "kinestesico",
      strengths: [
        "Alta energía y motivación en actividades dinámicas",
        "Buena disposición para el trabajo en equipo",
      ],
      supportNeeds: [
        "Dividir actividades en pasos",
        "Establecer tiempos cortos",
        "Permitir pausas de movimiento",
        "Utilizar recordatorios visuales",
        "Reforzar positivamente los avances",
      ],
      recommendedResources: [
        "Guía de trabajo fragmentada en pasos",
        "Rutina de pausa activa con movimiento",
        "Tarjetas de recordatorio visual",
        "Registro de refuerzo positivo",
      ],
      lastReview: "2026-06-05",
      responsibleProfessional: "Equipo de Orientación Escolar",
    },
  },
  {
    id: "std-003",
    fullName: "Sofía Martínez Torres",
    grade: "8°",
    group: "8°-A",
    hasPiar: true,
    guardianContact: "sofia.martinez.padres@correo.com",
    piarProfile: {
      id: "piar-003",
      diagnosis: "Discapacidad intelectual — nivel leve",
      adjustmentTypes: [
        "Instrucciones simplificadas",
        "Apoyo visual",
        "Tiempos extendidos",
        "Reducción de carga de trabajo",
      ],
      learningStyle: "visual",
      strengths: [
        "Buena disposición y motivación frente a las actividades",
        "Aprendizaje sólido cuando cuenta con apoyo visual",
      ],
      supportNeeds: [
        "Utilizar instrucciones concretas",
        "Apoyos visuales",
        "Verificar comprensión",
        "Adaptar cantidad y complejidad de actividades",
        "Proporcionar tiempo adicional",
      ],
      recommendedResources: [
        "Pictogramas y apoyos visuales",
        "Guía de instrucciones concretas",
        "Actividades adaptadas en cantidad y complejidad",
        "Tiempo adicional para completar tareas",
      ],
      lastReview: "2026-06-05",
      responsibleProfessional: "Equipo de Orientación Escolar",
    },
  },
  {
    id: "std-004",
    fullName: "Juan David Pérez Castro",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "juan.perez.padres@correo.com",
  },
  {
    id: "std-005",
    fullName: "Mariana López Ramírez",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "mariana.lopez.padres@correo.com",
  },
  {
    id: "std-006",
    fullName: "Nicolás Gómez Vargas",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "nicolas.gomez.padres@correo.com",
  },
  {
    id: "std-007",
    fullName: "Laura Sánchez Moreno",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "laura.sanchez.padres@correo.com",
  },
  {
    id: "std-008",
    fullName: "Samuel Torres Rojas",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "samuel.torres.padres@correo.com",
  },
  {
    id: "std-009",
    fullName: "Isabella Martínez Díaz",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "isabella.martinez.padres@correo.com",
  },
  {
    id: "std-010",
    fullName: "Daniel Cárdenas Ruiz",
    grade: "8°",
    group: "8°-A",
    hasPiar: false,
    guardianContact: "daniel.cardenas.padres@correo.com",
  },
];

export const mockLessonPlans: LessonPlan[] = [
  {
    id: "plan-001",
    subject: "ciencias-naturales",
    topic: "Genética y herencia mendeliana",
    grade: "8°",
    objective:
      "Comprender los principios básicos de la herencia genética mediante el análisis de cruces monohíbridos y la interpretación de cuadros de Punnett.",
    activities: [
      {
        id: "plan-001-act-1",
        title: "Introducción a los conceptos clave",
        description:
          "Exposición magistral sobre genotipo, fenotipo, alelos dominantes y recesivos, apoyada en diapositivas.",
        durationMinutes: 20,
      },
      {
        id: "plan-001-act-2",
        title: "Taller de cuadros de Punnett",
        description:
          "Trabajo en parejas resolviendo cruces genéticos simples en el tablero y en el cuaderno.",
        durationMinutes: 25,
      },
      {
        id: "plan-001-act-3",
        title: "Lectura y análisis de caso",
        description:
          "Lectura individual de un artículo corto sobre enfermedades hereditarias y resolución de preguntas de comprensión.",
        durationMinutes: 20,
      },
      {
        id: "plan-001-act-4",
        title: "Socialización y cierre",
        description:
          "Puesta en común de resultados y retroalimentación grupal sobre los cruces resueltos.",
        durationMinutes: 15,
      },
    ],
    resources: [
      "Presentación en diapositivas",
      "Guía impresa de cuadros de Punnett",
      "Artículo de lectura sobre herencia genética",
      "Tablero y marcadores",
    ],
    evaluationMethod: "Quiz corto individual + guía de trabajo en parejas",
    date: "2026-08-12",
  },
  {
    id: "plan-002",
    subject: "matematicas",
    topic: "Sistemas de ecuaciones lineales 2x2",
    grade: "8°",
    objective:
      "Resolver sistemas de ecuaciones lineales con dos incógnitas mediante los métodos de sustitución y reducción, aplicándolos a problemas cotidianos.",
    activities: [
      {
        id: "plan-002-act-1",
        title: "Diagnóstico y repaso",
        description:
          "Repaso breve de ecuaciones de primer grado con una incógnita como base para el nuevo tema.",
        durationMinutes: 15,
      },
      {
        id: "plan-002-act-2",
        title: "Método de sustitución",
        description:
          "Ejercicios guiados en el tablero resolviendo sistemas 2x2 por sustitución.",
        durationMinutes: 25,
      },
      {
        id: "plan-002-act-3",
        title: "Método de reducción",
        description: "Taller en parejas resolviendo sistemas por el método de reducción.",
        durationMinutes: 25,
      },
      {
        id: "plan-002-act-4",
        title: "Aplicación a problemas cotidianos",
        description:
          "Planteamiento y solución de dos problemas de la vida real que se modelan con sistemas de ecuaciones.",
        durationMinutes: 15,
      },
    ],
    resources: ["Guía de ejercicios", "Calculadora científica", "Tablero cuadriculado"],
    evaluationMethod: "Taller calificado en parejas + 3 problemas individuales",
    date: "2026-08-13",
  },
  {
    id: "plan-003",
    subject: "ciencias-sociales",
    topic: "La Constitución Política de Colombia de 1991",
    grade: "8°",
    objective:
      "Comprender la estructura y los principios fundamentales de la Constitución de 1991 y su relevancia en la vida democrática actual.",
    activities: [
      {
        id: "plan-003-act-1",
        title: "Antecedentes de la Constituyente",
        description: "Construcción de una línea de tiempo con los hechos previos a 1991.",
        durationMinutes: 20,
      },
      {
        id: "plan-003-act-2",
        title: "Lectura comentada de derechos fundamentales",
        description:
          "Lectura guiada del Título II de la Constitución, identificando derechos civiles, sociales y colectivos.",
        durationMinutes: 25,
      },
      {
        id: "plan-003-act-3",
        title: "Debate dirigido",
        description: "Debate en grupos sobre derechos y deberes ciudadanos en la vida escolar.",
        durationMinutes: 25,
      },
      {
        id: "plan-003-act-4",
        title: "Cierre con mapa conceptual",
        description: "Construcción colaborativa de un mapa conceptual sobre lo aprendido.",
        durationMinutes: 10,
      },
    ],
    resources: [
      "Ejemplar de la Constitución Política",
      "Video documental sobre la Asamblea Constituyente",
      "Papelógrafo",
    ],
    evaluationMethod: "Participación en el debate + mapa conceptual grupal",
    date: "2026-08-14",
  },
  {
    id: "plan-004",
    subject: "humanidades-lengua",
    topic: "El ensayo argumentativo",
    grade: "8°",
    objective:
      "Producir un ensayo argumentativo breve, identificando tesis, argumentos y conclusión sobre un tema de actualidad.",
    activities: [
      {
        id: "plan-004-act-1",
        title: "Análisis de un ensayo modelo",
        description: "Lectura e identificación de la estructura de un ensayo argumentativo modelo.",
        durationMinutes: 20,
      },
      {
        id: "plan-004-act-2",
        title: "Identificación de tesis y argumentos",
        description: "Trabajo en parejas señalando tesis, argumentos y conclusión en el texto modelo.",
        durationMinutes: 20,
      },
      {
        id: "plan-004-act-3",
        title: "Planeación del propio ensayo",
        description: "Elaboración individual de un borrador con tesis y argumentos propios.",
        durationMinutes: 25,
      },
      {
        id: "plan-004-act-4",
        title: "Socialización de borradores",
        description: "Lectura voluntaria de borradores y retroalimentación entre compañeros.",
        durationMinutes: 15,
      },
    ],
    resources: ["Ensayo modelo fotocopiado", "Guía de estructura argumentativa", "Rúbrica de evaluación"],
    evaluationMethod: "Entrega de borrador + rúbrica de coevaluación",
    date: "2026-08-17",
  },
  {
    id: "plan-005",
    subject: "tecnologia-informatica",
    topic: "Introducción a hojas de cálculo para análisis de datos",
    grade: "8°",
    objective:
      "Utilizar fórmulas y gráficos básicos en una hoja de cálculo para organizar y analizar un conjunto de datos sencillo.",
    activities: [
      {
        id: "plan-005-act-1",
        title: "Exploración de la interfaz",
        description: "Reconocimiento guiado de celdas, filas, columnas y hojas.",
        durationMinutes: 15,
      },
      {
        id: "plan-005-act-2",
        title: "Fórmulas básicas",
        description: "Práctica de suma, promedio y una función condicional simple.",
        durationMinutes: 25,
      },
      {
        id: "plan-005-act-3",
        title: "Creación de un gráfico",
        description: "Elaboración de un gráfico a partir de un conjunto de datos propio.",
        durationMinutes: 25,
      },
      {
        id: "plan-005-act-4",
        title: "Presentación de resultados",
        description: "Presentación breve del gráfico y las conclusiones obtenidas.",
        durationMinutes: 15,
      },
    ],
    resources: [
      "Computadores o tablets con hoja de cálculo",
      "Plantilla de datos de ejemplo",
      "Guion de práctica paso a paso",
    ],
    evaluationMethod: "Entrega del archivo con fórmulas y gráfico funcional",
    date: "2026-08-18",
  },
];
