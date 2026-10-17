import Image from "next/image";
import { equipamientoDeSerie, ficha, precioDesde } from "@/config/p70";
import { media } from "@/content/media";
import { V } from "@/components/ui/Missing";
import { RevealTitle } from "@/components/ui/Reveal";
import { Enter } from "@/components/ui/Enter";

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Ficha técnica en HTML (nunca en imágenes) + lo que trae de serie. Solo versión Acero. */
export function Ficha() {
  return (
    <section aria-labelledby="ficha-title" className="cut-top-rev cv-auto paper-grid relative bg-cream pb-20 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div>
            <p className="eyebrow text-orange-ink">Ficha técnica · P70 Acero 100%</p>
            <RevealTitle
              id="ficha-title"
              className="font-display-x mt-4 text-[clamp(2.2rem,8vw,4.4rem)] text-ink uppercase"
              lines={["Los datos,", "sin vueltas."]}
            />
            <p className="mt-5 max-w-md text-lg text-ink/80">
              Exclusivo para camionetas. Precio base <strong className="tabular font-semibold text-ink">desde USD {usd.format(precioDesde)}</strong>; lo
              que suma cada equipamiento te lo pasa Andy con la cotización.
            </p>

            <Enter kind="diag" className="relative mt-10 hidden aspect-[4/5] max-w-md overflow-hidden bg-graphite lg:block">
              <Image
                src={media.naranjaBosque}
                alt="P70 estacionado en un bosque, vista lateral con la baulera frontal y el toldo cerrado"
                fill
                sizes="(min-width: 1024px) 28rem, 1px"
                className="object-cover"
                placeholder="blur"
              />
            </Enter>
          </div>

          <div>
            {ficha.map((g) => (
              <section key={g.grupo} aria-label={g.grupo} className="mb-10 last:mb-0">
                <h3 className="eyebrow border-b-2 border-ink pb-2 text-ink">{g.grupo}</h3>
                <dl>
                  {g.filas.map((f) => (
                    <div key={f.label} className="grid gap-1 border-b border-ink/15 py-3.5 sm:grid-cols-[minmax(180px,0.8fr)_1.4fr] sm:gap-6">
                      <dt className="text-sm font-semibold text-stone sm:text-base">{f.label}</dt>
                      <dd className="text-base text-ink sm:text-[1.05rem]">
                        <V v={f.valor} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <div className="mt-12 bg-ink p-6 text-bone sm:p-8">
              <p className="eyebrow text-orange-glow">De serie en todos los P70</p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {equipamientoDeSerie.map((it) => (
                  <li key={it} className="flex gap-3 text-[0.98rem] leading-snug">
                    <span aria-hidden className="mt-[0.5em] h-[2px] w-3 shrink-0 bg-orange" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
