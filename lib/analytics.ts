/**
 * Eventos de analítica (GA4 + Meta Pixel). Nunca mandar datos personales:
 * solo nombres de evento y parámetros genéricos (equipamiento, color, paso, categoría).
 */
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type EventName =
  | "select_equipment"
  | "select_color"
  | "share_config"
  | "click_quiero_asi"
  | "start_quote"
  | `quote_step_${number}`
  | "submit_quote"
  | "click_whatsapp"
  | "click_instagram"
  | "click_facebook"
  | "open_clip";

export function track(event: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    // Para el Pixel, el lead es el evento estándar "Lead"; el resto, custom.
    if (event === "submit_quote") window.fbq?.("track", "Lead", params);
    else window.fbq?.("trackCustom", event, params);
  } catch {
    /* la analítica nunca rompe la página */
  }
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
}
