// Script de semilla — idempotente (se puede correr varias veces sin
// duplicar datos). Uso: npm run db:seed
//
// Siembra 10 estudiantes simulados del curso 8°-A (solo código 8A-01 a 8A-10, 6 con
// PIAR; ver db/demoRoster.ts) a usuarios/matrículas/perfil-pedagógico/información-clínica reales,
// y siembra un administrador y un docente de demostración.

import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
  academicPeriods,
  activities,
  activityProgress,
  classLogEntries,
  clinicalInfo,
  courses,
  courseTeachers,
  effectiveSupports,
  enrollments,
  followUpNotes,
  guardianStudents,
  institutionDocuments,
  pedagogicalBarriers,
  pedagogicalProfiles,
  pedagogicalStrengths,
  studentLearningPreferences,
  subjects,
  supportCategories,
  users,
} from "./schema";
import { hashPassword } from "../lib/auth/password";
import { DEMO_ACTIVITIES, DEMO_GUARDIAN_CHILD, DEMO_PIAR, DEMO_STUDENT_CODES, NEW_SUPPORT_CATEGORIES } from "./demoRoster";
import { MEN_SUBJECTS } from "../lib/subjects";
import type { Role } from "../types";

const SUPPORT_CATEGORY_SEED: Array<{
  name: string;
  description: string;
  studentFriendlyText: string;
}> = [
  {
    name: "Tiempos extendidos",
    description: "Otorgar tiempo adicional para completar actividades o evaluaciones.",
    studentFriendlyText: "Tienes más tiempo para terminar tus actividades.",
  },
  {
    name: "Apoyo visual",
    description: "Acompañar el contenido con imágenes, esquemas o pictogramas.",
    studentFriendlyText: "Puedes usar imágenes y esquemas para entender mejor.",
  },
  {
    name: "Instrucciones simplificadas",
    description: "Dividir instrucciones largas en pasos cortos y verificar comprensión.",
    studentFriendlyText: "Las instrucciones se explican paso a paso.",
  },
  {
    name: "Apoyo auditivo",
    description: "Reforzar el contenido con explicación oral o audio.",
    studentFriendlyText: "Puedes escuchar una explicación además de leerla.",
  },
  {
    name: "Material en braille",
    description: "Transcribir materiales a braille o formato accesible equivalente.",
    studentFriendlyText: "Tienes tus materiales en braille.",
  },
  {
    name: "Lengua de señas",
    description: "Disponer interpretación en Lengua de Señas Colombiana.",
    studentFriendlyText: "Cuentas con interpretación en lengua de señas.",
  },
  {
    name: "Agrupamiento flexible",
    description: "Ubicar al estudiante en grupos de apoyo entre pares.",
    studentFriendlyText: "Puedes trabajar en grupo con compañeros que te apoyan.",
  },
  {
    name: "Evaluación oral",
    description: "Permitir sustentar resultados de forma oral.",
    studentFriendlyText: "Puedes responder de forma oral en vez de escrita.",
  },
  {
    name: "Uso de tecnología asistiva",
    description: "Habilitar lector de pantalla, magnificador u otro software de apoyo.",
    studentFriendlyText: "Puedes usar herramientas tecnológicas de apoyo.",
  },
  {
    name: "Reducción de carga de trabajo",
    description: "Reducir la cantidad de ítems o la extensión de una actividad.",
    studentFriendlyText: "Tienes menos ejercicios para practicar lo mismo.",
  },
  {
    name: "Pausas activas",
    description: "Incluir pausas breves durante actividades largas.",
    studentFriendlyText: "Puedes tomar pausas cortas cuando las necesites.",
  },
  {
    name: "Ubicación preferencial en el aula",
    description: "Ubicar al estudiante cerca del docente y lejos de distractores.",
    studentFriendlyText: "Tienes un puesto cercano al profesor.",
  },
];

