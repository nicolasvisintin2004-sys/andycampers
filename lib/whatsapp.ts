import { nombreColor, nombreEq } from "@/config/p70";

/** Mensajes precargados de WhatsApp. Incluyen la configuración elegida cuando la hay. */
export function mensajeWhatsApp(sel?: { eq: number; color: string; elegida: boolean }) {
  if (!sel?.elegida) return "Hola Andy, vengo de la web. Me interesa el P70";
  return `Hola Andy, vengo de la web. Me interesa el P70 con ${nombreEq(sel.eq)} en ${nombreColor(sel.color)}`;
}

export function mensajeGracias(sel?: { eq: number; color: string }) {
  return sel
    ? `Hola Andy, acabo de completar el formulario en la web. Me interesa el P70 con ${nombreEq(sel.eq)} en ${nombreColor(sel.color)}`
    : "Hola Andy, acabo de completar el formulario en la web";
}
