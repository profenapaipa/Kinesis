"use client";

import { useMemo, useState } from "react";
import { PartyPopper, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SYMBOLS = ["🧩", "⭐", "🎯", "🌈", "🎵", "📐"];

// Baraja determinística (mulberry32 sembrado por texto) para que el mismo
// estudiante/asignatura siempre vea el mismo tablero en servidor y cliente.
function seededShuffle<T>(items: T[], seed: string): T[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let state = hash || 1;
  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Juego de memoria genérico (no evalúa contenido curricular) pensado como
// pausa activa / actividad de repaso para estudiantes con PIAR, sin importar
// su diagnóstico.
export function MemoryPuzzle({ seed }: { seed: string }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(
    () => seededShuffle([...SYMBOLS, ...SYMBOLS], `${seed}-${round}`),
    [seed, round]
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  const isWon = matched.size === cards.length;

  function handleFlip(index: number) {
    if (flipped.length === 2) return;
    if (flipped.includes(index) || matched.has(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((value) => value + 1);
      const [a, b] = nextFlipped;
      if (cards[a] === cards[b]) {
        setMatched((prev) => new Set(prev).add(a).add(b));
        setFlipped([]);
      } else {
        window.setTimeout(() => setFlipped([]), 800);
      }
    }
  }

  function handleReset() {
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setRound((value) => value + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Intentos: {moves}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {cards.map((symbol, index) => {
          const isRevealed = flipped.includes(index) || matched.has(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleFlip(index)}
              disabled={isRevealed}
              aria-label={isRevealed ? `Carta: ${symbol}` : "Carta oculta, voltear"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border text-2xl transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                isRevealed
                  ? matched.has(index)
                    ? "border-(--palette-mint) bg-(--palette-mint)/40"
                    : "border-primary bg-primary/10"
                  : "border-border bg-muted hover:bg-muted/70"
              )}
            >
              {isRevealed ? symbol : ""}
            </button>
          );
        })}
      </div>

      {isWon && (
        <div className="flex items-center gap-2 rounded-lg bg-(--palette-mint)/40 px-3 py-2 text-sm font-medium">
          <PartyPopper className="size-4" />
          ¡Completaste el reto en {moves} intentos!
        </div>
      )}
    </div>
  );
}
