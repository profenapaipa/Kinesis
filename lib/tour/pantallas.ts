import type { AccionNiky, Ejemplo, RolRecorrido } from "./tipos";

// Qué se ve en la pantalla real de Kinesis a la que lleva cada paso, contado en
// lenguaje llano. Se redacta aparte de los datos del recorrido porque describe
// la INTERFAZ (que puede cambiar), no el caso: si una pantalla cambia, se
// corrige aquí sin tocar los 20 ejemplos.
//
// Regla: solo se describe lo que la pantalla muestra hoy. Lo que todavía no
// existe no se cuenta como si existiera.

export interface DescripcionPantalla {
  nombre: string;
  /** Tres cosas concretas que se ven. */
  queVes: string[];
  /** Una invitación a hacer algo pequeño al llegar. */
  prueba: string;
}

const PANTALLAS: Record<string, DescripcionPantalla> = {
  "docente|/planeacion/tecnologia-informatica": {
    nombre: "Planeación de Tecnología e informática",
    queVes: [
      "La actividad del periodo con su objetivo y sus instrucciones.",
      "El diseño universal para todo el curso: más de una forma de presentar, de expresar lo aprendido y de motivar.",
      "El formulario para cargar otra actividad de esta asignatura.",
    ],
    prueba: "Lee cómo la actividad ofrece varias formas de entrar al mismo tema.",
  },
  "docente|/planeacion/matematicas": {
    nombre: "Planeación de Matemáticas",
    queVes: [
      "Las actividades que cargaste para el área, cada una con su curso y su fecha.",
      "El objetivo y las instrucciones de cada actividad.",
      "El diseño universal con el que la clase se prepara para todo el grupo, no solo para un estudiante.",
    ],
    prueba: "Busca dónde queda escrito el objetivo y compáralo con lo que decidiste en el recorrido.",
  },
  "docente|/planeacion/humanidades-lengua": {
    nombre: "Planeación de Lengua castellana",
    queVes: [
      "Las actividades de Lengua con su curso, su fecha y su estado.",
      "El objetivo, las instrucciones y el diseño universal de cada una.",
      "El formulario para sumar una actividad nueva.",
    ],
    prueba: "Mira cómo la actividad permite expresar lo aprendido de más de una manera.",
  },
  "docente|/generador": {
    nombre: "Ajustes PIAR",
    queVes: [
      "La actividad más reciente y los estudiantes con apoyos en tu curso, identificados por su código.",
      "Los ajustes que se proponen para cada estudiante, pensados desde la actividad y no desde un diagnóstico.",
      "El botón para pedirle ideas a Niky, que vive en la plataforma Sinapsis.",
    ],
    prueba: "Revisa un ajuste y piensa si lo dejarías, lo cambiarías o lo quitarías: esa decisión es tuya.",
  },
  "docente|/bitacora": {
    nombre: "Bitácora de clase",
    queVes: [
      "Un campo para escribir una novedad en una frase: lo que funcionó, lo que no, lo que viste.",
      "Los registros recientes, con su fecha.",
      "El botón «Ordenar con Niky», que propone un orden y deja que tú lo confirmes.",
    ],
    prueba: "Escribe una frase de ejemplo y mira cómo quedaría el registro. En esta muestra no se guarda.",
  },
  "orientador|/estudiantes": {
    nombre: "Lista de estudiantes",
    queVes: [
      "Los estudiantes de todo el colegio, con su curso y el código con el que se les nombra.",
      "Al abrir uno: su perfil pedagógico, los apoyos que funcionan y el seguimiento con acuerdos.",
      "La bitácora con lo que han registrado docentes y familia, sin observaciones privadas de otros.",
    ],
    prueba: "Abre un perfil y busca los acuerdos de seguimiento y su fecha de revisión.",
  },
  "orientador|/documentos": {
    nombre: "Documentos",
    queVes: [
      "La lista de verificación de documentos: cuáles ya están y cuáles faltan.",
      "Dónde van el PIAR, el acta con la familia y los soportes.",
      "Un aviso de que los documentos clínicos tienen acceso restringido.",
    ],
    prueba: "Mira qué documentos son imprescindibles para empezar a operar.",
  },
  "padre|/padre": {
    nombre: "Panel de la familia",
    queVes: [
      "Lo que está aprendiendo tu hija o hijo en cada asignatura, en palabras sencillas.",
      "Su plan de apoyos: los ajustes razonables que el colegio aplica en clase.",
      "«Cómo puedes acompañar» y el seguimiento que el equipo decidió compartir contigo.",
    ],
    prueba: "Lee «Cómo puedes acompañar»: son ideas pequeñas para hacer en casa sin saber del tema.",
  },
  "padre|/progreso": {
    nombre: "Progreso",
    queVes: [
      "Las actividades de tu hija o hijo con su estado: pendiente, entregada o calificada.",
      "La nota del docente en la escala de 1,0 a 5,0 y su comentario.",
      "Cifras de resumen: cuántas están calificadas, cuántas esperan nota y el promedio.",
    ],
    prueba: "Busca el comentario del docente: dice más que la nota.",
  },
  "padre|/documentos": {
    nombre: "Documentos de la familia",
    queVes: [
      "Los documentos que necesitas leer o firmar, como la autorización de datos.",
      "Cuáles ya están cargados y cuáles faltan.",
      "Nada de información clínica: eso no se muestra a la familia en esta pantalla.",
    ],
    prueba: "Revisa qué documento tendrías que firmar primero.",
  },
  "administrador|/documentos": {
    nombre: "Documentos del colegio",
    queVes: [
      "La lista de lo que el colegio debe tener cargado, con los imprescindibles primero.",
      "Cuántos van y cuántos faltan.",
      "Solo el estado de los documentos: coordinación no ve los apoyos de ningún estudiante.",
    ],
    prueba: "Busca el documento de política de datos y mira si está al día.",
  },
  "administrador|/admin/categorias-apoyo": {
    nombre: "Categorías de apoyo",
    queVes: [
      "El catálogo de categorías que los docentes usan al registrar apoyos y seguimiento.",
      "Un interruptor para activar o desactivar cada categoría.",
      "El formulario para crear una categoría nueva.",
    ],
    prueba: "Mira cómo una categoría se describe en términos de apoyo, no de etiqueta para una persona.",
  },
  "administrador|/admin/cursos": {
    nombre: "Cursos",
    queVes: [
      "Los cursos creados, con sus docentes y sus estudiantes matriculados.",
      "El formulario para crear un curso y para asignar docentes.",
      "La matrícula de estudiantes, identificados por su código.",
    ],
    prueba: "Mira qué docente tiene asignado cada curso.",
  },
  "administrador|/admin/acudientes": {
    nombre: "Acudientes",
    queVes: [
      "Los vínculos entre cada acudiente y su estudiante.",
      "El formulario para crear un vínculo nuevo.",
      "El botón para retirar un vínculo, que solo coordinación puede usar.",
    ],
    prueba: "Revisa que cada estudiante tenga al menos un acudiente vinculado.",
  },
  "administrador|/admin": {
    nombre: "Resumen institucional",
    queVes: [
      "Conteos de usuarios, cursos y vínculos del colegio.",
      "Los accesos para gestionar usuarios, cursos, acudientes, categorías y periodos.",
      "Las alertas de lo que falta configurar.",
    ],
    prueba: "Busca la sección de alertas: dice por dónde conviene empezar.",
  },
};

