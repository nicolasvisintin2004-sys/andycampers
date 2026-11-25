import { fotos, media } from "@/content/media";
import { precioDesde } from "@/config/p70";
import { IconArrowDown } from "@/components/ui/Icons";
import { HeroMontage, type Slide } from "./HeroMontage";
import { HeroScrollFx } from "./HeroScrollFx";
import { HeroFotos } from "./HeroFotos";
import { HeroAjuste } from "./HeroAjuste";
import { LogoP70 } from "@/components/ui/LogoP70";

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

      <div data-hero-copy className="@container relative z-10 flex h-full flex-col justify-end px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 md:w-[44%] md:justify-center md:pr-4 md:pb-10 lg:px-10 xl:pl-16">
        {/* Sin "Viajá distinto." (Andrés, 25/11): queda el P70 a la derecha y el texto de abajo, del ancho justo
            para que "vivir" termine donde termina el 0. 12,15 = ancho del primer renglón en em (Barlow Semi
            Condensed Light); 100cqw = ancho de esta columna. */}
        <h1 id="hero-title" className="font-display-x flex justify-end text-[min(8.4vw,3.4rem)] uppercase md:text-[clamp(1.75rem,3.7vw,4.6rem)]">
          <span className="fade-up block" style={{ "--d": "200ms" } as React.CSSProperties}>
            <LogoP70 a10grados title="Camper P70" className="block h-[1.3em] w-auto text-durazno md:h-[1.5em]" />
          </span>
        </h1>
        <p className="titulo-cond fade-up mt-3 text-[calc(100cqw/12.15)] leading-[1.1] text-durazno" style={{ "--d": "380ms" } as React.CSSProperties}>
          <span data-hero-renglon className="whitespace-nowrap">Descubrí la vida que querés vivir</span>
          <br />
          moviéndote.
        </p>

        <div className="fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ "--d": "560ms" } as React.CSSProperties}>
          {/* La diagonal y la letra de Rumbo / Terra / Cima con las puntas redondeadas (22/11), un 15% más grande y
              con contorno negro para que se lea como botón (25/11). El ancho sale de la grilla de Niveles (Selector.tsx). */}
          <a
            href="#armalo"
            className="group ml-[6px] inline-flex h-[3.45rem] w-[calc((min(100vw,36rem)-3.5rem)/3*1.15)] -skew-x-12 items-center justify-center rounded-[10px] border-2 border-ink bg-durazno font-semibold text-forest-deep transition-colors hover:bg-white sm:w-[calc((min(100vw,36rem)-4rem)/3*1.15)] lg:h-[3.75rem] lg:w-[calc((36rem-2.5rem)/3*1.15)]"
          >
            <span className="inline-flex skew-x-12 items-center gap-[3px] font-cond text-[length:min(1.17rem,4.6vw)] whitespace-nowrap uppercase sm:gap-2 lg:text-[1.3rem]">
              Armá tu P70
              <IconArrowDown className="size-[13px] transition-transform duration-300 group-hover:translate-y-0.5 max-[22rem]:hidden sm:size-[18px]" />
            </span>
          </a>
          <p className="tabular font-cond text-[1.05rem] text-white/80">
            Desde <span className="font-semibold text-white">U$D {usd.format(precioDesde)}.-</span>
          </p>
        </div>

        <HeroFotos />
      </div>

      <HeroScrollFx />
      <HeroAjuste />
    </section>
  );
}
