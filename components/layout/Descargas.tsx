"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { descargas, equipamientos, nombreEq, slugEq } from "@/config/p70";
import { track } from "@/lib/analytics";
import { IconClose } from "@/components/ui/Icons";

const enlace = "group inline-flex min-h-12 items-center gap-3 text-left font-cond text-[1.2rem] font-semibold uppercase transition-colors hover:text-durazno";
const Flecha = () => (
  <span aria-hidden className="text-[1.6rem] leading-none text-durazno transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5">
    ↘
  </span>
);

/**
 * Las descargas del pie (pedido de Andrés): el catálogo con los niveles como
 * imágenes para guardar en el celular y las preguntas frecuentes en PDF.
 * Los archivos los genera scripts/descargas.mjs.
 */
export function Descargas() {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={() => setAbierto(true)} aria-haspopup="dialog" className={enlace}>
        <Flecha /> Descargá el catálogo
      </button>
      <a href={descargas.preguntas} download onClick={() => track("download", { archivo: "preguntas" })} className={enlace}>
        <Flecha /> Preguntas frecuentes (PDF)
      </a>
      {abierto && createPortal(<Catalogo onClose={() => setAbierto(false)} />, document.body)}
    </div>
  );
}

function Catalogo({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo del P70"
      tabIndex={-1}
      className="fixed inset-0 z-[80] overflow-y-auto bg-ink/80 p-4 outline-none sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative mx-auto max-w-5xl bg-durazno p-5 text-ink sm:p-8">
        <button type="button" onClick={onClose} aria-label="Cerrar catálogo" className="absolute top-2 right-2 grid size-11 place-items-center text-stone hover:text-ink">
          <IconClose className="size-6" />
        </button>
        <h2 className="text-forest">
          <span className="titulo-cond block text-[2.2rem] uppercase">Catálogo P70</span>
          <span className="titulo-cond block text-[1.25rem]">(un nivel por imagen, para guardar en el celular)</span>
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {equipamientos.map((e) => (
            <li key={e.n}>
              <a href={descargas.catalogo(e.n)} target="_blank" rel="noopener" className="block bg-white/60 ring-1 ring-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={descargas.catalogo(e.n)} alt={`Catálogo del nivel ${nombreEq(e.n)}`} width={1080} height={1920} loading="lazy" className="h-auto w-full" />
              </a>
              <a
                href={descargas.catalogo(e.n)}
                download={`andycampers-p70-${slugEq(e.n)}.jpg`}
                onClick={() => track("download", { archivo: `catalogo-${slugEq(e.n)}` })}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center bg-forest px-4 font-semibold text-white transition-colors hover:bg-forest-deep"
              >
                Descargar {nombreEq(e.n)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
