import { clips } from "@/content/media";
import { site } from "@/config/site";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { IconInstagram } from "@/components/ui/Icons";
import { Enter } from "@/components/ui/Enter";

/**
 * "En acción": los videos reales. Se reproducen al tocarlos, con sonido, y se
 * pausan al salir de la pantalla (LazyVideo). El último lugar lleva a Instagram.
 */
export function InAction() {
  return (
    <section aria-labelledby="accion-title" className="zona-oscura cv-auto relative overflow-hidden bg-forest-deep pt-14 pb-20 text-bone lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <h2 id="accion-title" className="slab font-display-x text-[clamp(1.9rem,6.4vw,3.2rem)] uppercase [--slab-bg:var(--color-durazno)] [--slab-fg:var(--color-forest-deep)]">
          En acción
        </h2>
        <p className="titulo-cond mt-4 text-[clamp(1.6rem,4.4vw,2.4rem)] text-durazno">Probado donde se complica.</p>
      </div>

      <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10 lg:overflow-visible lg:px-10">
        {Object.values(clips).map((c, i) => (
          <Enter as="li" key={c.src} i={i} className="w-[64vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <figure>
              <div className="relative aspect-[9/16] overflow-hidden bg-forest">
                <LazyVideo src={c.src} poster={c.poster} label={c.alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 font-cond text-[1.05rem] font-semibold uppercase">{c.titulo}</figcaption>
            </figure>
          </Enter>
        ))}
        <Enter as="li" i={7} className="w-[64vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex aspect-[9/16] flex-col justify-end gap-3 bg-forest p-5 font-cond text-[1.5rem] leading-tight font-semibold text-white transition-colors hover:bg-durazno hover:text-forest-deep"
          >
            <IconInstagram className="size-9" />
            Más videos en {site.social.instagramHandle}
          </a>
        </Enter>
      </ul>
    </section>
  );
}
