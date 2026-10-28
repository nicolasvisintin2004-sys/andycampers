"use client";

import Image, { getImageProps, type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { whenSettled } from "@/lib/settled";

export interface Slide {
  /** Foto (con Ken Burns) o clip de video (poster liviano + carga diferida). */
  tipo: "foto" | "video";
  img: StaticImageData;
  alt: string;
  rotulo: string;
  /** Solo video: ruta sin extensión (se sirven .webm y .mp4). */
  video?: string;
  /** Encuadre de la foto (object-position) en mobile y desktop. */
  pos?: { m: string; d: string };
  /** Dirección del Ken Burns. */
  kb?: { x: string; y: string };
}

const DURACION = 5200;

/**
 * Montaje del hero: fotos (y, cuando lleguen, clips) que se funden con un
 * Ken Burns lento. La primera foto es el LCP (priority + fetchpriority high);
 * las demás se montan recién cuando la página se asentó, así no compiten.
 */
export function HeroMontage({ slides }: { slides: Slide[] }) {
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    whenSettled().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Avanza solo mientras el hero está en pantalla.
  useEffect(() => {
    if (!ready || paused) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const t = setInterval(() => visible && document.visibilityState === "visible" && setI((x) => (x + 1) % slides.length), DURACION);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, [ready, paused, slides.length]);

  const s = slides[i];
  return (
    <div ref={root} className="absolute inset-0">
      {slides.map((sl, k) => {
        if (k > 0 && !ready) return null;
        const on = k === i;
        return (
          <div
            key={sl.rotulo}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-[1400ms] ease-[cubic-bezier(.4,0,.2,1)] ${on ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!on}
          >
            <div
              className={`absolute inset-0 ${on && ready ? "kenburns" : ""}`}
              style={{ "--kx": sl.kb?.x ?? "-1.5%", "--ky": sl.kb?.y ?? "-1%" } as React.CSSProperties}
              key={on ? `on-${i}` : "off"}
            >
              {k === 0 ? (
                <PrimeraFoto sl={sl} />
              ) : (
                <Image
                  src={sl.img}
                  alt={sl.alt}
                  fill
                  fetchPriority="low"
                  quality={75}
                  sizes="(min-width: 768px) 62vw, 100vw"
                  className="object-cover [object-position:var(--pos-m)] md:[object-position:var(--pos-d)]"
                  style={{ "--pos-m": sl.pos?.m ?? "50% 50%", "--pos-d": sl.pos?.d ?? "50% 50%" } as React.CSSProperties}
                />
              )}
              {sl.tipo === "video" && sl.video && ready && <HeroClip src={sl.video} on={on && !paused} />}
            </div>
          </div>
        );
      })}

      {/* HUD del montaje: rótulo + progreso */}
      <div className="absolute top-[calc(var(--bar-h)+0.75rem)] right-4 z-10 flex flex-col items-end gap-1 sm:right-6 md:top-auto md:right-10 md:bottom-[4.5rem]">
        <p className="font-cond text-[0.95rem] font-semibold text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.45)]" aria-live="off">
          {s.rotulo}
        </p>
        <div className="flex items-center gap-1.5">
          {slides.map((sl, k) => (
            <span key={sl.rotulo} className="relative h-[3px] w-6 overflow-hidden bg-bone/25">
              <span
                key={k === i ? `p-${i}` : `s-${k}`}
                className="absolute inset-0 origin-left bg-bone"
                style={
                  k === i && ready
                    ? { animation: `hero-progress ${DURACION}ms linear both`, animationPlayState: paused ? "paused" : "running" }
                    : { transform: `scaleX(${k < i || (k === i && !ready) ? 1 : 0})` }
                }
              />
            </span>
          ))}
          {ready && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="ml-1 grid size-11 place-items-center text-bone/70 hover:text-bone"
              aria-label={paused ? "Reanudar el montaje de fotos" : "Pausar el montaje de fotos"}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M7 4.5v15l12.5-7.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Clip del montaje: se pide recién cuando le toca y se pausa al salir. */
function HeroClip({ src, on }: { src: string; on: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (on) v.play().catch(() => {});
    else v.pause();
  }, [on]);
  return (
    <video ref={ref} muted loop playsInline preload="none" aria-hidden className="absolute inset-0 h-full w-full object-cover">
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}

/**
 * Primera foto del montaje.
 * - Desktop: la foto es el LCP (panel al 60 %): preload propio con media query
 *   y fetchpriority high, así en mobile no se descarga.
 * - Mobile: ocupa toda la pantalla (Chrome no la cuenta como LCP; el LCP es el
 *   texto). Se ve al instante su versión borrosa (viene en el HTML) y la foto
 *   real se pide después del evento load, sin competir con el texto.
 */
function PrimeraFoto({ sl }: { sl: Slide }) {
  const pos = { "--pos-m": sl.pos?.m ?? "50% 50%", "--pos-d": sl.pos?.d ?? "50% 50%" } as React.CSSProperties;
  const { props: d } = getImageProps({ src: sl.img, alt: sl.alt, fill: true, quality: 75, sizes: "62vw" });
  const [mobile, setMobile] = useState(false);
  const [lista, setLista] = useState(false);
  useEffect(() => {
    if (matchMedia("(min-width: 768px)").matches) return;
    const go = () => setMobile(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return (
    <>
      <link rel="preload" as="image" imageSrcSet={d.srcSet} imageSizes={d.sizes} fetchPriority="high" media="(min-width: 768px)" />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...d} loading="lazy" fetchPriority="high" className="hidden object-cover md:block md:[object-position:var(--pos-d)]" style={{ ...d.style, ...pos }} />
      <div
        aria-hidden
        className="absolute inset-0 scale-110 bg-cover blur-xl md:hidden"
        style={{ backgroundImage: `url(${sl.img.blurDataURL})`, backgroundPosition: sl.pos?.m ?? "50% 50%" }}
      />
      {mobile && (
        <Image
          src={sl.img}
          alt={sl.alt}
          fill
          quality={75}
          sizes="100vw"
          onLoad={() => setLista(true)}
          className={`object-cover transition-opacity duration-500 [object-position:var(--pos-m)] md:hidden ${lista ? "opacity-100" : "opacity-0"}`}
          style={pos}
        />
      )}
    </>
  );
}
