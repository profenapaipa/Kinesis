import type { Metadata } from "next";
import { FolderCheck } from "lucide-react";
import { DocumentChecklist, type ChecklistItemView } from "@/components/documents/DocumentChecklist";
import { PanelCard, PanelHeader, SectionTitle } from "@/components/panel/Panel";
import { requireRole } from "@/lib/auth/session";
import { getDocumentsOverview } from "@/lib/data/documents";

export const metadata: Metadata = { title: "Documentos" };

// Documentos institucionales y lista de verificación. Para cada rol aparece
// solo lo que le toca subir o puede ver (lib/data/documents.ts lo recorta); el
// administrador, por ejemplo, ve la lista del colegio pero nunca el PIAR de un
// estudiante.

const COPY = {
  administrador: {
    description:
      "Lo que el colegio debe tener cargado para que Kinesis personalice el aprendizaje sin poner en riesgo datos de menores.",
  },
  docente: {
    description:
      "Sube la malla de tu área y tu plan de aula con DUA. Kinesis los cruza con los apoyos de cada estudiante.",
  },
  orientador: {
    description:
      "Aquí van el PIAR, el acta con la familia y los soportes. Los documentos clínicos tienen acceso restringido.",
  },
  padre: {
    description: "Los documentos de tu hija o hijo que necesitas leer o firmar, como la autorización de datos.",
  },
} as const;

export default async function DocumentosPage() {
  const session = await requireRole("administrador", "docente", "orientador", "padre");
  const overview = await getDocumentsOverview(session);

  // Solo lo que el componente necesita: no se envía al navegador el resto del
  // catálogo (quién puede ver cada cosa) ni rutas internas de archivo.
  const items: ChecklistItemView[] = overview.items.map((item) => ({
    type: {
      id: item.type.id,
      title: item.type.title,
      why: item.type.why,
      scope: item.type.scope,
      priority: item.type.priority,
      norm: item.type.norm,
      sensitive: item.type.sensitive,
      startOrder: item.type.startOrder,
    },
    targets: item.targets,
    doneTargetIds: item.doneTargetIds,
    uploadTargets: item.uploadTargets,
    documents: item.documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      sizeBytes: doc.sizeBytes,
      createdAt: doc.createdAt,
      targetLabel: doc.targetLabel,
      uploadedByName: doc.uploadedByName,
      notes: doc.notes,
      hasFile: doc.hasFile,
    })),
  }));

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader
        eyebrow="Lista de verificación"
        title="Documentos"
        description={COPY[session.role as keyof typeof COPY].description}
        icon={<FolderCheck className="size-6" aria-hidden />}
      />
      <PanelCard>
        <SectionTitle
          title="Qué cargar y en qué orden"
          description="Los pasos 1 a 10 son lo imprescindible para empezar a operar. Las normas citadas están por confirmar en la fuente oficial."
        />
        <DocumentChecklist items={items} />
      </PanelCard>
    </div>
  );
}
