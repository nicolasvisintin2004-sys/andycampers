import { useEffect, useState } from "react";

/** Margen después del load para considerar que la página ya se asentó. */
const DELAY_MS = 2000;

let done = false;
let promise: Promise<void> | undefined;

/**
 * Se resuelve con la primera interacción o un rato después del evento load.
 * Es para trabajo que no debe competir con el primer render: prefetch de
 * links, features de animación, etc. Solo en el cliente.
 */
export function whenSettled(): Promise<void> {
  return (promise ??= new Promise<void>((resolve) => {
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      done = true;
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const later = () => setTimeout(go, DELAY_MS);
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
  }));
}

/** `true` cuando la página ya se asentó (ver whenSettled). */
export function useSettled(): boolean {
  const [settled, setSettled] = useState(done);
  useEffect(() => {
    if (settled) return;
    let alive = true;
    whenSettled().then(() => alive && setSettled(true));
    return () => {
      alive = false;
    };
  }, [settled]);
  return settled;
}
