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
    <section id="cotizar" aria-labelledby="cotizar-title" className="cut-top-rev max-lg:cv-auto relative overflow-hidden bg-paper pb-20 lg:pb-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(320px,0.75fr)_1.6fr] lg:gap-16 lg:px-10">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <h2 id="cotizar-title" className="slab font-display-x text-[clamp(1.9rem,6.4vw,3rem)] uppercase lg:text-[clamp(1.6rem,2.2vw,2.3rem)]">
            Cotizá tu P70
          </h2>
          <p className="titulo-cond mt-4 text-[clamp(1.6rem,4.4vw,2.2rem)] leading-[1.08] text-forest">
            {sel.elegida ? "Ya elegiste tu P70. Ahora contanos de vos." : "Elegí tu P70 y contanos de vos."}
          </p>

          {/* Resumen de la selección (el poster sale del mismo estudio claro del selector) */}
          <div className="mt-8 bg-estudio text-ink ring-1 ring-ink/10">
            <div className="relative aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl(sel.eq, sel.color)} alt="" loading="lazy" decoding="async" className="h-full w-full origin-[50%_62%] scale-[1.4] object-cover" />
            </div>
            <dl className="grid grid-cols-2 border-t border-ink/10 bg-white/70">
              <div className="p-4">
                <dt className="font-cond text-sm font-semibold text-stone uppercase">Nivel</dt>
                <dd className="mt-0.5 font-cond text-[1.25rem] font-semibold uppercase">{isPending(e.nombre) ? <Missing label={e.nombre} compact short="nombre" /> : e.nombre}</dd>
              </div>
              <div className="border-l border-ink/10 p-4">
                <dt className="font-cond text-sm font-semibold text-stone uppercase">Color</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold">
                  <span aria-hidden className="size-4 shrink-0 rounded-full ring-1 ring-ink/20" style={{ background: hexColor(c) }} />
                  {isPending(c.nombre) ? <Missing label={c.nombre} compact short={`color ${pad(ci + 1)}`} /> : c.nombre}
                </dd>
              </div>
            </dl>
            <a href="#armalo" onClick={irAlSelector} className="flex min-h-12 items-center justify-between border-t border-ink/10 bg-white/70 px-4 text-sm font-semibold text-forest hover:text-forest-deep">
              Cambiar nivel o color <span aria-hidden>↑</span>
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
