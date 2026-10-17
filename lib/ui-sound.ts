"use client";

/**
 * Sonidos de interfaz sintetizados con WebAudio (sin archivos). Apagados por
 * defecto: solo suenan si la persona activa el botón de sonido del selector.
 */
let ctx: AudioContext | null = null;
let enabled = false;
const KEY = "p70:sonido";

export function soundEnabled() {
  try {
    enabled = localStorage.getItem(KEY) === "1";
  } catch {}
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  if (on) blip("confirm");
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

/** "tick" al moverse entre opciones, "select" al elegir, "confirm" al confirmar. */
export function blip(kind: "tick" | "select" | "confirm") {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    if (kind === "tick") tone(1250, t, 0.05, "square", 0.025);
    if (kind === "select") {
      tone(660, t, 0.08, "triangle", 0.07);
      tone(990, t + 0.06, 0.12, "triangle", 0.06);
    }
    if (kind === "confirm") {
      tone(523, t, 0.09, "triangle", 0.07);
      tone(784, t + 0.07, 0.09, "triangle", 0.07);
      tone(1046, t + 0.14, 0.16, "triangle", 0.06);
    }
  } catch {
    /* sin audio: no pasa nada */
  }
}

/** Vibración mínima al tocar una opción en mobile (donde exista). */
export function haptic() {
  try {
    navigator.vibrate?.(10);
  } catch {}
}
