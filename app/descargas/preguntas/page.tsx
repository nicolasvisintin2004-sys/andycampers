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
 * Tiene que entrar en una sola hoja (Andrés, 20/11): las preguntas van en dos columnas.
 */
export default function PreguntasPdf() {
  return (
    <main className="mx-auto flex min-h-[1120px] w-[794px] flex-col bg-durazno text-ink">
      <style>{`@page{size:A4;margin:0}html,body{background:var(--color-durazno)}`}</style>
      <div className="pt-8">
        <FlyerHeader titulo="P70" chico />
      </div>
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-forest">
          <span className="titulo-cond block text-[2.5rem] uppercase">Respuestas a preguntas frecuentes</span>
          <span className="titulo-cond mt-1 block text-[1.3rem]">(camper P70 acero 100%)</span>
        </h1>
      </div>
      <dl className="columns-2 gap-x-3 px-8">
        {faq.map((f, i) => (
          <div key={f.q} className={`mb-2.5 break-inside-avoid px-4 py-2.5 ${i % 2 ? "bg-[#d9d9d9]" : "bg-white"}`}>
            <dt className="font-cond text-[0.98rem] leading-tight font-semibold uppercase">{f.q}</dt>
            <dd className="mt-1 text-[0.86rem] leading-snug text-ink/85">{isPending(f.a) ? <Missing label={f.a} /> : f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-auto flex items-center gap-3 px-8 pt-2 pb-5 font-cond text-[1.15rem] font-semibold text-forest uppercase">
        <span aria-hidden className="text-[1.6rem] leading-none">↘</span> ¿Otra duda? Escribile a Andy al {site.whatsapp.display}
      </p>
      <FlyerFooter />
    </main>
  );
}
