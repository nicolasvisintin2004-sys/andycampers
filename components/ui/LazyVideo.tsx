"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video corto sin sonido: carga recién cerca de la pantalla, se reproduce
 * al entrar y se pausa al salir. Con reduced-motion muestra el poster y los
 * controles nativos: no arranca solo, pero se puede reproducir a mano.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className = "",
  eager = false,
  overlay = false,
}: {
  /** Ruta sin extensión: se sirven .webm y .mp4. */
  src: string;
  poster: string;
  label: string;
  className?: string;
  /** Cargar apenas termina la carga de la página (hero). */
  eager?: boolean;
  /**
   * Va encima de una imagen que ya hace de poster (hero): no pide el poster
   * de nuevo y aparece recién cuando el video arranca.
   */
  overlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      if (overlay) return; // el hero ya muestra su imagen fija
      const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "300px" });
      near.observe(v);
      return () => near.disconnect();
    }

    if (eager) {
      // Solo si está visible (el hero tiene una versión mobile y otra desktop).
      const start = () => v.getClientRects().length > 0 && setLoad(true);
      if (document.readyState === "complete") setTimeout(start, 300);
      else window.addEventListener("load", () => setTimeout(start, 300), { once: true });
    }

    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "300px" });
    const vis = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    near.observe(v);
    vis.observe(v);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, [eager, overlay]);

  useEffect(() => {
    if (load && !reduced) ref.current?.load();
  }, [load, reduced]);

  return (
    <video
      ref={ref}
      className={`${className} transition-opacity duration-700 ${overlay && !playing ? "opacity-0" : "opacity-100"}`}
      // El poster se pide recién cerca de la pantalla (los de abajo no compiten con el LCP).
      poster={overlay ? undefined : eager || load ? poster : undefined}
      muted
      loop
      playsInline
      controls={reduced && !overlay}
      preload="none"
      aria-label={label}
      onPlaying={() => setPlaying(true)}
      onCanPlay={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) e.currentTarget.play().catch(() => {});
      }}
    >
      {load && (
        <>
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}
