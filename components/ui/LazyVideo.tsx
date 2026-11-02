"use client";

import { useEffect, useRef, useState } from "react";
import { IconPlay } from "@/components/ui/Icons";

/**
 * Video que se reproduce AL TOCARLO y con sonido (nada arranca solo). Hasta
 * entonces se ve el poster (que se pide recién cerca de la pantalla) con un botón
 * de play; el video se baja recién con el primer toque y ahí aparecen los
 * controles del navegador. Suena uno solo a la vez y se pausa si sale de la pantalla.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className = "",
}: {
  /** Ruta sin extensión: se sirve el .mp4. */
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [on, setOn] = useState(false);

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

  const empezar = () => {
    const v = ref.current;
    if (!v) return;
    setOn(true);
    v.src = `${src}.mp4`;
    v.play().catch(() => {});
  };

  const pausarLosDemas = () => {
    document.querySelectorAll<HTMLVideoElement>("video[data-con-sonido]").forEach((o) => o !== ref.current && o.pause());
  };

  return (
    <div className="relative h-full w-full">
      <video ref={ref} data-con-sonido className={className} poster={near ? poster : undefined} controls={on} playsInline preload="none" aria-label={label} onPlay={pausarLosDemas} />
      {!on && (
        <button type="button" onClick={empezar} aria-label={`Reproducir video: ${label}`} className="group absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-forest transition-colors duration-200 group-hover:bg-durazno group-hover:text-forest-deep">
            <IconPlay className="ml-0.5 size-5" />
          </span>
        </button>
      )}
    </div>
  );
}
