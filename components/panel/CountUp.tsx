"use client";

import { useEffect, useState } from "react";

// Las cifras de los paneles suben desde cero al aparecer, como los `data-n`
// de la referencia final de diseño. El servidor ya pinta el valor final (sin
// JavaScript se lee igual) y la animación respeta prefers-reduced-motion.
// Solo anima valores que empiezan por un número: "25%", "2/9", 10; "—" queda
// tal cual.
export function CountUp({ value }: { value: string | number }) {
  const text = String(value);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    const match = /^(\d+)(.*)$/.exec(text);
    const target = match ? Number(match[1]) : 0;
    if (!match || target === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const suffix = match[2];
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setShown(`${Math.round(target * (1 - (1 - progress) ** 3))}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [text]);

  return <>{shown}</>;
}
