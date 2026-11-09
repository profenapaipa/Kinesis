import { HeartHandshake } from "lucide-react";
import { EmptyState, PanelCard, SectionTitle } from "@/components/panel/Panel";
import { MODALITY_LABEL, shortDate } from "@/lib/classLogShared";
import type { WorkedForStudent } from "@/lib/data/classLog";
import { LEARNING_PREFERENCE_LABEL } from "@/lib/studentFriendlyText";

// «Lo que ha funcionado», redactado SIN etiquetar a nadie (decisión del 2 de
// octubre de 2026): se cuenta cuántas veces se probó y cómo salió, con fecha,
// en pasado. Nunca «aprende mejor con…». Lo que el estudiante dijo que le
// gusta va en una línea aparte («dijo que le gusta…»): son dos fuentes y se
// pueden contradecir.
export function WorkedSummaryCard({
  groups,
  stated,
  names,
}: {
  groups: WorkedForStudent[];
  /** Opciones que cada estudiante marcó en «Mi forma de aprender». */
  stated: Record<string, string[]>;
  /** Nombre por id, para quien solo tiene preferencias sin registros. */
  names: Record<string, string>;
}) {
  const ids = [...new Set([...groups.map((group) => group.studentUserId), ...Object.keys(stated)])];
  const byId = new Map(groups.map((group) => [group.studentUserId, group]));

  return (
    <PanelCard>
      <SectionTitle
        title="Lo que ha funcionado"
        description="Lo que se probó en clase y cómo salió. Es evidencia con fecha, no una etiqueta de la persona."
      />
      {ids.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="Aún no hay registros"
          description="Cuando registres lo que funcionó, aquí aparece el resumen por estudiante."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {ids.map((id) => {
            const group = byId.get(id);
            const likes = stated[id] ?? [];
            return (
              <li key={id} className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border">
                <p className="font-bold">{group?.studentName ?? names[id] ?? "Estudiante"}</p>
                {group && (
                  <ul className="mt-1.5 flex flex-col gap-1 text-sm">
                    {group.items.map((item) => (
                      <li key={item.modality}>
                        <span className="font-semibold">{MODALITY_LABEL[item.modality]}:</span> funcionó en{" "}
                        {item.worked} de {item.total} {item.total === 1 ? "registro" : "registros"}
                        {item.partial > 0 ? `, a medias en ${item.partial}` : ""} (último: {shortDate(item.lastAt)})
                      </li>
                    ))}
                  </ul>
                )}
                {likes.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Dijo que le gusta:</span>{" "}
                    {likes.map((option) => LEARNING_PREFERENCE_LABEL[option] ?? option).join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        Pasar de aquí a «apoyo confirmado» lo decide una persona del equipo de apoyo, cuando se repite en
        varias actividades. Nada de esto reemplaza al PIAR.
      </p>
    </PanelCard>
  );
}
