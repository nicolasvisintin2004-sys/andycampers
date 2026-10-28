import type { Metadata } from "next";
import { faq } from "@/content/faq";
import { site } from "@/config/site";
import { isPending } from "@/lib/pending";
import { Missing } from "@/components/ui/Missing";
import { FlyerFooter, FlyerHeader } from "@/components/descargas/Flyer";

export const metadata: Metadata = { title: "Preguntas frecuentes (PDF)" };

/**
 * PDF de preguntas frecuentes (A4), con la tabla de los flyers de opcionales.
 * Lo imprime scripts/descargas.mjs → /descargas/andycampers-p70-preguntas-frecuentes.pdf.
 */
export default function PreguntasPdf() {
  return (
    <main className="mx-auto w-[794px] bg-durazno text-ink">
      <style>{`@page{size:A4;margin:0}html,body{background:var(--color-durazno)}`}</style>
      <div className="pt-10">
        <FlyerHeader titulo="P70" chico />
      </div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-forest">
          <span className="titulo-cond block text-[3rem] uppercase">Preguntas frecuentes</span>
          <span className="titulo-cond mt-1 block text-[1.5rem]">(camper P70 acero 100%)</span>
        </h1>
      </div>
      <dl>
        {faq.map((f, i) => (
          <div key={f.q} className={`break-inside-avoid px-8 py-4 ${i % 2 ? "bg-[#d9d9d9]" : "bg-white"}`}>
            <dt className="font-cond text-[1.1rem] font-semibold uppercase">{f.q}</dt>
            <dd className="mt-1 text-[1.02rem] leading-snug text-ink/85">{isPending(f.a) ? <Missing label={f.a} /> : f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="flex items-center gap-3 px-8 py-6 font-cond text-[1.2rem] font-semibold text-forest uppercase">
        <span aria-hidden className="text-[1.6rem] leading-none">↘</span> ¿Otra duda? Escribile a Andy al {site.whatsapp.display}
      </p>
      <FlyerFooter />
    </main>
  );
}
