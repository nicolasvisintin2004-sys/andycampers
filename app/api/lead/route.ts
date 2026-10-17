import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { processLead } from "@/lib/server/process-lead";
import { rateLimited, verifyTurnstile } from "@/lib/server/antispam";
import { log } from "@/lib/server/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recibe el formulario de cotización. Valida, frena spam y procesa.
 * Responde solo la categoría (para el mensaje de /gracias); el puntaje
 * nunca sale del servidor.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";

  if (rateLimited(ip)) {
    log("warn", "lead.rate_limited", { ip });
    return NextResponse.json({ ok: false, error: "Demasiados envíos seguidos. Probá de nuevo en unos minutos." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Formato inválido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revisá los datos", fields: parsed.error.flatten().fieldErrors, issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot o envío instantáneo: respondemos OK pero no se procesa.
  if (data.empresa || (data.startedAt && Date.now() - data.startedAt < 3000)) {
    log("warn", "lead.spam_trap", { ip });
    return NextResponse.json({ ok: true, categoria: "frio" });
  }

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return NextResponse.json({ ok: false, error: "No pudimos verificar que no seas un robot. Recargá la página e intentá de nuevo." }, { status: 403 });
  }

  try {
    const { categoria } = await processLead(data);
    return NextResponse.json({ ok: true, categoria });
  } catch (e) {
    log("error", "lead.unhandled", { error: String(e) });
    return NextResponse.json({ ok: false, error: "Hubo un problema al enviar. Escribinos por WhatsApp." }, { status: 500 });
  }
}
