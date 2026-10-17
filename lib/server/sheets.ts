import "server-only";
import { createSign } from "node:crypto";
import type { LeadRecord } from "./lead-record";

/**
 * Google Sheets vía service account, sin dependencias: firma el JWT con
 * node:crypto y usa la API REST. Variables: GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID y opcional GOOGLE_SHEET_TAB (default "Leads").
 */

export const COLUMNAS = [
  "Fecha y hora (AR)",
  "Fecha ISO",
  "Nombre",
  "WhatsApp",
  "Link WhatsApp",
  "Email",
  "Localidad",
  "Provincia",
  "Puntaje",
  "Categoría",
  "Equipamiento elegido",
  "Color elegido",
  "Qué tan aventurero",
  "Tipo de viaje",
  "Etapa de compra",
  "Inversión",
  "Tipo de vehículo",
  "Vehículo (marca, modelo, año)",
  "Alerta vehículo",
  "Plazo",
  "Equipamiento (formulario)",
  "Origen",
  "Comentario",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "Página de entrada",
  "Referrer",
  "ID",
  "Estado",
] as const;

const tab = () => process.env.GOOGLE_SHEET_TAB || "Leads";
/** Letra de columna para un índice 1-based (1 → A, 27 → AA). */
const colLetter = (n: number): string => (n > 26 ? colLetter(Math.floor((n - 1) / 26)) : "") + String.fromCharCode(65 + ((n - 1) % 26));
const lastCol = () => colLetter(COLUMNAS.length);

export const sheetsConfigured = () =>
  Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID);

let cached: { token: string; exp: number } | null = null;

async function token() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Sheets ${res.status}: ${await res.text()}`);
  return res.json();
}

let headerOk = false;
async function ensureHeader() {
  if (headerOk) return;
  const range = encodeURIComponent(`${tab()}!A1:${lastCol()}1`);
  const got = (await api(`/values/${range}`)) as { values?: string[][] };
  if (!got.values?.[0]?.length) {
    await api(`/values/${range}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [COLUMNAS] }) });
  }
  headerOk = true;
}

export function toRow(l: LeadRecord): string[] {
  const r = l.respuestas;
  return [
    l.fechaAR,
    l.fechaISO,
    l.contacto.nombre,
    l.whatsappNormalizado,
    `https://wa.me/${l.whatsappNormalizado}`,
    l.contacto.email,
    l.contacto.localidad,
    l.contacto.provincia,
    String(l.puntaje),
    l.categoria,
    l.seleccionTexto.equipamiento,
    l.seleccionTexto.color,
    l.labels.aventurero,
    l.labels.viaje,
    l.labels.etapa,
    l.labels.inversion,
    r.vehiculo.tipo,
    l.vehiculoTexto,
    l.alertaVehiculo,
    l.labels.plazo,
    l.labels.equipamiento,
    l.labels.origen,
    r.comentario,
    l.attrib.utm_source ?? "",
    l.attrib.utm_medium ?? "",
    l.attrib.utm_campaign ?? "",
    l.attrib.landing ?? "",
    l.attrib.referrer ?? "",
    l.id,
    "Nuevo",
  ];
}

/** Agrega una fila. RAW: lo que escribe el usuario nunca se interpreta como fórmula. */
export async function appendLead(l: LeadRecord) {
  await ensureHeader();
  const range = encodeURIComponent(`${tab()}!A:${lastCol()}`);
  await api(`/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [toRow(l)] }),
  });
}

/** Lee todas las filas como objetos con las claves de COLUMNAS. */
export async function readLeads(): Promise<Record<(typeof COLUMNAS)[number], string>[]> {
  const range = encodeURIComponent(`${tab()}!A2:${lastCol()}`);
  const got = (await api(`/values/${range}`)) as { values?: string[][] };
  return (got.values ?? []).map((row) => Object.fromEntries(COLUMNAS.map((c, i) => [c, row[i] ?? ""])) as Record<(typeof COLUMNAS)[number], string>);
}
