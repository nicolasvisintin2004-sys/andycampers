import { fotos, media } from "@/content/media";
import { precioDesde } from "@/config/p70";
import { IconArrowDown } from "@/components/ui/Icons";
import { HeroMontage, type Slide } from "./HeroMontage";
import { HeroScrollFx } from "./HeroScrollFx";
import { HeroClips } from "./HeroClips";

/**
 * Hero "vender la experiencia".
 * Mobile: montaje arriba (el camper queda libre, las fotos son verticales) y el texto abajo.
 * Desktop: el texto sobre grafito a la izquierda y el montaje en un panel con
 * corte diagonal a la derecha (las fotos son de 1440 px: a pantalla completa en
 * un monitor grande se verían blandas).
 * El texto entra con CSS (no depende de JS) y es visible desde el primer cuadro.
 */
const slides: Slide[] = [
  {
    tipo: "foto",
    img: fotos.playa.img,
    alt: fotos.playa.alt,
    rotulo: "Ágil en la arena",
    pos: { m: "42% 72%", d: "50% 68%" },
    kb: { x: "-1.5%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: media.cordillera,
    alt: "P70 con camioneta en un camino de ripio frente a la cordillera nevada",
    rotulo: "Fuerte en el ripio",
    pos: { m: "50% 60%", d: "50% 55%" },
    kb: { x: "1.5%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: fotos.toldoTrasero.img,
    alt: fotos.toldoTrasero.alt,
    rotulo: "Práctico para acampar",
    pos: { m: "45% 45%", d: "50% 50%" },
    kb: { x: "-1%", y: "-1.5%" },
  },
  {
    tipo: "foto",
    img: fotos.interiorLed.img,
    alt: fotos.interiorLed.alt,
    rotulo: "Tu dormitorio en el bosque",
    pos: { m: "50% 40%", d: "50% 42%" },
    kb: { x: "1%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: fotos.camino.img,
    alt: fotos.camino.alt,
    rotulo: "Listo para salir",
    pos: { m: "55% 60%", d: "50% 62%" },
    kb: { x: "-1%", y: "1%" },
  },
];

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function Hero() {
  return (
    // Ocupa la pantalla entera, por debajo de la barra fija.
    <section aria-labelledby="hero-title" className="zona-oscura relative -mt-[var(--bar-h)] h-[100svh] min-h-[620px] overflow-hidden bg-forest-deep pt-[var(--bar-h)] text-white md:bg-forest">
      {/* Montaje: a sangre en mobile, panel en diagonal en desktop (la foto del flyer de presentación) */}
      <div data-hero-media className="absolute inset-x-0 top-0 h-[54%] md:inset-y-0 md:left-[40%] md:h-auto md:[clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]">
        <HeroMontage slides={slides} />
        {/* Mobile: la foto arriba, con el camper a la vista, y se funde con el verde donde empieza el texto */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(31_63_59)_0%,transparent_22%)] md:bg-none" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgb(22_24_27/0.45),transparent)]" />
      </div>

      <div data-hero-copy className="relative z-10 flex h-full flex-col justify-end px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 md:w-[44%] md:justify-center md:pr-4 md:pb-10 lg:px-10 xl:pl-16">
        <h1 id="hero-title" className="font-display-x text-[clamp(2.8rem,13vw,4.6rem)] uppercase md:text-[clamp(3rem,5.4vw,6.2rem)]">
          <span className="hero-line" style={{ "--i": 0 } as React.CSSProperties}>
            <span>Viajá</span>
          </span>
          <span className="hero-line" style={{ "--i": 1 } as React.CSSProperties}>
            <span>distinto.</span>
          </span>
        </h1>
        <p className="titulo-cond fade-up mt-4 max-w-[26rem] text-[clamp(1.35rem,5.6vw,1.75rem)] leading-[1.12] text-durazno md:text-[clamp(1.3rem,1.9vw,1.9rem)]" style={{ "--d": "380ms" } as React.CSSProperties}>
          Descubrí la vida que querés vivir moviéndote.
        </p>

        <div className="fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ "--d": "560ms" } as React.CSSProperties}>
          <a
            href="#armalo"
            className="group inline-flex min-h-14 items-center gap-3 bg-durazno px-7 text-lg font-semibold text-forest-deep transition-colors hover:bg-white"
          >
            Armá tu P70 <IconArrowDown className="size-5 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
          <p className="tabular font-cond text-[1.05rem] text-white/80">
            Desde <span className="font-semibold text-white">U$D {usd.format(precioDesde)}.-</span>
          </p>
        </div>

        <HeroClips />
      </div>

      <HeroScrollFx />
    </section>
  );
}
