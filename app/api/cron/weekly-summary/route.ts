import { NextResponse, type NextRequest } from "next/server";
import { umbrales } from "@/config/lead-scoring";
import { readLeads, sheetsConfigured } from "@/lib/server/sheets";
import { sendEmail } from "@/lib/server/notify";
import { log } from "@/lib/server/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Resumen semanal (lunes 9:00 AR): leads tibios de los últimos 7 días
 * ordenados por puntaje + totales por categoría y por origen.
 * Lo dispara netlify/functions/weekly-summary.mts (o el cron de vercel.json)
 * con `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!sheetsConfigured()) {
    log("error", "weekly.sheets_not_configured");
    return NextResponse.json({ ok: false, error: "Google Sheets no configurado" }, { status: 503 });
  }

  const desde = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const semana = (await readLeads()).filter((r) => Date.parse(r["Fecha ISO"]) >= desde);

  const porCategoria = { caliente: 0, tibio: 0, frio: 0 } as Record<string, number>;
  const porOrigen: Record<string, number> = {};
  for (const r of semana) {
    porCategoria[r["Categoría"]] = (porCategoria[r["Categoría"]] ?? 0) + 1;
    porOrigen[r["Origen"] || "—"] = (porOrigen[r["Origen"] || "—"] ?? 0) + 1;
  }
  const tibios = semana.filter((r) => r["Categoría"] === "tibio").sort((a, b) => Number(b["Puntaje"]) - Number(a["Puntaje"]));

  const filas = tibios
    .map(
      (r) =>
        `<tr><td style="padding:6px 8px;border-top:1px solid #ddd"><b>${esc(r["Puntaje"])}</b></td><td style="padding:6px 8px;border-top:1px solid #ddd">${esc(r["Nombre"])}<br><small>${esc(r["Localidad"])}, ${esc(r["Provincia"])}</small></td><td style="padding:6px 8px;border-top:1px solid #ddd"><small>${esc(r["Etapa de compra"])}<br>${esc(r["Plazo"])}<br>P70: ${esc(r["Equipamiento elegido"])} · ${esc(r["Color elegido"])} ${esc(r["Alerta vehículo"])}</small></td><td style="padding:6px 8px;border-top:1px solid #ddd"><a href="${esc(r["Link WhatsApp"])}">WhatsApp</a></td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:system-ui,sans-serif;max-width:640px">
<h2 style="margin:0 0 8px">Resumen semanal de leads</h2>
<p>Últimos 7 días: <b>${semana.length}</b> leads · 🔥 ${porCategoria.caliente} calientes · ${porCategoria.tibio} tibios · ${porCategoria.frio} fríos</p>
<p><b>Por origen:</b> ${Object.entries(porOrigen).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v})`).join(" · ") || "—"}</p>
<h3>Tibios para seguir (${tibios.length}) · puntaje ${umbrales.tibio}–${umbrales.caliente - 1}</h3>
${tibios.length ? `<table style="border-collapse:collapse;width:100%;font-size:14px">${filas}</table>` : "<p>No hubo leads tibios esta semana.</p>"}
</div>`;
  const text = `Resumen semanal: ${semana.length} leads (${porCategoria.caliente} calientes, ${porCategoria.tibio} tibios, ${porCategoria.frio} fríos).\n\nTibios:\n${tibios
    .map((r) => `${r["Puntaje"]} · ${r["Nombre"]} · ${r["Localidad"]} · P70 ${r["Equipamiento elegido"]} / ${r["Color elegido"]} ${r["Alerta vehículo"]} · ${r["Link WhatsApp"]}`)
    .join("\n")}`;

  await sendEmail(`Resumen semanal · ${tibios.length} leads tibios`, html, text);
  log("info", "weekly.sent", { total: semana.length, tibios: tibios.length });
  return NextResponse.json({ ok: true, total: semana.length, tibios: tibios.length });
}
