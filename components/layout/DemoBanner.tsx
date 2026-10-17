import { site } from "@/config/site";

/** Cartel rojo fijo de versión DEMO. Se apaga con `site.demo = false`. */
export function DemoBanner() {
  if (!site.demo) return null;
  return (
    <div
      role="note"
      className="fixed inset-x-0 top-0 z-[55] flex h-[var(--demo-h)] items-center justify-center gap-3 border-b-2 border-dashed border-white/70 bg-falta px-4 font-mono text-[0.72rem] font-semibold tracking-[0.14em] text-white uppercase"
    >
      <span aria-hidden>⚠</span>
      <span>
        Demo <span className="hidden font-normal tracking-normal normal-case sm:inline">· versión de prueba, con datos a confirmar</span>
      </span>
    </div>
  );
}
