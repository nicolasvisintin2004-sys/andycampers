/**
 * Datos faltantes. Todo lo que el cliente todavía no confirmó se carga como
 * `falta("qué va acá")` y el sitio lo muestra como un CARTEL ROJO visible.
 * Para completar un dato, reemplazá la llamada a `falta(...)` por el valor real.
 */
export type Pending = { readonly falta: string };

export const falta = (label: string): Pending => ({ falta: label });

export const isPending = (v: unknown): v is Pending =>
  typeof v === "object" && v !== null && "falta" in v;

/** Un valor que puede estar confirmado o pendiente. */
export type Maybe<T> = T | Pending;
