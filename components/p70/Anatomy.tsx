"use client";

import { useEffect, useRef, useState } from "react";
import { P70Drawing, hotspots } from "./P70Drawing";

/**
 * "Qué es el P70": el camper fijo en pantalla y, al bajar, los hotspots con
 * líneas de cota (chasis, suspensión, frenos, aislamiento, portones).
 * Desktop: escena fija con GSAP ScrollTrigger. Mobile/tablet: carrusel
 * horizontal liviano con el plano ampliado en cada pieza (sin escena fija).
 * Todo el texto es HTML: Google lo lee y el comprador lo puede comparar.
 */
export function Anatomy() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reduce) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !pin.current) return;
      gsap.registerPlugin(ScrollTrigger);
      window.__lenis?.on("scroll", ScrollTrigger.update);
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: pin.current,
          start: "top top",
          end: () => `+=${window.innerHeight * hotspots.length * 0.6}`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => setActive(Math.min(hotspots.length - 1, Math.floor(self.progress * hotspots.length))),
        });
        gsap.from(".anat-drawing", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: pin.current, start: "top 70%" },
        });
      }, section);
      setPinned(true);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  const h = hotspots[active];

  return (
    <section ref={section} id="p70" aria-labelledby="anatomia-title" className="max-lg:cv-auto relative bg-graphite text-bone">
      {/* Desktop: escena fija */}
      <div ref={pin} className="blueprint-grid relative hidden min-h-screen lg:block">
        <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-[minmax(380px,0.85fr)_2fr] items-center gap-10 px-10 py-20">
          <div>
            <p className="eyebrow text-orange-glow">Qué es el P70</p>
            <h2 id="anatomia-title" className="font-display-x mt-4 text-[clamp(2.2rem,2.7vw,3rem)] uppercase">
              Acero 100%.
              <br />
              Hecho para
              <br />
              la ruta.
            </h2>
            <p className="mt-5 max-w-sm text-bone/80">
              Un camper off-road para camionetas, fabricado en Argentina. Bajá y recorré las piezas que lo hacen distinto.
            </p>
            <ol className="mt-8 space-y-1" aria-label="Piezas clave">
              {hotspots.map((it, i) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => !pinned && setActive(i)}
                    aria-pressed={i === active}
                    className={`group flex min-h-11 w-full items-baseline gap-4 border-t border-line py-3 text-left transition-colors ${
                      i === active ? "text-bone" : "text-mist hover:text-bone"
                    }`}
                  >
                    <span className={`font-mono text-xs ${i === active ? "text-orange-glow" : ""}`}>{it.n}</span>
                    <span className="text-lg font-semibold">{it.titulo}</span>
                    <span className="tabular ml-auto font-mono text-xs">{it.dato}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p key={h.id} className="fade-up mt-6 max-w-sm min-h-[4.5rem] text-bone/85" aria-live="polite">
              {h.texto}
            </p>
          </div>

          <div className="anat-drawing relative">
            <P70Drawing tone="blueprint" showHotspots active={h.id} className="h-auto w-full" idPrefix="anat" />
            <p className="eyebrow mt-2 text-right text-mist">Esquema lateral · no a escala</p>
          </div>
        </div>
        {pinned && (
          <div className="absolute bottom-8 left-10 flex gap-2" aria-hidden>
            {hotspots.map((it, i) => (
              <span key={it.id} className={`h-0.5 w-10 transition-colors ${i <= active ? "bg-orange" : "bg-line"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile / tablet: carrusel horizontal liviano */}
      <div className="blueprint-grid py-16 lg:hidden">
        <div className="px-4 sm:px-6">
          <p className="eyebrow text-orange-glow">Qué es el P70</p>
          <h2 className="font-display-x mt-3 text-[clamp(2.2rem,10.5vw,3.6rem)] uppercase">
            Acero 100%.
            <br />
            Hecho para la ruta.
          </h2>
          <p className="mt-4 max-w-md text-bone/80">Un camper off-road para camionetas, fabricado en Argentina. Deslizá para recorrer las piezas clave.</p>
          <P70Drawing tone="blueprint" showDims={false} className="mt-8 h-auto w-full" idPrefix="anat-m" />
        </div>
        <ol className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6" aria-label="Piezas clave">
          {hotspots.map((it, i) => (
            <li key={it.id} className="w-[84%] max-w-[380px] shrink-0 snap-start border border-line bg-ink/50">
              <P70Drawing
                tone="blueprint"
                showHotspots
                showDims={false}
                active={it.id}
                viewBox={it.zoom}
                className="h-auto w-full border-b border-line"
                idPrefix={`anat-${it.id}`}
                title={`Detalle: ${it.titulo}`}
              />
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-semibold">
                    <span className="mr-3 font-mono text-xs text-orange-glow">{it.n}</span>
                    {it.titulo}
                  </h3>
                  <span className="tabular shrink-0 font-mono text-xs text-mist">{it.dato}</span>
                </div>
                <p className="mt-3 text-bone/85">{it.texto}</p>
                <p className="tabular mt-4 font-mono text-[0.68rem] tracking-[0.14em] text-mist">
                  {String(i + 1).padStart(2, "0")} / {String(hotspots.length).padStart(2, "0")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
