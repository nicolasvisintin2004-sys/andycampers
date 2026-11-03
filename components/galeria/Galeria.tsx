"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { galeria } from "@/content/media";
import { track } from "@/lib/analytics";
import { IconArrow, IconClose } from "@/components/ui/Icons";

/**
 * Las fotos del P70: una tira de a 3 que se desliza (en la compu, con las
 * flechas). Se tocan y se agrandan.
 */
export function Galeria() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const tira = useRef<HTMLUListElement>(null);
  const [borde, setBorde] = useState({ inicio: true, fin: false });

  const medir = () => {
    const t = tira.current;
    if (t) setBorde({ inicio: t.scrollLeft < 4, fin: t.scrollLeft + t.clientWidth > t.scrollWidth - 4 });
  };
  const pasar = (d: number) => {
    const t = tira.current;
    if (t) t.scrollBy({ left: d * t.clientWidth, behavior: "smooth" });
  };

  const flecha =
    "grid size-12 place-items-center border-2 border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30";

  return (
    <section id="fotos" aria-labelledby="fotos-title" className="cv-auto relative overflow-hidden bg-paper pt-14 pb-20 lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 id="fotos-title" className="slab font-display-x text-[clamp(2rem,7vw,3.4rem)] uppercase">
          Fotos
        </h2>
        <div className="mt-4 flex items-end justify-between gap-4 lg:max-w-[1000px]">
          <div>
            <p className="titulo-cond text-[clamp(1.5rem,4vw,2.2rem)] text-forest">(por dentro y por fuera)</p>
            <p className="mt-1.5 font-cond text-[0.95rem] text-stone">Deslizá para ver las {galeria.length}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => pasar(-1)} disabled={borde.inicio} aria-label="Fotos anteriores" aria-controls="fotos-tira" className={flecha}>
              <IconArrow className="size-5 rotate-180" />
            </button>
            <button type="button" onClick={() => pasar(1)} disabled={borde.fin} aria-label="Más fotos" aria-controls="fotos-tira" className={flecha}>
              <IconArrow className="size-5" />
            </button>
          </div>
        </div>

        {/* De a 3 a la vista: cada foto ocupa un tercio menos los espacios */}
        <ul
          id="fotos-tira"
          ref={tira}
          onScroll={medir}
          className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-1.5 overflow-x-auto lg:mt-8 lg:max-w-[1000px] lg:gap-2"
        >
          {galeria.map((f, i) => (
            <li key={f.alt} className="w-[calc((100%-0.75rem)/3)] shrink-0 snap-start lg:w-[calc((100%-1rem)/3)]">
              <button
                type="button"
                onClick={() => {
                  setAbierta(i);
                  track("open_foto", { foto: i + 1 });
                }}
                aria-haspopup="dialog"
                aria-label={`Agrandar foto: ${f.alt}`}
                className="group relative block aspect-[3/4] w-full overflow-hidden bg-sand"
              >
                <Image
                  src={f.img}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 330px, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {abierta !== null && createPortal(<Visor i={abierta} onNav={setAbierta} onClose={() => setAbierta(null)} />, document.body)}
    </section>
  );
}

/** La foto agrandada: Esc o tocar afuera cierra; ← → pasa a otra. */
function Visor({ i, onNav, onClose }: { i: number; onNav: (i: number) => void; onClose: () => void }) {
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
