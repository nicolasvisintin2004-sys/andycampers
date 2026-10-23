"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";

/** Una sola vez por carga de página (al volver a la home navegando, no se repite). */
let jugado = false;

/** Lo pone en <html> el script del <head> (app/layout.tsx) antes de pintar. */
export const INTRO_SCRIPT = `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("con-intro")}catch(e){}`;

/**
 * Entrada del logo: aparece grande en el centro sobre un telón y, al correrse
 * el telón, viaja achicándose hasta su lugar en la barra fija de arriba.
 * Sin JS se funde solo (CSS en globals.css → "Entrada del logo").
 */
export function LogoIntro() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [fin, setFin] = useState(jugado);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    const terminar = () => {
      jugado = true;
      root.classList.add("intro-listo");
      setFin(true);
    };
    if (!el || !root.classList.contains("con-intro")) return terminar();
    el.classList.add("js");

    const mark = el.querySelector<HTMLElement>("[data-mark]");
    const telon = el.querySelector<HTMLElement>("[data-telon]");
    const target = document.querySelector<HTMLElement>("[data-logo-target] > *");
    if (!mark || !telon || !target) return terminar();

    // El logo grande se ve al menos ~1 s desde que arrancó la página.
    const espera = Math.max(120, 1000 - performance.now());
    const a = mark.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const s = b.width / a.width;
    const viaje = mark.animate(
      [{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${s})` }],
      { duration: 950, delay: espera, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
    );
    telon.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 750, delay: espera + 120, easing: "ease-out", fill: "forwards" });
    viaje.finished.then(terminar, terminar);
    return () => viaje.cancel();
  }, []);

  if (pathname !== "/" || fin) return null;
  return (
    <div ref={ref} aria-hidden className="logo-intro pointer-events-none fixed inset-0 z-[90]">
      <div data-telon className="absolute inset-0 bg-ink" />
      <div className="absolute inset-0 grid place-items-center px-4">
        <span data-mark className="block origin-top-left leading-none text-bone">
          <Wordmark className="block text-[clamp(1.9rem,8.4vw,7.4rem)]" />
        </span>
      </div>
    </div>
  );
}
