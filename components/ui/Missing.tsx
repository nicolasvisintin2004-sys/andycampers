import { isPending, type Maybe, type Pending } from "@/lib/pending";

/**
 * CARTEL ROJO de dato faltante. Se ve a propósito: nada de lo que muestra está
 * confirmado. Se completa en config/site.ts o config/p70.ts reemplazando
 * `falta(...)` por el dato real.
 *
 * `compact`: versión chica para lugares apretados (pestañas del selector). Muestra
 * `short` (o "FALTA") y deja el texto completo en el title.
 */
export function Missing({
  label,
  block = false,
  compact = false,
  short,
  className = "",
}: {
  label: string | Pending;
  block?: boolean;
  compact?: boolean;
  short?: string;
  className?: string;
}) {
  const text = typeof label === "string" ? label : label.falta;
  const Tag = block ? "div" : "span";
  if (compact) {
    return (
      <span
        role="note"
        data-falta={text}
        title={`Falta: ${text}`}
        className={`inline-flex max-w-full items-center gap-1 border border-dashed border-white/80 bg-falta px-1.5 py-px font-mono text-[0.62rem] leading-tight font-semibold text-white uppercase ${className}`}
      >
        <span aria-hidden>⚠</span>
        <span className="truncate">
          <span className="sr-only">Falta: </span>
          {short ?? "Falta"}
        </span>
      </span>
    );
  }
  return (
    <Tag
      role="note"
      data-falta={text}
      className={`${block ? "flex" : "inline-flex"} items-start gap-2 border-2 border-dashed border-white/80 bg-falta px-3 py-2 font-mono text-[0.8rem] leading-snug font-semibold text-white outline-2 outline-falta ${className}`}
    >
      <span aria-hidden>⚠</span>
      <span>FALTA: {text}</span>
    </Tag>
  );
}

/** Muestra un valor confirmado o, si está pendiente, el cartel rojo. */
export function V({ v, block }: { v: Maybe<string>; block?: boolean }) {
  return isPending(v) ? <Missing label={v} block={block} /> : <>{v}</>;
}

/** Bloque de media faltante con la proporción del espacio que ocupará. */
export function MissingMedia({ label, ratio = "4/5", className = "" }: { label: string | Pending; ratio?: string; className?: string }) {
  return (
    <div
      className={`grid place-items-center bg-falta/10 p-4 outline-2 -outline-offset-2 outline-falta outline-dashed ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Missing label={label} />
    </div>
  );
}
