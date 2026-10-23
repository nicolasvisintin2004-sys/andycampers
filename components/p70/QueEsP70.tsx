"use client";

import { useState } from "react";
import { equipamientoDeSerie, ficha } from "@/config/p70";
import { V } from "@/components/ui/Missing";
import { RevealTitle } from "@/components/ui/Reveal";
import { P70Drawing, hotspots } from "./P70Drawing";

/**
 * "Qué es el P70": las características en una sola sección (antes eran dos:
 * la anatomía con escena fija y la ficha técnica).
 * Izquierda: el plano con las 5 piezas clave (se elige con un toque o pasando
 * el mouse). Derecha: la ficha compacta y lo que trae de serie.
 * Todo el texto es HTML: Google lo lee y el comprador lo puede comparar.
 */
export function QueEsP70() {
  const [active, setActive] = useState(0);
  const h = hotspots[active];

  return (
    <section id="p70" aria-labelledby="p70-title" className="max-lg:cv-auto paper-grid relative bg-cream pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="eyebrow text-orange-ink">Qué es el P70 · Ficha técnica</p>
            <RevealTitle
              id="p70-title"
              className="font-display-x mt-4 text-[clamp(2.2rem,7.4vw,4.2rem)] text-ink uppercase"
              lines={["Acero 100%.", "Hecho para la ruta."]}
            />
          </div>
          <p className="max-w-md text-lg text-ink/80 lg:pb-1">Un camper off-road para camionetas, fabricado en Argentina. Estas son las piezas que lo hacen distinto y sus datos.</p>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          {/* Plano con las piezas clave */}
          <div className="blueprint-grid min-w-0 bg-graphite p-4 text-bone sm:p-6">
            <P70Drawing tone="blueprint" showHotspots active={h.id} className="h-auto w-full" idPrefix="p70s" />
            <ol className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0" aria-label="Piezas clave">
              {hotspots.map((it, i) => (
                <li key={it.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    aria-pressed={i === active}
                    className={`flex min-h-11 w-[9.5rem] flex-col items-start gap-0.5 border-t-2 px-1 pt-2 pb-1 text-left transition-colors sm:w-full ${
                      i === active ? "border-orange text-bone" : "border-line text-mist hover:text-bone"
                    }`}
                  >
                    <span className={`font-mono text-[0.68rem] ${i === active ? "text-orange-glow" : ""}`}>{it.n}</span>
                    <span className="text-sm leading-tight font-semibold">{it.titulo}</span>
                    <span className="tabular font-mono text-[0.68rem]">{it.dato}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p key={h.id} className="fade-up mt-4 min-h-[4.5rem] max-w-xl text-bone/85" aria-live="polite">
              {h.texto}
            </p>
          </div>

          {/* Ficha compacta + de serie */}
          <div className="min-w-0">
            {ficha.map((g) => (
              <section key={g.grupo} aria-label={g.grupo} className="mb-7 last:mb-0">
                <h3 className="eyebrow border-b-2 border-ink pb-2 text-ink">{g.grupo}</h3>
                <dl>
                  {g.filas.map((f) => (
                    <div key={f.label} className="grid grid-cols-[minmax(7.5rem,0.75fr)_1.4fr] gap-4 border-b border-ink/15 py-2.5">
                      <dt className="text-sm font-semibold text-stone">{f.label}</dt>
                      <dd className="text-[0.95rem] text-ink">
                        <V v={f.valor} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <div className="mt-8 bg-ink p-5 text-bone sm:p-6">
              <p className="eyebrow text-orange-glow">De serie en todos los P70</p>
              <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {equipamientoDeSerie.map((it) => (
                  <li key={it} className="flex gap-3 text-[0.93rem] leading-snug">
                    <span aria-hidden className="mt-[0.5em] h-[2px] w-3 shrink-0 bg-orange" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
