"use client";

import { useEffect, useRef, useState } from "react";
import { IconPause, IconPlay } from "@/components/ui/Icons";

/**
 * Video corto sin sonido que se reproduce AL TOCARLO (nada arranca solo).
 * Hasta entonces se ve el poster (que se pide recién cerca de la pantalla) con
 * un botón de play; el video se baja recién con el primer toque. Tocar de nuevo
 * lo pausa, y se pausa solo si sale de la pantalla.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className = "",
}: {
  /** Ruta sin extensión: se sirven .webm y .mp4. */
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [on, setOn] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const cerca = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" });
    const fuera = new IntersectionObserver(([e]) => !e.isIntersecting && v.pause(), { threshold: 0 });
    cerca.observe(v);
    fuera.observe(v);
    return () => {
      cerca.disconnect();
      fuera.disconnect();
    };
  }, []);

  // Primer toque: recién ahí se ponen las fuentes y arranca.
  useEffect(() => {
    const v = ref.current;
    if (!on || !v) return;
    v.load();
    v.play().catch(() => {});
  }, [on]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (!on) return setOn(true);
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        className={className}
        poster={near ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {on && (
          <>
            <source src={`${src}.webm`} type="video/webm" />
            <source src={`${src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? "Pausar" : "Reproducir"} video: ${label}`}
        className="group absolute inset-0 grid place-items-center"
      >
        <span
          className={`grid size-14 place-items-center rounded-full bg-white/90 text-forest transition-[opacity,background-color,color] duration-200 group-hover:bg-durazno group-hover:text-forest-deep ${
            playing ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : "opacity-100"
          }`}
        >
          {playing ? <IconPause className="size-5" /> : <IconPlay className="ml-0.5 size-5" />}
        </span>
      </button>
    </div>
  );
}
