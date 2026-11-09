"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Download, Lock, Upload } from "lucide-react";
import { ProgressBar } from "@/components/panel/Panel";
import { Button } from "@/components/ui/button";
import { SCOPE_LABEL, type DocumentType } from "@/lib/documents/catalog";

// Lista de verificación de documentos + carga. Recibe del servidor lo que este
// rol puede ver y subir (lib/data/documents.ts ya lo recortó); aquí solo se
// pinta y se sube. En la demostración estática no hay dónde guardar el
// archivo: se marca como cargado SOLO en esta pantalla, y se dice.

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export interface ChecklistItemView {
  type: Pick<
    DocumentType,
    "id" | "title" | "why" | "scope" | "priority" | "norm" | "sensitive" | "startOrder"
  >;
  targets: Array<{ id: string; label: string }>;
  doneTargetIds: string[];
  uploadTargets: Array<{ id: string; label: string }>;
  documents: Array<{
    id: string;
    fileName: string;
    sizeBytes: number;
    createdAt: string;
    targetLabel: string;
    uploadedByName: string | null;
    notes: string | null;
    hasFile: boolean;
  }>;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" })
    .format(new Date(iso))
    .replace(".", "");
}

export function DocumentChecklist({ items }: { items: ChecklistItemView[] }) {
  const router = useRouter();
  // Solo demostración: lo que se "cargó" en esta sesión.
  const [localDone, setLocalDone] = useState<Record<string, string[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [targetId, setTargetId] = useState("");

  const view = useMemo(
    () =>
      items.map((item) => {
        const done = new Set([...item.doneTargetIds, ...(localDone[item.type.id] ?? [])]);
        const need = item.targets.length || 1;
        const have = item.targets.length
          ? item.targets.filter((target) => done.has(target.id)).length
          : Math.min(done.size, 1);
        return { item, done, need, have, complete: have >= need };
      }),
    [items, localDone]
  );

  const required = view.filter((entry) => entry.item.type.priority === "imprescindible");
  const requiredNeed = required.reduce((sum, entry) => sum + entry.need, 0);
  const requiredHave = required.reduce((sum, entry) => sum + Math.min(entry.have, entry.need), 0);
  const percent = requiredNeed ? (requiredHave / requiredNeed) * 100 : 100;

  async function handleUpload(event: FormEvent<HTMLFormElement>, item: ChecklistItemView) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const file = fileRef.current?.files?.[0];
    const target = targetId || item.uploadTargets[0]?.id;
    if (!file || !target) {
      setError("Elige el archivo y a qué corresponde.");
      return;
    }
    setBusy(true);
    try {
      if (IS_DEMO) {
        setLocalDone((current) => ({
          ...current,
          [item.type.id]: [...(current[item.type.id] ?? []), target],
        }));
        setMessage(`«${file.name}» quedó marcado en esta pantalla. En la demostración el archivo no se guarda.`);
      } else {
        const form = new FormData();
        form.set("file", file);
        form.set("docType", item.type.id);
        form.set("targetId", target);
        const response = await fetch("/api/documentos", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "No se pudo cargar el documento.");
          return;
        }
        setMessage("Documento cargado.");
        router.refresh();
      }
      if (fileRef.current) fileRef.current.value = "";
      setOpenId(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">Lo imprescindible para empezar a operar</p>
          <p className="text-sm font-black text-primary tabular-nums">
            {requiredHave} de {requiredNeed}
          </p>
        </div>
        <ProgressBar value={percent} label="Avance de los documentos imprescindibles" />
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-primary/10 px-3 py-2 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {view.map(({ item, done, need, have, complete }) => {
          const canUpload = item.uploadTargets.length > 0;
          const open = openId === item.type.id;
          const missing = item.targets.filter((target) => !done.has(target.id));
          return (
            <li key={item.type.id} className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border">
              <div className="flex items-start gap-3">
                {complete ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-label="Completo" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-label="Pendiente" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-bold">
                    {item.type.title}
                    {item.type.startOrder && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        Paso {item.type.startOrder}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.type.why}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{item.type.priority === "imprescindible" ? "Imprescindible" : "Recomendado"}</span>
                    <span>{SCOPE_LABEL[item.type.scope]}</span>
                    {item.targets.length > 1 && (
                      <span>
                        {have} de {need}
                      </span>
                    )}
                    {item.type.sensitive && (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="size-3" aria-hidden /> Acceso restringido
                      </span>
                    )}
                    {item.type.norm && <span>{item.type.norm} (por confirmar)</span>}
                  </p>
                  {missing.length > 0 && item.targets.length > 1 && item.targets.length <= 12 && (
                    <p className="text-xs">
                      <span className="font-semibold">Falta: </span>
                      {missing.map((target) => target.label).join(", ")}
                    </p>
                  )}
                  {item.documents.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-1">
                      {item.documents.map((doc) => (
                        <li key={doc.id} className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs [overflow-wrap:anywhere]">
                          {doc.hasFile ? (
                            <a
                              href={`/api/documentos/${doc.id}`}
                              className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-2 hover:underline"
                            >
                              <Download className="size-3" aria-hidden />
                              {doc.fileName}
                            </a>
                          ) : (
                            <span className="min-w-0 font-semibold [overflow-wrap:anywhere]">{doc.fileName} (archivo de ejemplo)</span>
                          )}
                          <span className="text-muted-foreground">
                            {formatSize(doc.sizeBytes)} · {doc.targetLabel}
                            {doc.uploadedByName ? ` · ${doc.uploadedByName}` : ""} · {formatDate(doc.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {canUpload && (
                  <Button
                    type="button"
                    size="sm"
                    variant={complete ? "outline" : "default"}
                    onClick={() => {
                      setOpenId(open ? null : item.type.id);
                      setTargetId(item.uploadTargets[0]?.id ?? "");
                      setError(null);
                    }}
                    aria-expanded={open}
                  >
                    <Upload className="size-4" aria-hidden />
                    {complete ? "Cargar otro" : "Cargar"}
                  </Button>
                )}
              </div>

              {open && canUpload && (
                <form
                  onSubmit={(event) => handleUpload(event, item)}
                  className="mt-3 flex flex-col gap-3 border-t border-border pt-3"
                >
                  {item.uploadTargets.length > 1 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium" htmlFor={`target-${item.type.id}`}>
                        ¿A cuál corresponde?
                      </label>
                      <select
                        id={`target-${item.type.id}`}
                        value={targetId}
                        onChange={(event) => setTargetId(event.target.value)}
                        className="h-10 rounded-xl border border-input bg-muted/60 px-3 text-base outline-none sm:text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {item.uploadTargets.map((target) => (
                          <option key={target.id} value={target.id}>
                            {target.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor={`file-${item.type.id}`}>
                      Archivo (PDF, Word, Excel, PNG o JPG; máximo 8 MB)
                    </label>
                    <input
                      id={`file-${item.type.id}`}
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      required
                      className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
                    />
                  </div>
                  {item.type.sensitive && (
                    <p className="text-xs text-muted-foreground">
                      Este documento puede traer información de salud de un menor. Solo lo verán quienes el
                      catálogo autoriza; no lo subas si no estás seguro de que corresponde.
                    </p>
                  )}
                  <div>
                    <Button type="submit" size="sm" disabled={busy}>
                      {busy ? "Cargando..." : "Cargar documento"}
                    </Button>
                  </div>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      {IS_DEMO && (
        <p className="rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
          En la demostración los archivos no se guardan: lo que «cargues» queda marcado aquí hasta que
          recargues la página. En la aplicación real se guardan fuera de la carpeta pública y se descargan
          con revisión de permisos.
        </p>
      )}
    </div>
  );
}
