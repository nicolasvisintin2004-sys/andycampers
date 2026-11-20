"use client";

import { QuoteFormLazy } from "./QuoteFormLazy";

/**
 * "Queremos saber de vos" y el formulario ahí mismo, en la página (Andrés, 20/11:
 * sin "Cotizá tu P70" ni el resumen; el nivel y el color elegidos igual viajan con el formulario).
 */
export function Cotizar() {
  return (
    <section id="cotizar" aria-labelledby="cotizar-title" className="max-lg:cv-auto relative overflow-hidden bg-paper pt-10 pb-12 lg:pt-14 lg:pb-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 id="cotizar-title" className="slab font-display-x text-[clamp(1.9rem,6.4vw,3rem)] uppercase lg:text-[clamp(1.6rem,2.2vw,2.3rem)]">
          Queremos saber de vos
        </h2>
        <div className="mt-7 max-w-[56rem] lg:mt-9">
          <QuoteFormLazy />
        </div>
      </div>
    </section>
  );
}
