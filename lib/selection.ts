"use client";

import { useSyncExternalStore } from "react";
import { colores, equipamientos, getColor, getEq, inicial } from "@/config/p70";

/**
 * Selección del P70 (equipamiento + color) compartida por el selector, el
 * formulario, el botón de WhatsApp y /gracias. Store mínimo sin dependencias.
 *
 * Orden de arranque: link compartido (?eq=2&color=c3) → lo elegido en esta
 * sesión → la combinación inicial de config/p70.ts.
 */
export interface Seleccion {
  eq: number;
  color: string;
  /** true cuando la persona eligió algo (o llegó con un link compartido). */
  elegida: boolean;
}

const KEY = "p70:seleccion";
const SERVER: Seleccion = { eq: inicial.eq, color: inicial.color, elegida: false };
let state: Seleccion = SERVER;
let booted = false;
const listeners = new Set<() => void>();

function boot() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  const p = new URLSearchParams(location.search);
  const eq = getEq(p.get("eq"));
  const color = getColor(p.get("color"));
  if (eq || color) {
    state = { eq: eq?.n ?? inicial.eq, color: color?.id ?? inicial.color, elegida: true };
    // El link compartido se usa una sola vez: si después la persona cambia algo
    // y recarga, vale lo que eligió (queda en sessionStorage), no el link.
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
      p.delete("eq");
      p.delete("color");
      const q = p.toString();
      history.replaceState(history.state, "", `${location.pathname}${q ? `?${q}` : ""}${location.hash}`);
    } catch {}
    return;
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Seleccion | null;
    if (saved && getEq(saved.eq) && getColor(saved.color)) state = { ...saved };
  } catch {
    /* storage bloqueado */
  }
}

export function getSeleccion() {
  boot();
  return state;
}

export function setSeleccion(next: Partial<Pick<Seleccion, "eq" | "color">>) {
  boot();
  const s = { ...state, ...next, elegida: true };
  if (s.eq === state.eq && s.color === state.color && state.elegida) return;
  state = s;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Selección actual. En el servidor (y en el primer render) devuelve la inicial. */
export function useSeleccion(): Seleccion {
  return useSyncExternalStore(subscribe, getSeleccion, () => SERVER);
}

/** Paso siguiente/anterior con vuelta (01 → 04 → 01). */
export const ciclarEq = (eq: number, d: 1 | -1) => {
  const i = equipamientos.findIndex((e) => e.n === eq);
  return equipamientos[(i + d + equipamientos.length) % equipamientos.length].n;
};
export const ciclarColor = (id: string, d: 1 | -1) => {
  const i = colores.findIndex((c) => c.id === id);
  return colores[(i + d + colores.length) % colores.length].id;
};

/** Link para compartir la combinación: https://…/?eq=2&color=c3#armalo */
export function linkCompartir(s: Pick<Seleccion, "eq" | "color">) {
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set("eq", String(s.eq));
  u.searchParams.set("color", s.color);
  u.hash = "armalo";
  return u.toString();
}
