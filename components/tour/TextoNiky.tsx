import { Fragment, type ReactNode } from "react";

// Formato mínimo de las respuestas de Niky: **negritas**, listas con «- » y
// listas numeradas «1. ». Se interpreta a mano, sin dangerouslySetInnerHTML,
// porque el texto viene de datos y no debe poder meter HTML en la página.

function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) =>
    trozo.startsWith("**") && trozo.endsWith("**") ? (
      <strong key={i} className="font-bold">
        {trozo.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{trozo}</Fragment>
    )
  );
}

type Bloque =
  | { tipo: "p"; texto: string }
  | { tipo: "ul" | "ol"; items: string[] };

function bloques(texto: string): Bloque[] {
  const salida: Bloque[] = [];
  for (const linea of texto.split("\n")) {
    const l = linea.trim();
    if (!l) continue;
    const vineta = l.match(/^[-*]\s+(.*)$/);
    const numero = l.match(/^\d+\.\s+(.*)$/);
    const ultimo = salida[salida.length - 1];
    if (vineta || numero) {
      const tipo = vineta ? "ul" : "ol";
      const item = (vineta ?? numero)![1];
      if (ultimo && ultimo.tipo === tipo) ultimo.items.push(item);
      else salida.push({ tipo, items: [item] });
    } else {
      salida.push({ tipo: "p", texto: l });
    }
  }
  return salida;
}

export function TextoNiky({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm leading-relaxed [overflow-wrap:anywhere]">
      {bloques(texto).map((b, i) =>
        b.tipo === "p" ? (
          <p key={i}>{enLinea(b.texto)}</p>
        ) : b.tipo === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.items.map((it, j) => (
              <li key={j}>{enLinea(it)}</li>
            ))}
          </ul>
        ) : (
          <ol key={i} className="list-decimal space-y-1 pl-5">
            {b.items.map((it, j) => (
              <li key={j}>{enLinea(it)}</li>
            ))}
          </ol>
        )
      )}
    </div>
  );
}
