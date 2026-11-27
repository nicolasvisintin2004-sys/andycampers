"use client";

import { useEffect } from "react";

/** tan(12°): todas las diagonales de la página van a 12°, como Rumbo / Terra / Cima (Andrés, 27/11). */
export const TAN_DIAGONAL = 0.2126;
const CORTES = ".corte-diag, .corte-ini, .corte-fin";

/**
 * Los cortes en diagonal (corte-diag / -ini / -fin) se hacen con clip-path, que mide en píxeles: para que
 * el ángulo sea el mismo en botones de distinto alto, acá se pone --sk = alto × tan(12°) en cada uno, y se
 * vuelve a medir si cambia de tamaño o aparece uno nuevo (la barra de abajo y la hoja van en un portal).
 */
export function Diagonales() {
  useEffect(() => {
    const vistos = new WeakSet<Element>();
    const ro = new ResizeObserver((entradas) => {
      for (const e of entradas) {
        const alto = (e.target as HTMLElement).offsetHeight;
        (e.target as HTMLElement).style.setProperty("--sk", `${(alto * TAN_DIAGONAL).toFixed(2)}px`);
      }
    });
    const buscar = () => {
      for (const el of document.querySelectorAll(CORTES)) {
        if (vistos.has(el)) continue;
        vistos.add(el);
        ro.observe(el);
      }
    };
    buscar();
    const mo = new MutationObserver(buscar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
