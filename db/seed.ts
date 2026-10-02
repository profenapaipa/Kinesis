// Script de semilla — idempotente (se puede correr varias veces sin
// duplicar datos). Uso: npm run db:seed
//
// Migra lib/mockData.ts (10 estudiantes ficticios del curso 8°-A, 3 con
// PIAR) a usuarios/matrículas/perfil-pedagógico/información-clínica reales,
// y siembra un administrador y un docente de demostración.

import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
  academicPeriods,
  activities,
  clinicalInfo,
  courses,
  courseTeachers,
  effectiveSupports,
  enrollments,
  guardianStudents,
  pedagogicalBarriers,
  pedagogicalProfiles,
  pedagogicalStrengths,
  subjects,
  supportCategories,
  users,
} from "./schema";
import { hashPassword } from "../lib/auth/password";
import { mockStudents } from "../lib/mockData";
import { MEN_SUBJECTS } from "../lib/subjects";
import type { AdjustmentType, Role } from "../types";

// Barreras observadas de demostración — el modelo anterior no separaba
// "barrera" de "estrategia", así que para los 3 estudiantes con PIAR se
// redactan aquí barreras plausibles y coherentes con su diagnóstico previo,
// dejando claro que son datos ficticios para la semilla, igual que el resto.
const DEMO_BARRIERS: Record<string, string[]> = {
  "std-001": [
    "Dificultad para mantener la atención durante instrucciones extensas",
    "Se distrae con facilidad ante estímulos del entorno",
  ],
  "std-002": [
    "Dificultad para permanecer quieto durante actividades largas",
    "Dificultad para organizar tareas con varios pasos",
  ],
  "std-003": [
    "Dificultad para comprender instrucciones abstractas o de varios pasos",
    "Necesita más tiempo para procesar información nueva",
  ],
};

const SUPPORT_CATEGORY_SEED: Array<{
  name: AdjustmentType;
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

function slugifyUsername(fullName: string): string {
  return fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(".");
}

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
  for (const category of SUPPORT_CATEGORY_SEED) {
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
  await upsertUser({
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

  console.log("Sembrando actividades de demostración...");
  const DEMO_ACTIVITIES: Array<{
    subjectId: (typeof MEN_SUBJECTS)[number]["id"];
    topic: string;
    objective: string;
    instructions: string;
    resources: string[];
    evidenceRequested: string;
    scheduledDate: string;
  }> = [
    {
      subjectId: "matematicas",
      topic: "Sistemas de ecuaciones lineales 2x2",
      objective:
        "Resolver sistemas de ecuaciones lineales con dos incógnitas mediante los métodos de sustitución y reducción, aplicándolos a problemas cotidianos.",
      instructions:
        "Repaso de ecuaciones de primer grado con una incógnita\nResolver sistemas 2x2 por el método de sustitución\nResolver sistemas 2x2 por el método de reducción\nAplicar lo aprendido a dos problemas de la vida real",
      resources: ["Guía de ejercicios", "Calculadora científica", "Tablero cuadriculado"],
      evidenceRequested: "Taller resuelto en parejas + 3 problemas individuales",
      scheduledDate: "2026-08-10",
    },
    {
      subjectId: "ciencias-naturales",
      topic: "Genética y herencia mendeliana",
      objective:
        "Comprender los principios básicos de la herencia genética mediante el análisis de cruces monohíbridos y la interpretación de cuadros de Punnett.",
      instructions:
        "Exposición sobre genotipo, fenotipo, alelos dominantes y recesivos\nTaller de cuadros de Punnett en parejas\nLectura de un artículo corto sobre enfermedades hereditarias\nSocialización de resultados y retroalimentación grupal",
      resources: ["Presentación en diapositivas", "Guía impresa de cuadros de Punnett", "Artículo de lectura"],
      evidenceRequested: "Quiz corto individual + guía de trabajo en parejas",
      scheduledDate: "2026-08-11",
    },
  ];
  for (const demo of DEMO_ACTIVITIES) {
    const existingActivity = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.teacherUserId, teacher.id),
          eq(activities.courseId, course.id),
          eq(activities.subjectId, demo.subjectId)
        )
      )
      .get();
    if (!existingActivity) {
      await db.insert(activities).values({
        teacherUserId: teacher.id,
        courseId: course.id,
        subjectId: demo.subjectId,
        topic: demo.topic,
        objective: demo.objective,
        instructions: demo.instructions,
        resources: demo.resources,
        evidenceRequested: demo.evidenceRequested,
        scheduledDate: demo.scheduledDate,
      });
    }
  }

  console.log(`Sembrando ${mockStudents.length} estudiantes de lib/mockData.ts...`);
  let demoGuardianChildId: string | undefined;
  for (const student of mockStudents) {
    const username = slugifyUsername(student.fullName);
    const studentUser = await upsertUser({
      username,
      password: "estudiante123",
      fullName: student.fullName,
      role: "estudiante",
    });

    if (student.id === "std-001") {
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

    if (!student.hasPiar || !student.piarProfile) continue;

    const existingProfile = await db
      .select()
      .from(pedagogicalProfiles)
      .where(eq(pedagogicalProfiles.studentUserId, studentUser.id))
      .get();
    if (existingProfile) continue; // ya sembrado en una corrida anterior

    const profile = await db
      .insert(pedagogicalProfiles)
      .values({
        studentUserId: studentUser.id,
        learningStyle: student.piarProfile.learningStyle,
      })
      .returning()
      .get();

    for (const strength of student.piarProfile.strengths) {
      await db.insert(pedagogicalStrengths).values({
        profileId: profile.id,
        description: strength,
        createdBy: teacher.id,
      });
    }

    for (const barrier of DEMO_BARRIERS[student.id] ?? []) {
      await db.insert(pedagogicalBarriers).values({
        profileId: profile.id,
        description: barrier,
        createdBy: teacher.id,
      });
    }

    for (const adjustment of student.piarProfile.adjustmentTypes) {
      await db.insert(effectiveSupports).values({
        profileId: profile.id,
        supportCategoryId: supportCategoryIdByName.get(adjustment),
        description: `Ha funcionado en actividades previas (migrado del PIAR anterior).`,
        createdBy: teacher.id,
      });
    }

    await db.insert(clinicalInfo).values({
      studentUserId: studentUser.id,
      diagnosis: student.piarProfile.diagnosis,
      responsibleProfessional: student.piarProfile.responsibleProfessional,
      lastReviewDate: student.piarProfile.lastReview,
      notes: student.piarProfile.supportNeeds.join("; "),
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
  await upsertUser({
    username: "orientador.demo",
    password: "orientador123",
    fullName: "Equipo de Apoyo Pedagógico",
    role: "orientador",
    mustChangePassword: false,
  });

  console.log("\nListo. Credenciales de demostración:");
  console.log("  Administrador -> usuario: admin           contraseña: admin123");
  console.log("  Docente       -> usuario: docente         contraseña: docente123");
  console.log("  Estudiantes   -> usuario: <nombre.apellido>  contraseña: estudiante123");
  console.log("  Acudiente     -> usuario: padre.demo      contraseña: padre123 (vinculado a Valentina Rodríguez Gómez)");
  console.log("  Orientador/a  -> usuario: orientador.demo contraseña: orientador123 (acceso institucional completo)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al sembrar la base de datos:", error);
    process.exit(1);
  });