async function upsertUser(input: {
  username: string;
  password: string;
  fullName: string;
  role: Role;
  mustChangePassword?: boolean;
}) {
  const existing = await db.select().from(users).where(eq(users.username, input.username)).get();
  if (existing) return existing;

  return db
    .insert(users)
    .values({
      username: input.username,
      passwordHash: hashPassword(input.password),
      fullName: input.fullName,
      role: input.role,
      mustChangePassword: input.mustChangePassword ?? true,
    })
    .returning()
    .get();
}

async function main() {
  console.log("Sembrando asignaturas (MEN_SUBJECTS)...");
  for (const subject of MEN_SUBJECTS) {
    const existing = await db.select().from(subjects).where(eq(subjects.id, subject.id)).get();
    if (!existing) {
      await db.insert(subjects).values({
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
        color: subject.color,
      });
    }
  }

  console.log("Sembrando categorías de apoyo...");
  const supportCategoryIdByName = new Map<string, string>();
  for (const category of [...SUPPORT_CATEGORY_SEED, ...NEW_SUPPORT_CATEGORIES]) {
    let row = await db
      .select()
      .from(supportCategories)
      .where(eq(supportCategories.name, category.name))
      .get();
    if (!row) {
      row = await db.insert(supportCategories).values(category).returning().get();
    }
    supportCategoryIdByName.set(category.name, row.id);
  }

  console.log("Sembrando periodo académico activo...");
  let period = await db.select().from(academicPeriods).where(eq(academicPeriods.name, "2026")).get();
  if (!period) {
    period = await db
      .insert(academicPeriods)
      .values({
        name: "2026",
        startDate: "2026-01-20",
        endDate: "2026-11-27",
        isActive: true,
      })
      .returning()
      .get();
  }

  console.log("Sembrando administrador de demostración...");
  const adminUser = await upsertUser({
    username: "admin",
    password: "admin123",
    fullName: "Administrador del Sistema",
    role: "administrador",
    mustChangePassword: false,
  });

  console.log("Sembrando docente de demostración...");
  const teacher = await upsertUser({
    username: "docente",
    password: "docente123",
    fullName: "Camila Ortiz",
    role: "docente",
    mustChangePassword: false,
  });

  console.log("Sembrando curso 8°-A...");
  let course = await db.select().from(courses).where(eq(courses.name, "8°-A")).get();
  if (!course) {
    course = await db
      .insert(courses)
      .values({ name: "8°-A", grade: "8°", group: "A", academicPeriodId: period.id })
      .returning()
      .get();
  }

  const existingAssignment = await db
    .select()
    .from(courseTeachers)
    .where(eq(courseTeachers.teacherUserId, teacher.id))
    .get();
  if (!existingAssignment) {
    for (const subject of MEN_SUBJECTS) {
      await db.insert(courseTeachers).values({
        teacherUserId: teacher.id,
        courseId: course.id,
        subjectId: subject.id,
      });
    }
  }

  console.log("Sembrando actividades de demostración (Tecnología y los cinco casos)...");
  const activityIdByKey = new Map<string, string>();
  for (const demo of DEMO_ACTIVITIES) {
    let activity = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.teacherUserId, teacher.id),
          eq(activities.courseId, course.id),
          eq(activities.topic, demo.topic)
        )
      )
      .get();
    if (!activity) {
      activity = await db
        .insert(activities)
        .values({
          teacherUserId: teacher.id,
          courseId: course.id,
          subjectId: demo.subjectId,
          topic: demo.topic,
          objective: demo.objective,
          instructions: demo.instructions,
          resources: demo.resources,
          representationNotes: demo.representation,
          expressionNotes: demo.expression,
          engagementNotes: demo.engagement,
          evidenceRequested: demo.evidence,
          scheduledDate: demo.date,
        })
        .returning()
        .get();
    }
    activityIdByKey.set(demo.key, activity.id);
  }

  console.log(`Sembrando ${DEMO_STUDENT_CODES.length} estudiantes simulados (solo código)...`);
  let demoGuardianChildId: string | undefined;
  const studentIdByMock = new Map<string, string>();
  for (const code of DEMO_STUDENT_CODES) {
    const studentUser = await upsertUser({
      username: code.toLowerCase(),
      password: "estudiante123",
      fullName: `Estudiante ${code}`,
      role: "estudiante",
    });

    studentIdByMock.set(code, studentUser.id);
    if (code === DEMO_GUARDIAN_CHILD) {
      demoGuardianChildId = studentUser.id;
    }

    const existingEnrollment = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.studentUserId, studentUser.id))
      .get();
    if (!existingEnrollment) {
      await db.insert(enrollments).values({
        studentUserId: studentUser.id,
        courseId: course.id,
        academicPeriodId: period.id,
      });
    }

    const piar = DEMO_PIAR[code];
    if (!piar) continue;

    const existingProfile = await db
      .select()
      .from(pedagogicalProfiles)
      .where(eq(pedagogicalProfiles.studentUserId, studentUser.id))
      .get();
    if (existingProfile) continue; // ya sembrado en una corrida anterior

    const profile = await db
      .insert(pedagogicalProfiles)
      .values({ studentUserId: studentUser.id, learningStyle: piar.learningStyle })
      .returning()
      .get();

    for (const strength of piar.strengths) {
      await db.insert(pedagogicalStrengths).values({
        profileId: profile.id,
        description: strength,
        createdBy: teacher.id,
      });
    }
    for (const barrier of piar.barriers) {
      await db.insert(pedagogicalBarriers).values({
        profileId: profile.id,
        description: barrier,
        createdBy: teacher.id,
      });
    }
    for (const [categoryName, how] of piar.supports) {
      await db.insert(effectiveSupports).values({
        profileId: profile.id,
        supportCategoryId: supportCategoryIdByName.get(categoryName),
        description: how,
        createdBy: teacher.id,
      });
    }

    await db.insert(clinicalInfo).values({
      studentUserId: studentUser.id,
      diagnosis: piar.impresion,
      responsibleProfessional: piar.professional,
      lastReviewDate: "2026-09-04",
      notes: piar.notes,
    });
  }

  console.log("Sembrando acudiente de demostración...");
  const guardian = await upsertUser({
    username: "padre.demo",
    password: "padre123",
    fullName: "Acudiente de Demostración",
    role: "padre",
    mustChangePassword: false,
  });
  if (demoGuardianChildId) {
    const existingLink = await db
      .select()
      .from(guardianStudents)
      .where(
        and(
          eq(guardianStudents.guardianUserId, guardian.id),
          eq(guardianStudents.studentUserId, demoGuardianChildId)
        )
      )
      .get();
    if (!existingLink) {
      await db.insert(guardianStudents).values({
        guardianUserId: guardian.id,
        studentUserId: demoGuardianChildId,
        relationship: "Madre",
        authorizedForDiagnosis: false,
      });
    }
  }

  console.log("Sembrando orientador de demostración...");
  const orientador = await upsertUser({
    username: "orientador.demo",
    password: "orientador123",
    fullName: "Equipo de Apoyo Pedagógico",
    role: "orientador",
    mustChangePassword: false,
  });

  // -------------------------------------------------------------------------
  // Bitácora, preferencias y documentos de demostración. Todo ficticio, sin
  // diagnósticos ni nombres: solo códigos de estudiante. Solo se siembra si las
  // tablas están vacías, para no duplicar en corridas repetidas.
  // -------------------------------------------------------------------------
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const existingLog = await db.select({ id: classLogEntries.id }).from(classLogEntries).get();
  if (!existingLog) {
    console.log("Sembrando bitácora de demostración...");
    type LogInsert = typeof classLogEntries.$inferInsert;
    type LogSeed = {
      by: "docente" | "padre" | "estudiante";
      student: string;
      act?: string;
      kind: LogInsert["kind"];
      modality?: LogInsert["modality"];
      outcome?: LogInsert["outcome"];
      body: string;
      shared?: boolean;
      viaNiky?: boolean;
      days: number;
    };
    const logSeeds: LogSeed[] = [
      { by: "docente", student: "8A-04", act: "tecnologia", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "Con el diagrama de flujo antes del código terminó el cuadrado con Turtle.", viaNiky: true, days: 6 },
      { by: "docente", student: "8A-04", act: "tecnologia", kind: "lo_que_funciono", modality: "en_pareja", outcome: "funciono", body: "En pareja, con roles que rotan, corrigió el error y explicó qué pasó.", days: 5 },
      { by: "docente", student: "8A-04", act: "tecnologia", kind: "novedad", body: "Se detuvo ante el primer error; la pareja le recordó «error, pista, nuevo intento» y siguió.", days: 5 },
      { by: "docente", student: "8A-03", act: "ingles", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "Con una tarjeta de imágenes por cada paso terminó «Mi rutina del día» sin pedir ayuda.", shared: true, viaNiky: true, days: 4 },
      { by: "docente", student: "8A-03", act: "ingles", kind: "lo_que_funciono", modality: "digital", outcome: "funciono", body: "Entregó la rutina grabada y se mostró tranquilo.", shared: true, days: 3 },
      { by: "docente", student: "8A-03", act: "ingles", kind: "lo_que_funciono", modality: "auditiva", outcome: "funciono_parcialmente", body: "Escuchar el vocabulario sin la tarjeta le sirvió a medias.", days: 3 },
      { by: "docente", student: "8A-07", act: "matematicas", kind: "novedad", body: "Pidió el glosario dos veces durante la clase de razón y proporción.", days: 2 },
      { by: "docente", student: "8A-07", act: "matematicas", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "La tabla de datos le ayudó a ubicar la razón antes de resolver.", days: 2 },
      { by: "docente", student: "8A-02", act: "ciencias", kind: "lo_que_funciono", modality: "kinestesica", outcome: "funciono", body: "Con la pausa activa a mitad de clase volvió a la cadena alimentaria.", days: 1 },
      { by: "docente", student: "8A-02", act: "ciencias", kind: "lo_que_funciono", modality: "kinestesica", outcome: "funciono", body: "Armar la cadena con tarjetas le ayudó a entender quién come a quién.", viaNiky: true, days: 1 },
      { by: "docente", student: "8A-02", kind: "observacion", body: "Revisar la próxima semana cómo se organiza al trabajar en pareja.", days: 1 },
      { by: "docente", student: "8A-08", act: "sociales", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "La línea con imágenes le ayudó a ubicar los hechos en orden; faltó probar una sola tarea a la vez.", shared: true, days: 1 },
      { by: "padre", student: "8A-03", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "En casa, la lista con dibujos le ayudó a organizar su tarde.", days: 2 },
      { by: "estudiante", student: "8A-03", kind: "lo_que_funciono", modality: "visual", outcome: "funciono", body: "Con las imágenes entendí mejor los pasos.", days: 1 },
    ];
    for (const seed of logSeeds) {
      const studentUserId = studentIdByMock.get(seed.student);
      if (!studentUserId) continue;
      const authorId =
        seed.by === "docente" ? teacher.id : seed.by === "padre" ? guardian.id : studentUserId;
      await db.insert(classLogEntries).values({
        authorUserId: authorId,
        authorRole: seed.by,
        courseId: course.id,
        activityId: seed.by === "docente" && seed.act ? (activityIdByKey.get(seed.act) ?? null) : null,
        studentUserId,
        kind: seed.kind,
        modality: seed.modality ?? null,
        outcome: seed.outcome ?? null,
        body: seed.body,
        source: seed.viaNiky ? "niky" : "manual",
        sharedWithGuardian: seed.shared ?? false,
        createdAt: daysAgo(seed.days),
      });
    }
  }

  const existingPreference = await db
    .select({ id: studentLearningPreferences.id })
    .from(studentLearningPreferences)
    .get();
  if (!existingPreference) {
    console.log("Sembrando «mi forma de aprender» de demostración...");
    type PreferenceOption = (typeof studentLearningPreferences.$inferInsert)["option"];
    const preferences: Array<[string, PreferenceOption[]]> = [
      ["8A-03", ["imagenes", "instrucciones_paso_a_paso"]],
      ["8A-02", ["explicaciones_profesor", "practicar_directamente"]],
      ["8A-04", ["imagenes", "trabajar_con_companero"]],
    ];
    for (const [key, options] of preferences) {
      const studentUserId = studentIdByMock.get(key);
      if (!studentUserId) continue;
      for (const option of options) {
        await db.insert(studentLearningPreferences).values({ studentUserId, option, selected: true });
      }
    }
  }

  const existingProgress = await db.select({ id: activityProgress.id }).from(activityProgress).get();
  if (!existingProgress) {
    console.log("Sembrando progreso y notas de demostración...");
    // Evidencia que vendría de Wisfox (quizes y rutas). Es de ejemplo: respalda el
    // avance pero la nota la pone el docente.
    const quiz = (n: number) => ["Quiz de Wisfox", `${n} de 5`] as const;
    const progressSeeds: Array<{ act: string; student: string; status: "en_curso" | "entregada" | "calificada"; score?: number; fb?: string; ev?: readonly [string, string] }> = [
      { act: "tecnologia", student: "8A-04", status: "calificada", score: 4.2, fb: "Tu cuadrado con ciclo funciona. Sigue con la figura propia.", ev: quiz(4) },
      { act: "tecnologia", student: "8A-03", status: "calificada", score: 4.5, fb: "Muy buen orden en el diagrama de flujo." },
      { act: "tecnologia", student: "8A-02", status: "entregada", ev: quiz(3) },
      { act: "tecnologia", student: "8A-01", status: "calificada", score: 3.8, fb: "Falta explicar qué cambiaste." },
      { act: "tecnologia", student: "8A-05", status: "en_curso" },
      { act: "ingles", student: "8A-03", status: "calificada", score: 4.3, fb: "Tu rutina grabada se entiende muy bien.", ev: quiz(5) },
      { act: "ingles", student: "8A-05", status: "entregada" },
      { act: "matematicas", student: "8A-07", status: "calificada", score: 4.0, fb: "Usaste bien el glosario para escalar la receta.", ev: quiz(4) },
      { act: "matematicas", student: "8A-03", status: "en_curso" },
      { act: "ciencias", student: "8A-02", status: "calificada", score: 4.6, fb: "Tu cadena alimentaria quedó completa.", ev: quiz(5) },
      { act: "lengua", student: "8A-05", status: "entregada" },
      { act: "sociales", student: "8A-08", status: "en_curso", ev: quiz(3) },
    ];
    for (const seed of progressSeeds) {
      const activityId = activityIdByKey.get(seed.act);
      const studentUserId = studentIdByMock.get(seed.student);
      if (!activityId || !studentUserId) continue;
      await db.insert(activityProgress).values({
        activityId,
        studentUserId,
        status: seed.status,
        evidenceSource: seed.ev?.[0] ?? null,
        evidenceDetail: seed.ev?.[1] ?? null,
        score: seed.score ?? null,
        feedback: seed.fb ?? null,
        gradedBy: seed.score ? teacher.id : null,
        gradedAt: seed.score ? new Date().toISOString() : null,
      });
    }
  }

  const existingFollow = await db.select({ id: followUpNotes.id }).from(followUpNotes).get();
  if (!existingFollow) {
    console.log("Sembrando seguimiento y recomendaciones de demostración...");
    type FollowInsert = typeof followUpNotes.$inferInsert;
    const followSeeds: Array<{ student: string; by: "orientador" | "docente"; kind: FollowInsert["kind"]; body: string; shared?: boolean; review?: string; days: number }> = [
      { student: "8A-03", by: "orientador", kind: "recomendacion", body: "Anticipar los cambios de actividad con una señal visual y dividir las instrucciones en pasos cortos. Ofrecer siempre la entrega grabada en las actividades orales.", shared: true, review: "2026-11-27", days: 12 },
      { student: "8A-03", by: "orientador", kind: "acuerdo", body: "Con la familia se acordó practicar en casa una lista con dibujos para organizar la tarde y avisar al colegio si hay cambios de ánimo antes de una exposición.", shared: true, days: 9 },
      { student: "8A-03", by: "docente", kind: "seguimiento", body: "Periodo 3: entregó sus actividades orales grabadas y completó la rutina de cinco pasos sin ayuda. Se mantienen los apoyos.", shared: true, days: 4 },
      { student: "8A-04", by: "orientador", kind: "recomendacion", body: "Normalizar el error como parte del proceso («error, pista, nuevo intento») y dar primero resultados visibles y rápidos antes de pasar a lo abstracto. Mantener la programación en pareja con roles claros.", shared: true, review: "2026-11-27", days: 10 },
      { student: "8A-04", by: "docente", kind: "seguimiento", body: "Tecnología, periodo 3: con el diagrama antes del código terminó el cuadrado con Turtle; corrigió un error con su pareja y explicó qué pasó. Va a por la figura propia.", shared: true, days: 3 },
      { student: "8A-02", by: "orientador", kind: "recomendacion", body: "Programar las pausas activas (cada 25 minutos) en lugar de esperar a que se agote, dar las instrucciones por dos canales y asignarle roles activos en el trabajo de grupo.", shared: true, review: "2026-11-27", days: 11 },
      { student: "8A-02", by: "docente", kind: "seguimiento", body: "En Ciencias naturales armó la cadena alimentaria con tarjetas y mantuvo la atención con una sola pausa. Seguimos con el mismo apoyo.", days: 2 },
      { student: "8A-07", by: "orientador", kind: "recomendacion", body: "Presentar el vocabulario nuevo con imagen y ejemplo antes de la actividad, y verificar que entiende el enunciado antes de pedir la solución.", shared: true, review: "2026-11-27", days: 10 },
      { student: "8A-05", by: "orientador", kind: "recomendacion", body: "Ofrecer formatos de entrega alternativos desde el diseño de la actividad y reconocer por escrito sus avances; evitar la lectura pública forzada.", shared: true, review: "2026-11-27", days: 9 },
      { student: "8A-08", by: "orientador", kind: "acuerdo", body: "El docente propone entregar una tarea a la vez en Ciencias sociales; orientación lo revisa y responde antes del próximo periodo.", days: 1 },
    ];
    for (const seed of followSeeds) {
      const studentUserId = studentIdByMock.get(seed.student);
      if (!studentUserId) continue;
      await db.insert(followUpNotes).values({
        studentUserId,
        authorUserId: seed.by === "docente" ? teacher.id : orientador.id,
        authorRole: seed.by,
        kind: seed.kind,
        body: seed.body,
        sharedWithGuardian: seed.shared ?? false,
        reviewDate: seed.review ?? null,
        createdAt: daysAgo(seed.days),
      });
    }
  }

  const existingDocument = await db.select({ id: institutionDocuments.id }).from(institutionDocuments).get();
  if (!existingDocument) {
    console.log("Sembrando documentos de demostración (sin archivo)...");
    const PDF = "application/pdf";
    const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const techActivityCourse = true;
    const docSeeds: Array<{
      docType: string;
      title: string;
      by: string;
      student?: string;
      forCourse?: boolean;
      fileName: string;
      sizeBytes: number;
      mimeType: string;
      days: number;
    }> = [
      { docType: "listado-estudiantes", title: "Listado oficial de estudiantes por curso y periodo", by: adminUser.id, fileName: "01_Listado_estudiantes_8A_2026.xlsx", sizeBytes: 6_000, mimeType: XLSX, days: 40 },
      { docType: "asignacion-academica", title: "Asignación académica (docente, curso y área)", by: adminUser.id, fileName: "02_Asignacion_academica_2026.xlsx", sizeBytes: 6_000, mimeType: XLSX, days: 39 },
      { docType: "calendario-periodos", title: "Calendario escolar y periodos académicos", by: adminUser.id, fileName: "03_Calendario_escolar_y_periodos_2026.pdf", sizeBytes: 2_700, mimeType: PDF, days: 38 },
      { docType: "malla-curricular", title: "Malla curricular por área y grado", by: teacher.id, forCourse: techActivityCourse, fileName: "MALLA_TECNOLOGIA_1_a_11_2026.xlsx", sizeBytes: 1_361_535, mimeType: XLSX, days: 30 },
      { docType: "plan-aula-dua", title: "Plan de aula con DUA", by: teacher.id, forCourse: techActivityCourse, fileName: "02_Plan_de_aula_DUA_Tecnologia_8A_Python_Turtle.pdf", sizeBytes: 5_800, mimeType: PDF, days: 12 },
      { docType: "piar", title: "PIAR del estudiante", by: orientador.id, student: "8A-03", fileName: "01_PIAR_8A-03.pdf", sizeBytes: 4_300, mimeType: PDF, days: 9 },
      { docType: "piar", title: "PIAR del estudiante", by: orientador.id, student: "8A-07", fileName: "02_PIAR_8A-07.pdf", sizeBytes: 4_100, mimeType: PDF, days: 9 },
      { docType: "piar", title: "PIAR del estudiante", by: orientador.id, student: "8A-02", fileName: "03_PIAR_8A-02.pdf", sizeBytes: 4_200, mimeType: PDF, days: 8 },
      { docType: "piar", title: "PIAR del estudiante", by: orientador.id, student: "8A-04", fileName: "06_PIAR_8A-04.pdf", sizeBytes: 4_400, mimeType: PDF, days: 8 },
      { docType: "acta-familia", title: "Acta de socialización del PIAR con la familia", by: orientador.id, student: "8A-03", fileName: "07_Acta_socializacion_PIAR_8A-03.pdf", sizeBytes: 2_800, mimeType: PDF, days: 6 },
      { docType: "autorizacion-datos-menores", title: "Autorización de tratamiento de datos de menores", by: guardian.id, student: "8A-03", fileName: "02_Autorizacion_datos_8A-03_firmada.pdf", sizeBytes: 2_500, mimeType: PDF, days: 5 },
      { docType: "soporte-clinico", title: "Soporte clínico o informe de un profesional externo", by: orientador.id, student: "8A-03", fileName: "01_Soporte_clinico_8A-03.pdf", sizeBytes: 2_700, mimeType: PDF, days: 5 },
    ];
    for (const doc of docSeeds) {
      await db.insert(institutionDocuments).values({
        docType: doc.docType,
        courseId: doc.forCourse ? course.id : null,
        studentUserId: doc.student ? (studentIdByMock.get(doc.student) ?? null) : null,
        title: doc.title,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        storagePath: null, // documento de ejemplo: no hay archivo detrás
        uploadedBy: doc.by,
        createdAt: daysAgo(doc.days),
      });
    }
  }

  console.log("\nListo. Credenciales de demostración:");
  console.log("  Administrador -> usuario: admin           contraseña: admin123");
  console.log("  Docente       -> usuario: docente         contraseña: docente123");
  console.log("  Estudiantes   -> usuario: 8a-01 a 8a-10  contraseña: estudiante123");
  console.log("  Acudiente     -> usuario: padre.demo      contraseña: padre123 (vinculado al estudiante 8A-03)");
  console.log("  Orientador/a  -> usuario: orientador.demo contraseña: orientador123 (acceso institucional completo)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al sembrar la base de datos:", error);
    process.exit(1);
  });
