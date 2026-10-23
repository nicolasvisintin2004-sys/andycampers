"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { colores, getColor, getEq, hexColor, nombreColor, nombreEq, posterUrl } from "@/config/p70";
import { waLink } from "@/config/site";
import { track } from "@/lib/analytics";
import { mensajeGracias } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/ui/Icons";
import { Wordmark } from "@/components/ui/Wordmark";
import { GRACIAS_KEY } from "./QuoteForm";

const pad = (n: number) => String(n).padStart(2, "0");

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
    <main id="contenido" className="relative min-h-[100svh] overflow-hidden bg-garage text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-x-[-30%] top-[60%] bottom-[-40%] garage-floor" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-4 pt-6 pb-16 sm:px-6 lg:px-10">
        <Link href="/" className="inline-flex min-h-11 w-fit items-center">
          <Wordmark />
        </Link>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow text-orange-glow">Consulta recibida</p>
            <h1 className="font-display-x mt-4 text-[clamp(3rem,13vw,7.5rem)] uppercase">¡Gracias!</h1>
            <p className="mt-6 max-w-xl font-display-x text-[clamp(1.5rem,5vw,2.4rem)] leading-[1.05] uppercase">{d ? m.titulo : " "}</p>
            <p className="mt-4 max-w-md text-lg text-bone/80">{d ? m.texto : " "}</p>

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
              <Link href="/" className="inline-flex min-h-14 items-center px-6 text-lg font-semibold ring-1 ring-bone/40 ring-inset hover:ring-bone">
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
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <span className="eyebrow text-mist">Tu P70</span>
                <span className="flex items-center gap-3 font-semibold">
                  <span className="tabular font-mono text-xs text-mist">EQ {pad(sel.eq)}</span>
                  {nombreEq(sel.eq)}
                  <span aria-hidden className="size-4 rounded-full ring-1 ring-bone/40" style={{ background: hexColor(colores[ci]) }} />
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
