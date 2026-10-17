"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import { whenSettled } from "@/lib/settled";

/**
 * Las features de animación (~23 KB) se piden con la primera interacción o un
 * rato después del load: nunca compiten con el primer render. Hasta entonces
 * los `m.*` muestran directamente su estado final.
 */
const loadFeatures = () => whenSettled().then(() => import("./motion-features").then((m) => m.default));

/**
 * Framer Motion con features diferidas y respeto por reduced-motion. Lo usan
 * solo los componentes que lo necesitan (galería, configurador, formulario),
 * así las páginas que no animan con Framer no cargan la librería.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
