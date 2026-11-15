"use client";

import { useState } from "react";
import { ficha } from "@/config/p70";
import { V } from "@/components/ui/Missing";
import { P70Drawing, hotspots } from "./P70Drawing";

/**
 * "Qué es el P70": las características en una sola sección, con la gráfica de
 * los flyers: el bloque verde del título, el croquis sobre verde bosque y la ficha
 * como la tabla de opcionales (filas alternadas). "Equipamiento base" ya no va acá
 * (Andrés, 14/11: ahora están los 3 niveles); sigue en los catálogos descargables.
 * Todo el texto es HTML: Google lo lee y el comprador lo puede comparar.
 * Espacios compactos: más aire entre grupos que dentro de un grupo.
 */
export function QueEsP70() {
  const [active, setActive] = useState(0);
  const h = hotspots[active];

  return (
    <section id="p70" aria-labelledby="p70-title" className="max-lg:cv-auto relative overflow-hidden bg-durazno pt-8 pb-10 lg:pt-12 lg:pb-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 id="p70-title" className="slab font-display-x text-[clamp(2rem,7vw,3.4rem)] uppercase">
          Camper P70
        </h2>
        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <div className="min-w-0">
            {/* Plano sobre el verde de los flyers, con las piezas clave. En el celu ocupa casi todo el ancho (Andrés, 13/11). */}
            <div className="zona-oscura blueprint-grid -mx-3 bg-forest p-4 text-white sm:mx-0 sm:p-6">
              <P70Drawing showHotspots active={h.id} className="h-auto w-full" />
              <ul className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0" aria-label="Piezas clave">
                {hotspots.map((it, i) => (
                  <li key={it.id} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                      aria-pressed={i === active}
                      className={`flex h-full min-h-11 w-[9.5rem] flex-col items-start gap-0.5 border px-3 pt-2 pb-2 text-left transition-colors sm:w-full ${
                        i === active ? "border-durazno bg-durazno text-forest" : "border-white/35 bg-white/[0.07] text-white/80 hover:border-white/70 hover:text-white"
                      }`}
                    >
                      <span className="font-cond text-[1rem] leading-tight font-semibold uppercase">{it.titulo}</span>
                      <span className={`tabular font-cond text-[0.95rem] ${i === active ? "text-forest/80" : "text-durazno/90"}`}>{it.dato}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p key={h.id} className="fade-up mt-4 min-h-[4.5rem] max-w-xl text-white/90" aria-live="polite">
                {h.texto}
              </p>
            </div>
          </div>

          {/* Ficha técnica: la tabla de los flyers de opcionales */}
          <div className="min-w-0">
            {ficha.map((g) => (
              <section key={g.grupo} aria-labelledby={`ficha-${g.grupo}`} className="mb-6 last:mb-0">
                <h3 id={`ficha-${g.grupo}`} className="titulo-cond text-[clamp(1.6rem,3.5vw,2rem)] leading-none text-forest uppercase">
                  {g.grupo}
                </h3>
                <dl className="mt-2">
                  {g.filas.map((f, i) => (
                    <div key={f.label} className={`grid grid-cols-[minmax(7.5rem,0.8fr)_1.3fr] gap-3 px-3 py-1.5 ${i % 2 ? "bg-sand/70" : "bg-white/80"}`}>
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
