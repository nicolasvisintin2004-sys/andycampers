"use client";

import { useEffect, useRef, useState } from "react";

export type EnterState = "ssr" | "hidden" | "shown";

/**
 * Detecta cuándo un elemento llega a la pantalla, por POSICIÓN y no por
 * IntersectionObserver: si alguien salta el scroll de golpe (ancla, tecla Fin,
 * posición restaurada) el elemento igual se muestra. Sale visible del servidor
 * ("ssr") y solo se oculta al montar si todavía está debajo de la pantalla.
 */
export function useEnter<T extends HTMLElement>(threshold = 0.9) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<EnterState>("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const visible = () => el.getBoundingClientRect().top < window.innerHeight * threshold;
    if (visible()) return setState("shown");
    setState("hidden");

    let raf = 0;
    const check = () => {
      raf = 0;
      if (!visible()) return;
      setState("shown");
      stop();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return stop;
  }, [threshold]);

  return { ref, state };
}

/**
 * Bloque que entra al hacer scroll.
 * - `fade`: fundido + subida corta (escalonado con `i`).
 * - `diag`: foto revelada con una máscara en diagonal.
 * Con movimiento reducido ambos quedan como un fundido corto (ver globals.css).
 */
export function Enter({
  children,
  kind = "fade",
  i = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  kind?: "fade" | "diag";
  i?: number;
  as?: "div" | "li" | "figure" | "article";
  className?: string;
}) {
  const { ref, state } = useEnter<HTMLDivElement>();
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-enter={state}
      className={`${kind === "diag" ? "enter-diag" : "enter-fade"} ${className}`}
      style={{ "--i": i } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
