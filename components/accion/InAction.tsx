import { clips, type ClipKey } from "@/content/media";
import { site } from "@/config/site";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Missing } from "@/components/ui/Missing";
import { IconInstagram } from "@/components/ui/Icons";
import { Enter } from "@/components/ui/Enter";

/**
 * "En acción": clips cortos reales. Se reproducen al tocarlos (sin sonido) y se
 * pausan al salir de la pantalla (LazyVideo). Los destacados de Instagram que
 * todavía no tenemos como archivo van como espacio con cartel rojo.
 */
type Item = { clip: ClipKey } | { falta: string; titulo: string };

const items: Item[] = [
  { clip: "medanos" },
  { titulo: "Nieve", falta: "clip original de Nieve (destacado de Instagram)" },
  { titulo: "Frenar en curva", falta: "clip original de Frenar en curva" },
  { titulo: "Estacionando", falta: "clip original de Estacionando" },
  { titulo: "Protecciones", falta: "clip original de Protecciones" },
  { clip: "cocinaPlaya" },
  { clip: "despertar" },
  { clip: "agua" },
];

export function InAction() {
  return (
    <section aria-labelledby="accion-title" className="zona-oscura cut-top cv-auto relative overflow-hidden bg-forest-deep pb-20 text-bone lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="accion-title" className="slab font-display-x text-[clamp(1.9rem,6.4vw,3.2rem)] uppercase [--slab-bg:var(--color-durazno)] [--slab-fg:var(--color-forest-deep)]">
              En acción
            </h2>
            <p className="titulo-cond mt-4 text-[clamp(1.6rem,4.4vw,2.4rem)] text-durazno">Probado donde se complica.</p>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-3 font-semibold text-bone hover:text-menta"
          >
            <IconInstagram className="size-6" /> Más en {site.social.instagramHandle}
          </a>
        </div>
      </div>

      <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10 lg:overflow-visible lg:px-10">
        {items.map((it, i) => (
          <Enter as="li" key={"clip" in it ? it.clip : it.titulo} i={i} className="w-[64vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <figure>
              <div className="relative aspect-[9/16] overflow-hidden bg-forest lg:aspect-[4/5]">
                {"clip" in it ? (
                  <LazyVideo src={clips[it.clip].src} poster={clips[it.clip].poster} label={clips[it.clip].alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center p-4 outline-2 -outline-offset-2 outline-falta outline-dashed">
                    <Missing label={it.falta} />
                  </div>
                )}
              </div>
              <figcaption className="mt-3 font-cond text-[1.05rem] font-semibold uppercase">{"clip" in it ? clips[it.clip].titulo : it.titulo}</figcaption>
            </figure>
          </Enter>
        ))}
      </ul>
    </section>
  );
}
