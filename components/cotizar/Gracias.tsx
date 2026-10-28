"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { colores, getColor, getEq, hexColor, nombreColor, nombreEq, posterUrl } from "@/config/p70";
import { waLink } from "@/config/site";
import { track } from "@/lib/analytics";
import { mensajeGracias } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/ui/Icons";
import { GRACIAS_KEY } from "./QuoteForm";


const mensajes: Record<string, { titulo: string; texto: string }> = {
  caliente: { titulo: "Andy te escribe hoy.", texto: "Ya tiene tu configuración y tus respuestas. Tené el WhatsApp a mano." },
  tibio: { titulo: "Te escribimos en estos días.", texto: "Andy revisa tu configuración y te contacta por WhatsApp con la cotización." },
  frio: { titulo: "Gracias por contarnos.", texto: "Cuando quieras avanzar, escribinos por WhatsApp: Andy te asesora sin compromiso." },
};

/** Pantalla de gracias: mensaje según la categoría (nunca el puntaje) + SU P70. */
export function Gracias() {
  const [d, setD] = useState<{ categoria?: string; eq?: number; color?: string } | null>(null);
  useEffect(() => {
    try {
      setD(JSON.parse(sessionStorage.getItem(GRACIAS_KEY) ?? "{}"));
    } catch {
      setD({});
    }
  }, []);

  const eq = getEq(d?.eq)?.n;
  const color = getColor(d?.color)?.id;
  const sel = eq && color ? { eq, color } : undefined;
  const m = mensajes[d?.categoria ?? ""] ?? mensajes.tibio;
  const ci = colores.findIndex((c) => c.id === color);

  return (
    <main id="contenido" className="relative min-h-[calc(100svh-var(--bar-h))] overflow-hidden bg-estudio text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-x-[-30%] top-[60%] bottom-[-40%] garage-floor" />
      <div className="relative mx-auto flex min-h-[calc(100svh-var(--bar-h))] max-w-[1440px] flex-col px-4 pt-10 pb-16 sm:px-6 lg:px-10">
        <div className="grid flex-1 items-center gap-10 py-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h1 className="slab font-display-x text-[clamp(2.6rem,11vw,5.5rem)] uppercase">¡Gracias!</h1>
            <p className="titulo-cond mt-6 max-w-xl text-[clamp(1.7rem,5vw,2.6rem)] leading-[1.08] text-forest">{d ? m.titulo : " "}</p>
            <p className="mt-4 max-w-md text-lg text-ink/80">{d ? m.texto : " "}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={waLink(mensajeGracias(sel))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("click_whatsapp", { ubicacion: "gracias", categoria: d?.categoria })}
                className="inline-flex min-h-14 items-center gap-3 bg-wa px-6 text-lg font-semibold text-white hover:bg-[#116b33]"
              >
                <IconWhatsApp className="size-6" /> Escribirle a Andy ahora
              </a>
              <Link href="/" className="inline-flex min-h-14 items-center px-6 text-lg font-semibold text-forest ring-1 ring-forest/40 ring-inset hover:ring-forest">
                Volver al inicio
              </Link>
            </div>
          </div>

          {sel && (
            <figure className="relative">
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl(sel.eq, sel.color)}
                  alt={`Tu P70: ${nombreEq(sel.eq)} en ${nombreColor(sel.color)}`}
                  className="h-full w-full object-cover [mask-image:radial-gradient(ellipse_50%_58%_at_50%_50%,#000_72%,transparent)]"
                />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-4">
                <span className="font-cond text-[1.05rem] font-semibold text-stone uppercase">Tu P70</span>
                <span className="flex items-center gap-3 font-cond text-[1.15rem] font-semibold uppercase">
                  {nombreEq(sel.eq)}
                  <span aria-hidden className="size-4 rounded-full ring-1 ring-ink/20" style={{ background: hexColor(colores[ci]) }} />
                  {nombreColor(sel.color)}
                </span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </main>
  );
}
