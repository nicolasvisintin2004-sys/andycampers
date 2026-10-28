"use client";

import { useState } from "react";
import { equipamientoDeSerie, ficha } from "@/config/p70";
import { V } from "@/components/ui/Missing";
import { P70Drawing, hotspots } from "./P70Drawing";

/**
 * "Qué es el P70": las características en una sola sección, con la gráfica de
 * los flyers: el bloque verde del título, el plano sobre verde bosque, la ficha
 * como la tabla de opcionales (filas alternadas) y "Equipamiento base (en todos
 * los P70)". Todo el texto es HTML: Google lo lee y el comprador lo puede comparar.
 */
export function QueEsP70() {
  const [active, setActive] = useState(0);
  const h = hotspots[active];

  return (
    <section id="p70" aria-labelledby="p70-title" className="max-lg:cv-auto relative overflow-hidden bg-durazno pt-14 pb-20 lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 id="p70-title" className="slab font-display-x text-[clamp(2rem,7vw,3.4rem)] uppercase">
          Camper P70
        </h2>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <p className="text-forest">
            <span className="block font-cond text-[clamp(1.9rem,5vw,2.8rem)] leading-none font-semibold uppercase">Versión acero 100%</span>
            <span className="titulo-cond mt-1 block text-[clamp(1.25rem,3vw,1.6rem)]">(exclusivo para camionetas)</span>
          </p>
          <p className="max-w-md text-lg text-ink/80">Fabricado en Argentina para salir de la ruta. Tocá cada pieza para ver qué la hace distinta.</p>
        </div>

        <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="min-w-0">
            {/* Plano sobre el verde de los flyers, con las piezas clave */}
            <div className="zona-oscura blueprint-grid bg-forest p-4 text-white sm:p-6">
              <P70Drawing tone="blueprint" showHotspots active={h.id} className="h-auto w-full" idPrefix="p70s" />
              <ul className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0" aria-label="Piezas clave">
                {hotspots.map((it, i) => (
                  <li key={it.id} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                      aria-pressed={i === active}
                      className={`flex min-h-11 w-[9.5rem] flex-col items-start gap-0.5 border-t-2 px-1 pt-2 pb-1 text-left transition-colors sm:w-full ${
                        i === active ? "border-durazno text-white" : "border-white/20 text-white/65 hover:text-white"
                      }`}
                    >
                      <span className="font-cond text-[1rem] leading-tight font-semibold uppercase">{it.titulo}</span>
                      <span className="tabular font-cond text-[0.95rem] text-durazno/90">{it.dato}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p key={h.id} className="fade-up mt-4 min-h-[4.5rem] max-w-xl text-white/90" aria-live="polite">
                {h.texto}
              </p>
            </div>

            {/* Equipamiento base, como en el flyer */}
            <div className="mt-12">
              <h3 className="text-forest">
                <span className="titulo-cond block text-[clamp(2rem,5vw,2.8rem)] uppercase">Equipamiento base</span>
                <span className="titulo-cond mt-1 block text-[1.35rem]">(en todos los P70)</span>
              </h3>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {equipamientoDeSerie.map((it) => (
                  <li key={it} className="border-l-2 border-forest pl-3 font-semibold leading-snug text-ink/90">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ficha técnica: la tabla de los flyers de opcionales */}
          <div className="min-w-0">
            {ficha.map((g) => (
              <section key={g.grupo} aria-labelledby={`ficha-${g.grupo}`} className="mb-9 last:mb-0">
                <h3 id={`ficha-${g.grupo}`} className="titulo-cond text-[clamp(1.9rem,4vw,2.4rem)] text-forest uppercase">
                  {g.grupo}
                </h3>
                <dl className="mt-3">
                  {g.filas.map((f, i) => (
                    <div key={f.label} className={`grid grid-cols-[minmax(7.5rem,0.8fr)_1.3fr] gap-4 px-3 py-2.5 ${i % 2 ? "bg-sand/70" : "bg-white/80"}`}>
                      <dt className="font-cond text-[0.98rem] leading-snug font-semibold text-ink uppercase">{f.label}</dt>
                      <dd className="text-[0.98rem] text-ink/85">
                        <V v={f.valor} compact />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
