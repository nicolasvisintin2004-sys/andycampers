import "server-only";
import type { LeadInput } from "@/lib/lead-schema";
import { buildLeadRecord } from "./lead-record";
import { appendLead, sheetsConfigured } from "./sheets";
import { leadEmail, notifyHotLead, sendEmail } from "./notify";
import { log, withRetry } from "./log";

/**
 * Pipeline del lead: puntaje → planilla (con reintentos) → aviso según categoría.
 * Si la planilla falla, el lead no se pierde: queda en el log completo y se
 * manda por email igual.
 */
export async function processLead(input: LeadInput) {
  const lead = buildLeadRecord(input);
  log("info", "lead.received", { id: lead.id, categoria: lead.categoria, puntaje: lead.puntaje, origen: lead.respuestas.origen });

  let guardado = false;
  if (sheetsConfigured()) {
    try {
      await withRetry(() => appendLead(lead), "sheets.append");
      guardado = true;
    } catch (e) {
      log("error", "sheets.append.failed", { id: lead.id, error: String(e) });
    }
  } else {
    log("warn", "sheets.not_configured", { id: lead.id });
  }

  // Respaldo: el lead completo en el log siempre que no haya quedado en la planilla.
  if (!guardado) log("warn", "lead.backup", { lead });

  let canal: string | null = null;
  if (lead.categoria === "caliente") {
    try {
      canal = await notifyHotLead(lead);
    } catch (e) {
      log("error", "notify.hot.failed", { id: lead.id, error: String(e) });
    }
  }

  // Planilla caída: email de respaldo con todos los datos (salvo que el aviso
  // caliente ya haya salido por email con el mismo contenido).
  if (!guardado && canal !== "email") {
    try {
      const { html, text } = leadEmail(lead, `⚠ Este lead NO se pudo guardar en la planilla. Cargalo a mano. (${lead.categoria}, ${lead.puntaje}/100)`);
      await withRetry(() => sendEmail(`⚠ Lead sin guardar · ${lead.contacto.nombre}`, html, text), "email.backup");
    } catch (e) {
      log("error", "email.backup.failed", { id: lead.id, error: String(e) });
    }
  }

  return { categoria: lead.categoria, tipoVehiculo: lead.respuestas.vehiculo.tipo };
}
