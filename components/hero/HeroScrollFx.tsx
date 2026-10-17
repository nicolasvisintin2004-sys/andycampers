"use client";

import { useEffect } from "react";

/**
 * Transición hero → selector: al bajar, el texto sube y se desvanece y el
 * montaje se aleja apenas (parallax). Solo transform y opacity; en mobile la
 * intensidad baja y con movimiento reducido no hace nada.
 */
export function HeroScrollFx() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const copy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const media = document.querySelector<HTMLElement>("[data-hero-media]");
    if (!copy || !media) return;
    const k = matchMedia("(min-width: 1024px)").matches ? 1 : 0.55;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      copy.style.transform = `translate3d(0, ${(-p * 120 * k).toFixed(1)}px, 0)`;
      copy.style.opacity = String(1 - p * 1.3);
      media.style.transform = `translate3d(0, ${(p * 180 * k).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
