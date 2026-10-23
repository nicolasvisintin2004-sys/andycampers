import { media } from "@/content/media";
import { site } from "@/config/site";
import { precioDesde } from "@/config/p70";
import { Missing } from "@/components/ui/Missing";
import { IconArrowDown } from "@/components/ui/Icons";
import { HeroMontage, type Slide } from "./HeroMontage";
import { HeroScrollFx } from "./HeroScrollFx";
import { HeroClips } from "./HeroClips";

/**
 * Hero "vender la experiencia".
 * Mobile: montaje a sangre (100svh) con el texto abajo.
 * Desktop: el texto sobre grafito a la izquierda y el montaje en un panel con
 * corte diagonal a la derecha (las fotos son de 1440 px: a pantalla completa en
 * un monitor grande se verían blandas).
 * El texto entra con CSS (no depende de JS) y es visible desde el primer cuadro.
 */
const slides: Slide[] = [
  {
    tipo: "foto",
    img: media.ruta,
    alt: "P70 enganchado a la camioneta en la banquina de una ruta al atardecer",
    rotulo: "Ruta · Atardecer",
    pos: { m: "56% 60%", d: "60% 62%" },
    kb: { x: "-1.5%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: media.cordillera,
    alt: "P70 con camioneta en un camino de ripio frente a la cordillera nevada",
    rotulo: "Ripio · Cordillera",
    pos: { m: "50% 60%", d: "50% 55%" },
    kb: { x: "1.5%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: media.nieve,
    alt: "P70 enganchado a la camioneta durante una nevada",
    rotulo: "Nieve",
    pos: { m: "34% 70%", d: "50% 70%" },
    kb: { x: "-1%", y: "-1.5%" },
  },
  {
    tipo: "foto",
    img: media.playaMedanos,
    alt: "Camioneta y P70 en una playa amplia con médanos y el mar de fondo",
    rotulo: "Playa · Médanos",
    pos: { m: "70% 76%", d: "60% 74%" },
    kb: { x: "1%", y: "-1%" },
  },
  {
    tipo: "foto",
    img: media.cocina,
    alt: "Cocina baulera del P70 desplegada al aire libre, con anafe de dos hornallas",
    rotulo: "Cocina al aire libre",
    pos: { m: "45% 60%", d: "45% 58%" },
    kb: { x: "-1%", y: "1%" },
  },
];

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function Hero() {
  return (
    // Ocupa la pantalla entera, por debajo de la barra fija: así la foto de mobile (que
    // llega después del load) es "de fondo" para Chrome y el LCP sigue siendo el texto.
    <section aria-labelledby="hero-title" className="relative -mt-[var(--bar-h)] h-[100svh] min-h-[620px] overflow-hidden bg-ink pt-[var(--bar-h)] text-bone">
      {/* Montaje: a sangre en mobile, panel diagonal en desktop */}
      <div data-hero-media className="absolute inset-0 md:left-[40%] md:[clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]">
        <HeroMontage slides={slides} />
        {/* Grano de película solo desde tablet (en mobile era un pedido de prioridad alta más) */}
        <div aria-hidden className="grain-layer pointer-events-none absolute inset-0 hidden md:block" />
        {/* Lectura del texto: degradé abajo (mobile) / a la izquierda (desktop), no un velo plano */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(22_24_27/0.94)_0%,rgb(22_24_27/0.6)_36%,transparent_62%)] md:bg-[linear-gradient(to_right,rgb(22_24_27/0.55)_0%,transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgb(22_24_27/0.6),transparent)]" />
      </div>
      {/* Desktop: retícula de plano detrás del texto */}
      <div aria-hidden className="blueprint-grid absolute inset-y-0 left-0 hidden w-[46%] [mask-image:linear-gradient(to_right,#000_60%,transparent)] md:block" />

      <div data-hero-copy className="relative z-10 flex h-full flex-col justify-end px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 md:w-[46%] md:justify-center md:pr-6 md:pb-10 lg:px-10 xl:pl-16">
        <p className="eyebrow fade-up mb-5 text-bone/85" style={{ "--d": "40ms" } as React.CSSProperties}>
          P70 · Acero 100% · Hecho en Argentina
        </p>
        <h1 id="hero-title" className="font-display-x text-[clamp(2.7rem,12.6vw,4.6rem)] uppercase md:text-[clamp(3rem,5.4vw,6.4rem)]">
          <span className="hero-line" style={{ "--i": 0 } as React.CSSProperties}>
            <span>Viajá</span>
          </span>
          <span className="hero-line" style={{ "--i": 1 } as React.CSSProperties}>
            <span>
              distinto<span className="text-orange">.</span>
            </span>
          </span>
        </h1>
        <p className="mt-4 max-w-[30rem] font-display-x text-[clamp(1.15rem,5.2vw,1.6rem)] leading-[1.05] text-bone/90 uppercase md:text-[clamp(1.1rem,1.7vw,1.8rem)]">
          <span className="hero-line" style={{ "--i": 2 } as React.CSSProperties}>
            <span>Con libertad y comodidad,</span>
          </span>
          <span className="hero-line" style={{ "--i": 3 } as React.CSSProperties}>
            <span className="text-orange-glow">llevando el camping a otro nivel.</span>
          </span>
        </p>
        <p className="fade-up mt-5 max-w-sm text-bone/80" style={{ "--d": "520ms" } as React.CSSProperties}>
          {site.lema}
        </p>

        <div className="fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ "--d": "620ms" } as React.CSSProperties}>
          <a
            href="#armalo"
            className="group inline-flex min-h-14 items-center gap-3 bg-orange-cta px-7 text-lg font-semibold text-ink transition-colors hover:bg-[#f47b52]"
          >
            Armá tu P70 <IconArrowDown className="size-5 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
          <p className="tabular font-mono text-xs tracking-[0.14em] text-bone/70 uppercase">Desde USD {usd.format(precioDesde)}</p>
        </div>

        <HeroClips />
      </div>

      {/* El cartel del dato faltante, arriba a la derecha (fuera del texto) */}
      <div className="absolute top-[calc(var(--bar-h)+3.5rem)] right-4 z-10 sm:right-6 md:top-[calc(var(--bar-h)+1.25rem)] lg:right-10">
        <Missing label="clips reales de los reels para el fondo del hero (ruta, off-road, nieve, playa, noche con estrellas, cocina)" compact short="clips del hero" />
      </div>

      <HeroScrollFx />
    </section>
  );
}
