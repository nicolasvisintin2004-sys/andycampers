"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clips, type ClipKey } from "@/content/media";
import { track } from "@/lib/analytics";
import { IconArrow, IconClose, IconPlay } from "@/components/ui/Icons";

const ELEGIDOS = ["medanos", "cocinaPlaya", "despertar"] as const satisfies readonly ClipKey[];

/**
 * Tres videos debajo de "Armá tu P70": miniaturas livianas (~10 KB, prioridad
 * baja) y, al tocarlas, el video se agranda a pantalla.
 */
export function HeroClips() {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <div className="fade-up mt-7 md:mt-9" style={{ "--d": "720ms" } as React.CSSProperties}>
      <p className="eyebrow text-[0.66rem] text-bone/70">Mirá el P70 en acción</p>
      <ul className="mt-3 flex gap-2.5 sm:gap-3">
        {ELEGIDOS.map((k, i) => {
          const c = clips[k];
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => {
                  setAbierto(i);
                  track("open_clip", { clip: k });
                }}
                aria-label={`Ver video: ${c.titulo}`}
                aria-haspopup="dialog"
                className="group relative block aspect-[4/5] w-[clamp(76px,22vw,96px)] overflow-hidden bg-graphite ring-1 ring-bone/25 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:ring-orange-glow md:w-[clamp(84px,7vw,116px)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.mini}
                  alt=""
                  width={232}
                  height={290}
                  fetchPriority="low"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(22_24_27/0.75),transparent_55%)]" />
                <span aria-hidden className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-bone ring-1 ring-bone/50 transition-colors group-hover:bg-orange-cta group-hover:text-ink">
                  <IconPlay className="ml-0.5 size-4" />
                </span>
                <span aria-hidden className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-left text-[0.68rem] leading-tight font-semibold text-bone">
                  {c.titulo}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {abierto !== null && createPortal(<Visor i={abierto} onNav={setAbierto} onClose={() => setAbierto(null)} />, document.body)}
    </div>
  );
}

/** El video agrandado: Esc o tocar afuera cierra; ← → pasa al otro. */
function Visor({ i, onNav, onClose }: { i: number; onNav: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const c = clips[ELEGIDOS[i]];
  const n = ELEGIDOS.length;
  const ir = (d: number) => onNav((i + d + n) % n);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cerrar = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  const flecha = "grid size-12 shrink-0 place-items-center rounded-full bg-bone/10 text-bone ring-1 ring-bone/25 transition-colors hover:bg-bone hover:text-ink";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={c.titulo}
      tabIndex={-1}
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-ink/92 p-4 outline-none transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <button type="button" onClick={cerrar} aria-label="Cerrar video" className="absolute top-3 right-3 grid size-12 place-items-center text-bone/80 hover:text-bone">
        <IconClose className="size-6" />
      </button>

      <div className="flex items-center gap-4 sm:gap-6">
        <button type="button" onClick={() => ir(-1)} aria-label="Video anterior" className={`${flecha} hidden sm:grid`}>
          <IconArrow className="size-5 rotate-180" />
        </button>
        <video
          key={c.src}
          className={`aspect-[9/16] max-h-[78svh] w-auto max-w-[88vw] bg-graphite object-cover transition-transform duration-300 ease-[var(--ease-out-expo)] ${open ? "scale-100" : "scale-95"}`}
          poster={c.poster}
          autoPlay
          muted
          loop
          playsInline
          controls
          aria-label={c.alt}
        >
          <source src={`${c.src}.webm`} type="video/webm" />
          <source src={`${c.src}.mp4`} type="video/mp4" />
        </video>
        <button type="button" onClick={() => ir(1)} aria-label="Video siguiente" className={`${flecha} hidden sm:grid`}>
          <IconArrow className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-bone">
        <button type="button" onClick={() => ir(-1)} aria-label="Video anterior" className={`${flecha} sm:hidden`}>
          <IconArrow className="size-5 rotate-180" />
        </button>
        <p className="text-center">
          <span className="block font-semibold">{c.titulo}</span>
          <span className="tabular font-mono text-xs text-bone/60">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </p>
        <button type="button" onClick={() => ir(1)} aria-label="Video siguiente" className={`${flecha} sm:hidden`}>
          <IconArrow className="size-5" />
        </button>
      </div>
    </div>
  );
}
