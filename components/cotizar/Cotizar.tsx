"use client";

import { colores, equipamientos, hexColor, posterUrl } from "@/config/p70";
import { isPending } from "@/lib/pending";
import { useSeleccion } from "@/lib/selection";
import { Missing } from "@/components/ui/Missing";
import { QuoteFormLazy } from "./QuoteFormLazy";
import { irA } from "@/components/selector/Selector";
import { preguntas } from "@/config/quote-questions";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Puente "Ya elegiste tu P70. Ahora contanos de vos.": resumen de lo elegido en
 * el selector y el formulario ahí mismo, en la página.
 */
export function Cotizar() {
  const sel = useSeleccion();
  const ci = colores.findIndex((c) => c.id === sel.color);
  const c = colores[ci];
  const e = equipamientos.find((x) => x.n === sel.eq)!;

  const irAlSelector = (ev: React.MouseEvent) => {
    ev.preventDefault();
    irA("armalo");
  };

  return (
    <section id="cotizar" aria-labelledby="cotizar-title" className="cut-top-rev max-lg:cv-auto relative bg-paper pb-20 lg:pb-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(320px,0.75fr)_1.6fr] lg:gap-16 lg:px-10">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="eyebrow text-orange-ink">Cotizá tu P70</p>
          <h2 id="cotizar-title" className="font-display-x mt-4 text-[clamp(2.1rem,8.6vw,4rem)] text-ink uppercase">
            {sel.elegida ? (
              <>
                Ya elegiste
                <br />
                tu P70.
              </>
            ) : (
              <>
                Elegí tu P70.
              </>
            )}
            <span className="mt-2 block text-[0.55em] leading-[1.05] text-orange-ink">Ahora contanos de vos.</span>
          </h2>

          {/* Resumen de la selección */}
          <div className="mt-8 bg-garage text-bone">
            <div className="relative aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl(sel.eq, sel.color)} alt="" loading="lazy" decoding="async" className="h-full w-full origin-[50%_66%] scale-[1.55] object-cover" />
              <span className="eyebrow absolute top-3 left-3 bg-ink/70 px-2 py-1 text-[0.62rem] text-bone/85">Tu configuración</span>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-line border-t border-line">
              <div className="p-4">
                <dt className="font-mono text-[0.66rem] tracking-[0.14em] text-mist uppercase">Equipamiento {pad(e.n)}</dt>
                <dd className="mt-1 font-semibold">
                  {isPending(e.nombre) ? <Missing label={e.nombre} compact short="nombre" /> : e.nombre}
                </dd>
              </div>
              <div className="p-4">
                <dt className="font-mono text-[0.66rem] tracking-[0.14em] text-mist uppercase">Color {pad(ci + 1)}</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold">
                  <span aria-hidden className="size-4 shrink-0 rounded-full ring-1 ring-bone/40" style={{ background: hexColor(c) }} />
                  {isPending(c.nombre) ? <Missing label={c.nombre} compact short="nombre" /> : c.nombre}
                </dd>
              </div>
            </dl>
            <a href="#armalo" onClick={irAlSelector} className="flex min-h-12 items-center justify-between border-t border-line px-4 text-sm font-semibold text-bone/85 hover:text-bone">
              Cambiar equipamiento o color <span aria-hidden>↑</span>
            </a>
          </div>
          <p className="mt-4 text-sm text-stone">La configuración se adjunta a tu consulta. Son {preguntas.length} preguntas rápidas y tus datos de contacto.</p>
        </div>

        <div className="lg:pt-2">
          <QuoteFormLazy />
        </div>
      </div>
    </section>
  );
}