/** Descripción de la pantalla del paso; si no hay una escrita, una genérica y honesta. */
export function describirPantalla(rol: RolRecorrido, ruta: string): DescripcionPantalla {
  return (
    PANTALLAS[`${rol}|${ruta}`] ?? {
      nombre: "Esta pantalla de Kinesis",
      queVes: ["La pantalla real de Kinesis para tu rol, con datos de ejemplo."],
      prueba: "Mírala con calma y vuelve al recorrido cuando quieras.",
    }
  );
}

/**
 * Las tres propuestas de Niky de cada ejemplo. Van redactadas como lo que Niky
 * SUGIERE; ninguna es una acción hecha. La tercera del docente es la «evaluación
 * rápida de las actividades personalizadas» que pidió el equipo.
 */
export function accionesDeNiky(rol: RolRecorrido, ejemplo: Ejemplo, asignatura: string): AccionNiky[] {
  const caso = `«${ejemplo.titulo}»`;
  switch (rol) {
    case "docente":
      return [
        {
          etiqueta: "Sugiere revisar",
          detalle: `los apoyos del curso antes de la próxima sesión de ${asignatura}, cruzados con ${caso}.`,
        },
        {
          etiqueta: "Avisa cuando una tarea se complete",
          detalle: `si el grupo termina ${caso}, te avisa y te propone qué anotar en la bitácora.`,
        },
        {
          etiqueta: "Prepara una evaluación rápida",
          detalle: "de las actividades personalizadas: tres preguntas cortas, cada una con su versión de apoyo, para que la revises antes de usarla.",
        },
      ];
    case "orientador":
      return [
        {
          etiqueta: "Sugiere revisar",
          detalle: `el seguimiento del estudiante ${ejemplo.estudiante}: los acuerdos vigentes y la fecha de la próxima revisión.`,
        },
        {
          etiqueta: "Avisa cuando una tarea se complete",
          detalle: `si el docente deja un registro nuevo en la bitácora sobre ${caso}, te lo señala, sin datos clínicos.`,
        },
        {
          etiqueta: "Prepara un borrador",
          detalle: "de nota para el docente con la recomendación, para que la ajustes y decidas si se comparte.",
        },
      ];
    case "padre":
      return [
        {
          etiqueta: "Sugiere revisar",
          detalle: `las ideas de «Cómo puedes acompañar» de esta semana sobre ${caso}.`,
        },
        {
          etiqueta: "Avisa cuando una tarea se complete",
          detalle: "si el docente califica la actividad y deja un comentario para la familia.",
        },
        {
          etiqueta: "Prepara una conversación corta",
          detalle: "para tener en casa: dos preguntas abiertas sobre lo que se aprendió, sin tono de examen.",
        },
      ];
    case "administrador":
      return [
        {
          etiqueta: "Sugiere revisar",
          detalle: "los documentos imprescindibles que todavía faltan por cargar, empezando por la política de datos.",
        },
        {
          etiqueta: "Avisa cuando una tarea se complete",
          detalle: "si una configuración queda lista, por ejemplo la asignación de docentes a un curso.",
        },
        {
          etiqueta: "Prepara un resumen de conteos",
          detalle: "para la reunión de coordinación: cifras del colegio, nunca los apoyos de un estudiante.",
        },
      ];
  }
}
