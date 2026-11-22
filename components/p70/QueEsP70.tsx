"use client";

import { useState } from "react";
import { ficha } from "@/config/p70";
import { V } from "@/components/ui/Missing";
import { P70Drawing, hotspots } from "./P70Drawing";
import { LogoP70 } from "@/components/ui/LogoP70";

/**
 * "Qué es el P70": las características en una sola sección, con la gráfica de
 * los flyers: el bloque verde del título, el modelo 3D directo sobre el durazno (con el texto de la pieza en verde) y la ficha
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
        {/* Solo "P70", con la tipografía del folleto (Andrés, 20/11) */}
        <h2 id="p70-title" className="slab font-display-x text-[clamp(2rem,7vw,3.4rem)] uppercase">
          <LogoP70 className="block h-[0.82em] w-auto" />
        </h2>
        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <div className="min-w-0">
            {/* Sin verde alrededor y más chico: en tablet y compu (Andrés, 22/11) y también en el celu (pedido posterior del mismo día). */}
            <div>
              <P70Drawing showHotspots active={h.id} className="mx-auto block h-auto w-[85%] sm:w-4/5" />
              {/* Cortados en diagonal (Andrés, 20/11) y cada uno del ancho de su texto, unos 10 px más altos que su
                  contenido (22/11): el alto mínimo cambia con el ancho porque el texto entra en más o menos renglones. */}
              <ul className="no-scrollbar -mx-4 mt-4 flex snap-x overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:overflow-visible sm:px-0" aria-label="Piezas clave">
                {hotspots.map((it, i) => (
                  <li key={it.id} className="-ml-1.5 shrink-0 snap-start first:ml-0 sm:shrink sm:basis-auto">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                      aria-pressed={i === active}
                      className={`group flex h-full min-h-[3.625rem] flex-col items-start justify-center gap-0.5 py-1.5 pr-5 text-left transition-colors sm:min-h-[7.125rem] sm:py-2 min-[45.5rem]:min-h-[6.125rem] min-[55.5rem]:min-h-[5.125rem] lg:min-h-[7.125rem] min-[83.125rem]:min-h-[6.125rem] ${
                        i === 0 ? "corte-ini pl-3" : i === hotspots.length - 1 ? "corte-fin pl-5" : "corte-diag pl-5"
                      } ${i === active ? "bg-forest text-white" : "bg-white/85 text-ink hover:bg-white"}`}
                    >
                      {/* El clip-path tapa el contorno de foco: con teclado se subraya el título */}
                      <span className="font-cond text-[0.9rem] leading-tight font-semibold text-balance uppercase group-focus-visible:underline group-focus-visible:underline-offset-4">{it.titulo}</span>
                      <span className={`tabular font-cond text-[0.84rem] leading-tight ${i === active ? "text-durazno" : "text-forest"}`}>{it.dato}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {/* El texto de la pieza elegida sí va sobre el cuadro verde (22/11): el marco se sacó solo del croquis */}
              <div className="zona-oscura blueprint-grid mt-3 bg-forest p-4 text-white sm:p-5">
                <p key={h.id} className="fade-up min-h-[4.5rem] max-w-xl text-white/90" aria-live="polite">
                  {h.texto}
                </p>
              </div>
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
