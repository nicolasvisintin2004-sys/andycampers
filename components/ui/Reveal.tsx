"use client";

import { useEnter } from "./Enter";

/**
 * Título que se revela línea por línea al entrar en pantalla.
 * Las líneas se pasan explícitas para controlar el corte tipográfico.
 * Sin JS se ve el estado final; con movimiento reducido, un fundido corto.
 */
export function RevealTitle({
  lines,
  as: Tag = "h2",
  className = "",
  id,
}: {
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const { ref, state } = useEnter<HTMLHeadingElement>(0.88);

  return (
    <Tag ref={ref} id={id} className={`${className} ${state !== "hidden" ? "is-revealed" : ""}`}>
      {lines.map((l, i) => (
        <span key={i} className="reveal-line" style={{ "--i": i } as React.CSSProperties}>
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade + subida al entrar en pantalla, para bloques de contenido. */
export function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, state } = useEnter<HTMLDivElement>();
  return (
    <div ref={ref} data-enter={state} className={`enter-fade ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
