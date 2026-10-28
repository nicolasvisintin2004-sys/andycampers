"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { posterUrl, videoSelector } from "@/config/p70";
import { VideoSwitcher, type SwitcherState } from "@/lib/video-switcher";
import { useSettled, whenSettled } from "@/lib/settled";
import { Pedestal, pedestalTransform } from "./Pedestal";
import { IconPause, IconPlay } from "@/components/ui/Icons";

export interface StageHandle {
  /** Hover / foco / dedo apoyado sobre una opción. */
  prime: (eq: number, color: string) => void;
  /** Momento del clic, para medir la latencia hasta el fundido. */
  markClick: () => void;
  latency: () => number;
}

/**
 * Escenario del selector: los dos videos (A/B), el poster mientras carga,
 * el pedestal (si los renders no traen base) y el barrido al cambiar de opción.
 * El cuadro es 16:9 y sus medidas salen de las variables CSS del contenedor
 * (ver .stage-box en Selector), así el pedestal coincide con el piso del render.
 */
export const Stage = forwardRef<StageHandle, { eq: number; color: string; scanKey: number; label: string }>(function Stage(
  { eq, color, scanKey, label },
  ref,
) {
  const wrap = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const ring = useRef<SVGGElement>(null);
  const sw = useRef<VideoSwitcher | null>(null);
  const clickAt = useRef(0);
  const [st, setSt] = useState<SwitcherState>({ front: 0, loading: false, started: false });
  // El camper gira recién cuando la persona toca "Ver girar" (nada se mueve ni se baja solo).
  const [playing, setPlaying] = useState(false);
  const [booted, setBooted] = useState(false);
  const shown = useRef({ eq, color });
  const pedido = useRef(false);
  const settled = useSettled();

  useImperativeHandle(ref, () => ({
    prime: (e, c) => sw.current?.prime(e, c),
    markClick: () => (clickAt.current = performance.now()),
    latency: () => sw.current?.lastLatency ?? 0,
  }));

  // Arranque: recién cuando la sección está cerca y la página ya se asentó (no compite con el LCP).
  // Solo prepara el video: no lo reproduce ni precarga otros hasta que se toque "Ver girar".
  useEffect(() => {
    const el = wrap.current;
    if (!el || !a.current || !b.current) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = Boolean(conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? ""));
    const res = matchMedia("(min-width: 1024px)").matches && !slow ? "desktop" : "mobile";
    const ext = a.current.canPlayType('video/mp4; codecs="avc1.640028"') ? "mp4" : "webm";
    const s = new VideoSwitcher(a.current, b.current, res, ext, { allowPlay: false, noPreload: slow }, setSt);
    sw.current = s;

    let started = false;
    const vis = new IntersectionObserver(
      ([e]) => {
        s.setActive(e.isIntersecting);
        if (e.isIntersecting && !started) {
          started = true;
          whenSettled().then(() => {
            s.init(shown.current.eq, shown.current.color);
            s.setActive(true);
            setBooted(true);
            // Tocaron "Ver girar" antes de que el motor estuviera listo.
            if (pedido.current) s.play();
          });
        }
      },
      { rootMargin: "200px 0px" },
    );
    vis.observe(el);
    return () => {
      vis.disconnect();
      s.dispose();
      sw.current = null;
    };
  }, []);

  // Cambio de combinación
  useEffect(() => {
    shown.current = { eq, color };
    const s = sw.current;
    if (!s || !booted) return;
    void s.show(eq, color, clickAt.current || performance.now());
    clickAt.current = 0;
    s.queueNeighbors(eq, color);
  }, [eq, color, booted]);

  // El pedestal y la lectura de rumbo giran con el video (sin re-render de React).
  useEffect(() => {
    if (!playing || videoSelector.renderIncludesFloor) return;
    let raf = 0;
    const loop = () => {
      ring.current?.setAttribute("transform", pedestalTransform(sw.current?.angle() ?? 0));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const togglePlay = () => {
    const s = sw.current;
    pedido.current = !playing;
    if (s && booted) {
      if (playing) s.pause();
      else s.play();
    }
    setPlaying(!playing);
  };

  // El poster (primer cuadro) solo antes de arrancar o mientras carga un video nuevo
  // girando. En pausa queda visible el cuadro donde iba el giro (aunque cargue otro).
  const showPoster = !st.started || (st.loading && playing);
  // Ya se tocó "Ver girar" pero el video todavía no arrancó.
  const arrancando = playing && !st.started;
  const videoCls = "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out";

  return (
    <>
    <div ref={wrap} className="stage-box" data-loading={st.loading || undefined}>
      <div className="stage-video absolute inset-0">
        {/* Poster: antes de arrancar, mientras carga un video nuevo, o con movimiento reducido */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={settled ? posterUrl(eq, color) : undefined}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${showPoster ? "z-[3] opacity-100" : "z-0 opacity-0"}`}
        />
        <video
          ref={a}
          muted
          loop
          playsInline
          autoPlay={false}
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          className={`${videoCls} ${st.front === 0 ? "z-[2] opacity-100" : "z-[1] opacity-0"}`}
        />
        <video
          ref={b}
          muted
          loop
          playsInline
          autoPlay={false}
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          className={`${videoCls} ${st.front === 1 ? "z-[2] opacity-100" : "z-[1] opacity-0"}`}
        />
      </div>

      {!videoSelector.renderIncludesFloor && <Pedestal ref={ring} className="absolute inset-0 z-[4] h-full w-full" />}

      {/* Barrido de escaneo al cambiar de opción */}
      {scanKey > 0 && (
        <div key={scanKey} aria-hidden className="pointer-events-none absolute inset-x-[18%] top-[22%] bottom-[14%] z-[5] overflow-hidden">
          <div className="scan-sweep absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent_0%,transparent_45%,rgb(46_88_83/0.18)_48.5%,rgb(46_88_83/0.5)_50%,rgb(46_88_83/0.18)_51.5%,transparent_55%)]" />
        </div>
      )}

      {st.loading && (
        <span role="status" className="absolute top-1/2 left-1/2 z-[6] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-white/90 px-3 py-1.5 font-cond text-sm font-semibold text-ink uppercase shadow-sm">
          <span aria-hidden className="size-3 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-ink/15 border-t-forest" />
          Cargando
        </span>
      )}

      {/* Antes del primer giro: botón grande sobre el camper */}
      {!st.started && (
        <button
          type="button"
          onClick={togglePlay}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={arrancando}
          className="group absolute top-[44%] left-1/2 z-[6] inline-flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-forest py-1.5 pr-5 pl-1.5 font-cond text-[1.02rem] font-semibold tracking-[0.03em] text-white uppercase shadow-[0_10px_24px_-12px_rgb(31_63_59/0.9)] transition-colors hover:bg-forest-deep"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white text-forest">
            {arrancando ? (
              <span aria-hidden className="size-4 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-forest/25 border-t-forest" />
            ) : (
              <IconPlay className="ml-0.5 size-4" />
            )}
          </span>
          {arrancando ? "Cargando" : "Ver girar 360°"}
        </button>
      )}

      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </div>

    {/* Ya arrancó: pausar / seguir girando, chico en la esquina */}
    {st.started && (
      <button
        type="button"
        onClick={togglePlay}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1 right-4 z-[7] inline-flex min-h-11 items-center gap-2 px-2 font-cond text-[0.95rem] font-semibold text-ink/70 uppercase transition-colors hover:text-ink sm:right-6 lg:right-0"
      >
        {playing ? <><IconPause className="size-4" /> Pausar</> : <><IconPlay className="size-4" /> Girar</>}
      </button>
    )}
    </>
  );
});
