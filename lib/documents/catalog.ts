import type { Role } from "@/types";

// Catálogo de documentos que una institución debería cargar en Kinesis.
//
// Es un catálogo en código (no una tabla) porque cambia con el producto, no
// con cada colegio: lo que cada colegio "tiene" son las filas de
// `institution_documents`; lo que "debería tener" sale de aquí. La lista de
// verificación cruza las dos cosas.
//
// Origen: auditoría de Kinesis del 8 de noviembre de 2026 y
// docs/PRODUCTO_Y_SOSTENIBILIDAD.md (sección 5). Las normas son solo las que
// ya cita el repositorio y están POR CONFIRMAR en la fuente oficial: no se
// agregan números de artículo propios.

export type DocScope = "colegio" | "curso" | "estudiante";

export type DocPriority = "imprescindible" | "recomendado";

export interface DocumentType {
  /** Identificador estable; se guarda en `institution_documents.doc_type`. */
  id: string;
  title: string;
  /** Una frase, en segunda persona del rol que lo sube. */
  why: string;
  scope: DocScope;
  priority: DocPriority;
  /** Quién puede cargarlo. */
  uploaders: Role[];
  /** Quién puede verlo y descargarlo. Siempre incluye a quien lo carga. */
  viewers: Role[];
  /** true: contiene datos clínicos; solo orientador y docente asignado. */
  sensitive?: boolean;
  /** Norma de referencia, por confirmar en la fuente oficial. */
  norm?: string;
  /** Posición en el orden sugerido para empezar a operar (1 = primero). */
  startOrder?: number;
}

