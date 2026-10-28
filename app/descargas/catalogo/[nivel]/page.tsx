import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { equipamientoDeSerie, equipamientos, inicial, nombreEq, posterUrl, slugEq } from "@/config/p70";
import { site } from "@/config/site";
import { isPending } from "@/lib/pending";
import { Missing } from "@/components/ui/Missing";
import { FlyerFooter, FlyerHeader } from "@/components/descargas/Flyer";

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function generateStaticParams() {
  return equipamientos.map((e) => ({ nivel: slugEq(e.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ nivel: string }> }): Promise<Metadata> {
  const { nivel } = await params;
  const e = equipamientos.find((x) => slugEq(x.n) === nivel);
  return { title: e ? `Catálogo P70 ${nombreEq(e.n)}` : "Catálogo P70" };
}

/**
 * Una pieza del catálogo por nivel, vertical (540×960, se exporta a 1080×1920)
 * para guardarla en el celular, con la gráfica de los flyers.
 * La saca en JPG scripts/descargas.mjs → /descargas/andycampers-p70-{nivel}.jpg.
 */
export default async function CatalogoNivel({ params }: { params: Promise<{ nivel: string }> }) {
  const { nivel } = await params;
  const e = equipamientos.find((x) => slugEq(x.n) === nivel);
  if (!e) notFound();

  return (
    <main data-pieza className="mx-auto flex min-h-[960px] w-[540px] flex-col bg-durazno text-ink">
      <div className="pt-8">
        <FlyerHeader titulo="P70" chico />
      </div>

      <div className="px-8 pt-6">
        <h1 className="text-forest">
          <span className="block font-cond text-[3.1rem] leading-none font-semibold uppercase">{nombreEq(e.n)}</span>
          <span className="titulo-cond mt-1 block text-[1.35rem]">
            (nivel {e.n} de {equipamientos.length}, acero 100%)
          </span>
        </h1>
      </div>

      {/* El render del nivel, en el corte en diagonal de las fotos de los flyers */}
      <div className="mt-5 ml-8 aspect-[16/9] overflow-hidden bg-estudio [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={posterUrl(e.n, inicial.color)} alt="" className="h-full w-full origin-[50%_62%] scale-[1.4] object-cover" />
      </div>

      <div className="px-8 pt-5">
        {isPending(e.precio) ? (
          <Missing label={e.precio} />
        ) : (
          <p className="tabular font-cond text-[2.4rem] leading-none font-light">U$D {usd.format(e.precio)}.-</p>
        )}
        <div className="mt-3 text-[1.05rem] text-ink/85">{isPending(e.descripcion) ? <Missing label={e.descripcion} /> : <p>{e.descripcion}</p>}</div>
      </div>

      <div className="px-8 pt-5">
        <p className="font-cond text-[1.2rem] font-semibold text-forest uppercase">Incluye</p>
        {isPending(e.incluye) ? (
          <Missing label={e.incluye} className="mt-1" />
        ) : (
          <ul className="mt-1 space-y-1 text-[1rem] leading-snug font-semibold">
            {e.incluye.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-8 pt-5">
        <p className="text-forest">
          <span className="titulo-cond text-[1.5rem] uppercase">Equipamiento base</span>{" "}
          <span className="titulo-cond text-[1.1rem]">(en todos los P70)</span>
        </p>
        <ul className="mt-1.5 space-y-0.5 text-[0.9rem] leading-snug text-ink/85">
          {equipamientoDeSerie.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </div>

      <p className="mt-auto flex items-center gap-2.5 px-8 pt-6 pb-5 font-cond text-[1.15rem] font-semibold text-forest uppercase">
        <span aria-hidden className="text-[1.5rem] leading-none">↘</span> Pedí tu cotización en {site.dominio}
      </p>
      <FlyerFooter />
    </main>
  );
}
