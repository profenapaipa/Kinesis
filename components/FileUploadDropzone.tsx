"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type DragEvent } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  sizeKB: number;
  uploadedAt: string; // ISO
}

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function storageKey(subjectId: string) {
  return `pi-uploads-${subjectId}`;
}

function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) return `${sizeKB} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

// Sincronización con localStorage vía useSyncExternalStore (mismo patrón que
// RoleProvider): evita hidratar con setState dentro de un efecto y no genera
// desajustes entre el render del servidor y el del cliente.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function readRaw(subjectId: string): string | null {
  return window.localStorage.getItem(storageKey(subjectId));
}

function getServerSnapshot(): string | null {
  return null;
}

function writeFiles(subjectId: string, files: UploadedFile[]) {
  window.localStorage.setItem(storageKey(subjectId), JSON.stringify(files));
  emitChange();
}

export function FileUploadDropzone({ subjectId }: { subjectId: string }) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(subjectId), getServerSnapshot);
  const files = useMemo<UploadedFile[]>(() => (raw ? JSON.parse(raw) : []), [raw]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next = [...files];
    Array.from(fileList).forEach((file) => {
      const isAccepted = ACCEPTED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      if (!isAccepted) return;
      next.unshift({
        name: file.name,
        sizeKB: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: new Date().toISOString(),
      });
    });
    writeFiles(subjectId, next);
  }

  function removeFile(index: number) {
    writeFiles(
      subjectId,
      files.filter((_, i) => i !== index)
    );
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card
        className={cn(
          "border-2 border-dashed shadow-none ring-0 transition-colors",
          isDragging && "border-primary bg-primary/5"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="size-6" />
          </div>
          <div>
            <p className="font-medium">Arrastra tu planeación aquí</p>
            <p className="text-sm text-muted-foreground">
              o selecciona un archivo desde tu computador (PDF, DOCX)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Seleccionar archivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Archivos cargados en este navegador</p>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.uploadedAt}`}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="size-4 shrink-0 text-primary" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatSize(file.sizeKB)} · {formatDate(file.uploadedAt)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Eliminar ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
