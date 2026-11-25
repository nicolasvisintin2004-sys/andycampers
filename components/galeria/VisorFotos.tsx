"use client";

import { useEffect, useRef } from "react";
import { galeria } from "@/content/media";
import { IconArrow, IconClose } from "@/components/ui/Icons";

/** La foto agrandada: Esc o tocar afuera cierra; ← → pasa a otra. */
export function VisorFotos({ i, onNav, onClose }: { i: number; onNav: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const f = galeria[i];
  const n = galeria.length;
  const ir = (d: number) => onNav((i + d + n) % n);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const flecha = "grid size-12 shrink-0 place-items-center rounded-full bg-bone/10 text-bone ring-1 ring-bone/25 transition-colors hover:bg-bone hover:text-ink";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={f.alt}
      tabIndex={-1}
      className="zona-oscura fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-ink/92 p-4 outline-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" onClick={onClose} aria-label="Cerrar foto" className="absolute top-3 right-3 z-10 grid size-12 place-items-center text-bone/80 hover:text-bone">
        <IconClose className="size-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={f.img.src} src={f.img.src} alt={f.alt} className="max-h-[80svh] max-w-full object-contain" />
      <div className="flex items-center gap-4 text-bone">
        <button type="button" onClick={() => ir(-1)} aria-label="Foto anterior" className={flecha}>
          <IconArrow className="size-5 rotate-180" />
        </button>
        <span className="tabular font-cond text-sm text-bone/70">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => ir(1)} aria-label="Foto siguiente" className={flecha}>
          <IconArrow className="size-5" />
        </button>
      </div>
    </div>
  );
}
