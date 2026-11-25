"use client";

import { useEffect } from "react";

/**
 * Que "vivir" termine justo donde termina el 0 del P70 (Andrés, 25/11), en cualquier pantalla.
 * El CSS ya deja el tamaño casi exacto (100cqw / 12,15); acá se mide el renglón y el 0 de verdad, se ajusta
 * la letra y lo que no se puede con la letra (va de a píxel entero) se reparte en el espacio entre letras.
 */
export function HeroAjuste() {
  useEffect(() => {
    const renglon = document.querySelector<HTMLElement>("[data-hero-renglon]");
    const texto = renglon?.parentElement;
    const logo = document.querySelector<SVGSVGElement>("#hero-title svg");
    if (!renglon || !texto || !logo) return;
    const ajustar = () => {
      const fin = Math.max(...[...logo.querySelectorAll("path")].map((p) => p.getBoundingClientRect().right));
      const medir = () => {
        const r = document.createRange();
        r.selectNodeContents(renglon);
        return r.getBoundingClientRect();
      };
      renglon.style.letterSpacing = "";
      // 1) La letra: el navegador la redondea a píxeles enteros, así que se busca la más grande que entra…
      for (let i = 0; i < 4; i++) {
        const ancho = medir();
        if (!(ancho.width > 0 && fin > ancho.left)) return;
        const actual = parseFloat(getComputedStyle(texto).fontSize);
        texto.style.fontSize = `${Math.floor((actual * (fin - ancho.left)) / ancho.width)}px`;
      }
      // 2) …y lo que falta para llegar al 0 se reparte entre las letras (menos de un píxel cada una).
      const sobra = fin - medir().right;
      const letras = (renglon.textContent ?? "").length;
      if (letras > 1) renglon.style.letterSpacing = `calc(-0.005em + ${sobra / letras}px)`;
    };
    ajustar();
    // La letra del texto se baja sin precarga: se vuelve a medir cuando termina de llegar cada fuente.
    document.fonts?.ready.then(ajustar);
    document.fonts?.addEventListener("loadingdone", ajustar);
    window.addEventListener("load", ajustar);
    const ro = new ResizeObserver(ajustar);
    ro.observe(document.querySelector("[data-hero-copy]")!);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener("loadingdone", ajustar);
      window.removeEventListener("load", ajustar);
    };
  }, []);
  return null;
}
