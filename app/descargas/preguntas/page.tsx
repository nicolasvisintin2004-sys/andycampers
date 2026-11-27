import type { Metadata } from "next";
import { faq } from "@/content/faq";
import { site } from "@/config/site";
import { isPending } from "@/lib/pending";
import { Missing } from "@/components/ui/Missing";
import { FlyerFooter, FlyerHeader } from "@/components/descargas/Flyer";
import { ConP70 } from "@/components/ui/LogoP70";

export const metadata: Metadata = { title: "Preguntas frecuentes (PDF)" };

/**
 * PDF de preguntas frecuentes (A4), con la tabla de los flyers de opcionales.
 * Lo imprime scripts/descargas.mjs → /descargas/andycampers-p70-preguntas-frecuentes.pdf.
 * Una pregunta abajo de la otra, en 2 hojas llenas, con la letra lo más grande que entra (Andrés, 27/11):
 * 5 preguntas en la primera hoja y el resto en la segunda; las cajas se reparten el alto de cada hoja.
 */
const EN_LA_PRIMERA = 5;

function Preguntas({ desde, hasta, className = "" }: { desde: number; hasta?: number; className?: string }) {
  return (
    <dl className={`flex flex-1 flex-col justify-between gap-2 px-8 pb-3 ${className}`}>
      {faq.slice(desde, hasta).map((f, j) => (
        <div key={f.q} className={`shrink-0 px-[26px] py-4 ${(desde + j) % 2 ? "bg-[#d9d9d9]" : "bg-white"}`}>
          <dt className="font-cond text-[1.57rem] leading-tight font-semibold uppercase">
            <ConP70 texto={f.q} />
          </dt>
          <dd className="mt-1 text-[1.38rem] leading-snug text-ink/85">{isPending(f.a) ? <Missing label={f.a} /> : f.a}</dd>
        </div>
      ))}
    </dl>
  );
}

const hoja = "flex h-[1122px] flex-col overflow-hidden";

export default function PreguntasPdf() {
  return (
    <main className="mx-auto w-[794px] bg-durazno text-ink">
      <style>{`@page{size:A4;margin:0}html,body{background:var(--color-durazno)}`}</style>
      <section className={`${hoja} break-after-page`}>
        <div className="pt-8">
          <FlyerHeader titulo="P70" chico />
        </div>
        <div className="px-8 pt-6 pb-4">
          <h1 className="titulo-cond text-[2.5rem] text-forest uppercase">Respuestas a preguntas frecuentes</h1>
        </div>
        <Preguntas desde={0} hasta={EN_LA_PRIMERA} />
      </section>
      <section className={hoja}>
        <Preguntas desde={EN_LA_PRIMERA} className="pt-8" />
        <p className="flex items-center gap-3 px-8 pt-2 pb-5 font-cond text-[1.15rem] font-semibold text-forest uppercase">
          <span aria-hidden className="text-[1.6rem] leading-none">↘</span> ¿Otra duda? Escribile a Andy al {site.whatsapp.display}
        </p>
        <FlyerFooter />
      </section>
    </main>
  );
}