const ALL: Role[] = ["administrador", "docente", "orientador", "padre", "estudiante"];

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "listado-estudiantes",
    title: "Listado oficial de estudiantes por curso y periodo",
    why: "Es la base de las matrículas y de quién ve a quién.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ["administrador"],
    startOrder: 1,
  },
  {
    id: "asignacion-academica",
    title: "Asignación académica (docente, curso y área)",
    why: "Sin ella el docente no ve a sus estudiantes ni puede planear.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ["administrador", "docente", "orientador"],
    startOrder: 2,
  },
  {
    id: "calendario-periodos",
    title: "Calendario escolar y periodos académicos",
    why: "Define el periodo activo y la fecha de cada revisión del PIAR.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ["administrador", "docente", "orientador", "padre"],
    startOrder: 3,
  },
  {
    id: "malla-curricular",
    title: "Malla curricular por área y grado",
    why: "Permite que los ajustes y las sugerencias se alineen con lo que de verdad se enseña.",
    scope: "curso",
    priority: "imprescindible",
    uploaders: ["docente", "administrador"],
    viewers: ["administrador", "docente", "orientador"],
    norm: "Ley 115 de 1994, Art. 23 (áreas obligatorias)",
    startOrder: 4,
  },
  {
    id: "politica-datos",
    title: "Política de tratamiento de datos y aviso de privacidad",
    why: "Debe estar firmada y enlazada desde la aplicación antes de usar datos reales.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ALL,
    norm: "Decreto 1074 de 2015",
    startOrder: 5,
  },
  {
    id: "autorizacion-datos-menores",
    title: "Autorización de tratamiento de datos de menores",
    why: "Los datos de salud de un menor exigen autorización explícita de su familia.",
    scope: "estudiante",
    priority: "imprescindible",
    uploaders: ["padre", "orientador"],
    viewers: ["padre", "orientador"],
    norm: "Ley 1581 de 2012, Arts. 5 y 7",
    startOrder: 6,
  },
  {
    id: "protocolo-info-clinica",
    title: "Protocolo de acceso a información clínica, con lista de personas autorizadas",
    why: "Define quién puede leer lo clínico y cómo se audita cada lectura.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ["administrador", "orientador"],
    startOrder: 7,
  },
  {
    id: "piar",
    title: "PIAR del estudiante",
    why: "Es el documento del que salen los apoyos, las barreras y las fortalezas.",
    scope: "estudiante",
    priority: "imprescindible",
    uploaders: ["orientador"],
    viewers: ["orientador", "docente"],
    sensitive: true,
    norm: "Decreto 1421 de 2017",
    startOrder: 8,
  },
  {
    id: "acta-familia",
    title: "Acta de socialización del PIAR con la familia",
    why: "El PIAR se construye con la familia y esta acta deja constancia.",
    scope: "estudiante",
    priority: "imprescindible",
    uploaders: ["orientador"],
    viewers: ["orientador", "padre"],
    norm: "Decreto 1421 de 2017",
    startOrder: 9,
  },
  {
    id: "sistema-evaluacion",
    title: "Sistema institucional de evaluación",
    why: "Los ajustes de tiempo y de formato deben coincidir con las reglas de calificación del colegio.",
    scope: "colegio",
    priority: "imprescindible",
    uploaders: ["administrador"],
    viewers: ["administrador", "docente", "orientador", "padre"],
    startOrder: 10,
  },
  {
    id: "plan-aula-dua",
    title: "Plan de aula con DUA",
    why: "Si ya lo tienes escrito, súbelo y no lo rehagas: Kinesis lo cruza con los apoyos.",
    scope: "curso",
    priority: "recomendado",
    uploaders: ["docente"],
    viewers: ["docente", "orientador"],
  },
  {
    id: "valoracion-pedagogica",
    title: "Informe de valoración pedagógica o caracterización",
    why: "Sustenta las barreras y las fortalezas con evidencia del aula.",
    scope: "estudiante",
    priority: "recomendado",
    uploaders: ["orientador", "docente"],
    viewers: ["orientador", "docente"],
    sensitive: true,
  },
  {
    id: "soporte-clinico",
    title: "Soporte clínico o informe de un profesional externo",
    why: "Respalda el diagnóstico. Nunca lo ve el administrador, la familia ni el estudiante desde Kinesis.",
    scope: "estudiante",
    priority: "recomendado",
    uploaders: ["orientador"],
    viewers: ["orientador"],
    sensitive: true,
    norm: "Ley 1581 de 2012, Art. 5 (datos sensibles)",
  },
  {
    id: "seguimiento-piar",
    title: "Informe de seguimiento o revisión del PIAR por periodo",
    why: "Registra qué funcionó y deja la fecha de la próxima revisión.",
    scope: "estudiante",
    priority: "recomendado",
    uploaders: ["orientador", "docente"],
    viewers: ["orientador", "docente"],
    sensitive: true,
    norm: "Decreto 1421 de 2017",
  },
  {
    id: "catalogo-ajustes",
    title: "Catálogo institucional de ajustes razonables y guía de accesibilidad",
    why: "Evita crear categorías de apoyo con nombres de personas o diagnósticos.",
    scope: "colegio",
    priority: "recomendado",
    uploaders: ["orientador", "administrador"],
    viewers: ["administrador", "docente", "orientador"],
    norm: "Ley 1618 de 2013",
  },
];

export const DOCUMENT_TYPE_BY_ID = new Map(DOCUMENT_TYPES.map((type) => [type.id, type]));

/** Los diez que hacen falta para empezar a operar, en el orden sugerido. */
export const REQUIRED_TO_OPERATE = DOCUMENT_TYPES.filter((type) => type.startOrder).sort(
  (a, b) => (a.startOrder ?? 0) - (b.startOrder ?? 0)
);

export const SCOPE_LABEL: Record<DocScope, string> = {
  colegio: "Todo el colegio",
  curso: "Por curso",
  estudiante: "Por estudiante",
};

// Límites de carga. 8 MB cubre un PIAR escaneado; subirlo más es mejor
// hacerlo comprimido. Solo formatos de documento, nunca ejecutables.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_UPLOAD_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};
