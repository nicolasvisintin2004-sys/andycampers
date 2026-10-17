import "server-only";
import { log } from "./log";

/* ───────────── Límite de envíos por IP (ventana deslizante en memoria) ─────────────
   En serverless cada instancia tiene su propia memoria: frena ráfagas, no es un
   límite global. Turnstile + honeypot son la defensa principal. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);
const hits = new Map<string, number[]>();

export function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return list.length > MAX;
}

/* ───────────── Cloudflare Turnstile ───────────── */
export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    log("warn", "turnstile.not_configured");
    return true;
  }
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const json = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  if (!json.success) log("warn", "turnstile.failed", { codes: json["error-codes"] });
  return json.success;
}
