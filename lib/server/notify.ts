import "server-only";
import type { LeadRecord } from "./lead-record";
import { log } from "./log";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* ───────────────────────── Email (Resend) ───────────────────────── */

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL && process.env.RESEND_FROM);

export async function sendEmail(subject: string, html: string, text: string) {
  if (!emailConfigured()) {
    log("warn", "email.not_configured", { subject });
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: process.env.NOTIFY_EMAIL!.split(",").map((s) => s.trim()),
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

/** Contenido del aviso de un lead (mismo contenido para WhatsApp y email). */
export function leadSummary(l: LeadRecord) {
  const sel = l.seleccionTexto;
  return [
    ["Nombre", l.contacto.nombre],
    ["Puntaje", `${l.puntaje}/100 (${l.categoria})`],
    ["P70 elegido", `${sel.equipamiento} · ${sel.color}${sel.elegida ? "" : " (sin tocar el selector)"}`],
    ["Etapa", l.labels.etapa],
    ["Inversión", l.labels.inversion],
    ["Plazo", l.labels.plazo],
    ["Vehículo", `${l.respuestas.vehiculo.tipo} · ${l.vehiculoTexto}${l.alertaVehiculo ? ` · ${l.alertaVehiculo}` : ""}`],
    ["Equipamiento (formulario)", l.labels.equipamiento],
    ["Qué tan aventurero", l.labels.aventurero],
    ["Localidad", `${l.contacto.localidad}, ${l.contacto.provincia}`],
    ["WhatsApp", `https://wa.me/${l.whatsappNormalizado}`],
    ["Email", l.contacto.email || "—"],
    ["Tipo de viaje", l.labels.viaje],
    ["Origen", l.labels.origen],
    ["Comentario", l.respuestas.comentario || "—"],
    ["UTM", [l.attrib.utm_source, l.attrib.utm_medium, l.attrib.utm_campaign].filter(Boolean).join(" / ") || "—"],
    ["Página de entrada", l.attrib.landing || "—"],
    ["Fecha", l.fechaAR],
  ] as const;
}

export function leadEmail(l: LeadRecord, intro: string) {
  const rows = leadSummary(l);
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
<p style="font-size:16px">${esc(intro)}</p>
<p><a href="https://wa.me/${l.whatsappNormalizado}" style="display:inline-block;background:#1f9d55;color:#fff;padding:12px 18px;text-decoration:none;font-weight:600">Responder por WhatsApp</a></p>
<table style="border-collapse:collapse;width:100%;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 8px;border-top:1px solid #ddd;color:#555;width:38%">${esc(k)}</td><td style="padding:6px 8px;border-top:1px solid #ddd">${esc(v)}</td></tr>`)
    .join("")}</table></div>`;
  const text = `${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`;
  return { html, text };
}

/* ───────────────────── WhatsApp Business Cloud API ───────────────────── */

export const whatsappEnabled = () =>
  process.env.WHATSAPP_ENABLED === "true" &&
  Boolean(process.env.WA_PHONE_NUMBER_ID && process.env.WA_ACCESS_TOKEN && process.env.WA_TEMPLATE_NAME && process.env.WA_RECIPIENT);

/** Los parámetros de plantilla no aceptan saltos de línea, tabs ni más de 4 espacios seguidos. */
const param = (s: string) => ({ type: "text", text: s.replace(/[\n\t]+/g, " ").replace(/ {4,}/g, "   ").slice(0, 900) || "—" });

/**
 * Envía la plantilla aprobada. Orden de variables (ver README):
 * {{1}} nombre · {{2}} puntaje · {{3}} etapa · {{4}} inversión · {{5}} plazo
 * {{6}} vehículo (con "⚠ remolca con auto/SUV" si corresponde)
 * {{7}} P70 elegido (equipamiento · color) · {{8}} link wa.me del cliente
 */
export async function sendWhatsAppTemplate(l: LeadRecord) {
  const version = process.env.WA_API_VERSION || "v21.0";
  const res = await fetch(`https://graph.facebook.com/${version}/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: process.env.WA_RECIPIENT,
      type: "template",
      template: {
        name: process.env.WA_TEMPLATE_NAME,
        language: { code: process.env.WA_TEMPLATE_LANG || "es_AR" },
        components: [
          {
            type: "body",
            parameters: [
              l.contacto.nombre,
              `${l.puntaje}/100`,
              l.labels.etapa,
              l.labels.inversion,
              l.labels.plazo,
              `${l.respuestas.vehiculo.tipo} ${l.vehiculoTexto}${l.alertaVehiculo ? ` ${l.alertaVehiculo}` : ""}`,
              `${l.seleccionTexto.equipamiento} · ${l.seleccionTexto.color}`,
              `https://wa.me/${l.whatsappNormalizado}`,
            ].map(param),
          },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
}

/**
 * Aviso inmediato de lead caliente: WhatsApp si está habilitado; si está
 * apagado o falla, cae automáticamente a email.
 */
export async function notifyHotLead(l: LeadRecord) {
  if (whatsappEnabled()) {
    try {
      await sendWhatsAppTemplate(l);
      log("info", "notify.whatsapp.ok", { id: l.id });
      return "whatsapp";
    } catch (e) {
      log("error", "notify.whatsapp.failed", { id: l.id, error: String(e) });
    }
  }
  const alerta = l.alertaVehiculo ? ` ${l.alertaVehiculo}` : "";
  const { html, text } = leadEmail(l, `🔥 Lead caliente (${l.puntaje}/100): ${l.contacto.nombre} — respondé hoy.${alerta}`);
  await sendEmail(`🔥 Lead caliente ${l.puntaje}/100 · ${l.contacto.nombre}${alerta}`, html, text);
  log("info", "notify.email.ok", { id: l.id });
  return "email";
}
