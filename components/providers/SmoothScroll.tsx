"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __lenis?: import("lenis").default;
  }
}

/**
 * Lenis para scroll suave. Desactivado con prefers-reduced-motion y en
 * pantallas táctiles (el scroll nativo del teléfono ya es mejor).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let raf = 0;
    let destroyed = false;
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      window.__lenis = lenis;
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.__lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Al cambiar de página, arrancar arriba.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
