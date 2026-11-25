"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { galeria } from "@/content/media";
import { track } from "@/lib/analytics";
import { IconArrow } from "@/components/ui/Icons";
import { VisorFotos } from "@/components/galeria/VisorFotos";

const forma = "aspect-[4/5] w-[clamp(96px,28.5vw,124px)] [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)] md:w-[clamp(110px,9.2vw,147px)]";

/**
 * Todas las fotos del P70 debajo de "Armá tu P70" (Andrés, 25/11: reemplazan a los 3 videos, que siguen en
 * "En acción", y al apartado Fotos). Una línea abajo marca por dónde vas, así se entiende que hay más; en la
 * compu, además, flechas. Se tocan y se agrandan.
 */
export function HeroFotos() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const tira = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ ancho: 1, inicio: 0, alInicio: true, alFinal: false });

  const medir = () => {
    const t = tira.current;
    if (!t) return;
    const max = Math.max(t.scrollWidth - t.clientWidth, 1);
    const ancho = Math.min(t.clientWidth / t.scrollWidth, 1);
    setPos({ ancho, inicio: (t.scrollLeft / max) * (1 - ancho), alInicio: t.scrollLeft < 4, alFinal: t.scrollLeft > max - 4 });
  };
  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  const pasar = (d: number) => tira.current?.scrollBy({ left: d * tira.current.clientWidth * 0.8, behavior: "smooth" });

  const flecha =
    "grid size-9 place-items-center border border-white/35 text-white transition-colors hover:border-white hover:bg-white hover:text-forest-deep disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="fade-up mt-7 md:mt-9" style={{ "--d": "720ms" } as React.CSSProperties}>
      <ul ref={tira} onScroll={medir} aria-label={`Fotos del P70 (${galeria.length})`} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {galeria.map((f, i) => (
          <li key={f.alt} className={`relative shrink-0 snap-start ${i > 0 ? "-ml-2.5" : ""}`}>
            <button
              type="button"
              onClick={() => {
                setAbierta(i);
                track("open_foto", { foto: i + 1, ubicacion: "hero" });
              }}
              aria-haspopup="dialog"
              aria-label={`Agrandar foto: ${f.alt}`}
              className={`group relative block overflow-hidden bg-forest ${forma}`}
            >
              <Image src={f.img} alt="" fill sizes="150px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <div aria-hidden className="relative h-[3px] flex-1 bg-white/20">
          <div className="absolute inset-y-0 bg-durazno transition-[left] duration-150" style={{ width: `${pos.ancho * 100}%`, left: `${pos.inicio * 100}%` }} />
        </div>
        <div className="hidden shrink-0 gap-2 lg:flex">
          <button type="button" onClick={() => pasar(-1)} disabled={pos.alInicio} aria-label="Fotos anteriores" className={flecha}>
            <IconArrow className="size-4 rotate-180" />
          </button>
          <button type="button" onClick={() => pasar(1)} disabled={pos.alFinal} aria-label="Más fotos" className={flecha}>
            <IconArrow className="size-4" />
          </button>
        </div>
      </div>
      {abierta !== null && createPortal(<VisorFotos i={abierta} onNav={setAbierta} onClose={() => setAbierta(null)} />, document.body)}
    </div>
  );
}
