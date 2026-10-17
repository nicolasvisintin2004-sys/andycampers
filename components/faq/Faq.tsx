import { faq } from "@/content/faq";
import { V } from "@/components/ui/Missing";
import { IconPlus } from "@/components/ui/Icons";
import { RevealTitle } from "@/components/ui/Reveal";

/** Acordeón con <details>: accesible y funciona sin JavaScript. */
export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="cv-auto bg-paper pb-24 lg:pb-32">
      <div className="mx-auto grid max-w-[1440px] gap-10 border-t-2 border-ink px-4 pt-14 sm:px-6 lg:grid-cols-[minmax(320px,0.75fr)_1.6fr] lg:gap-16 lg:px-10 lg:pt-20">
        <div>
          <p className="eyebrow text-orange-ink">Preguntas frecuentes</p>
          <RevealTitle id="faq-title" className="font-display-x mt-4 text-[clamp(2.1rem,8vw,3.6rem)] text-ink uppercase lg:text-[clamp(2rem,2.8vw,2.9rem)]" lines={["Lo que", "más nos", "preguntan."]} />
        </div>
        <div className="border-b border-ink/15">
          {faq.map((it) => (
            <details key={it.q} className="group border-t border-ink/15">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-5 text-lg font-semibold md:text-xl">
                <h3>{it.q}</h3>
                <IconPlus className="size-6 shrink-0 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <div className="max-w-3xl pb-6 text-base leading-relaxed text-ink/80 md:text-lg">
                <V v={it.a} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
