import "server-only";

/** Log estructurado (una línea JSON) para leer en los logs del hosting. */
export function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ t: new Date().toISOString(), level, event, ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      log("warn", `${label}.retry`, { attempt: i + 1, error: String(e) });
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * 3 ** i));
    }
  }
  throw last;
}
