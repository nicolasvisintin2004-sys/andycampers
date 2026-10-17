"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { waLink } from "@/config/site";
import { IconWhatsApp } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { useSeleccion } from "@/lib/selection";
import { mensajeGracias, mensajeWhatsApp } from "@/lib/whatsapp";

/**
 * Botón flotante de WhatsApp con mensaje precargado que incluye la
 * configuración elegida ("…el P70 con [equipamiento] en [color]").
 * En mobile, el selector lo sube (--wa-offset) para no tapar su CTA fijo.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const sel = useSeleccion();
  const [visible, setVisible] = useState(false);
  const text = pathname.startsWith("/gracias") ? mensajeGracias(sel) : mensajeWhatsApp(sel);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { ubicacion: "flotante", equipamiento: sel.elegida ? sel.eq : undefined, color: sel.elegida ? sel.color : undefined })}
      aria-label="Escribile a Andy por WhatsApp"
      className={`group fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-wa text-white shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)] transition-[transform,opacity,bottom] duration-500 ease-[var(--ease-out-expo)] hover:scale-105 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ bottom: "calc(1rem + var(--wa-offset) + env(safe-area-inset-bottom))" }}
    >
      <IconWhatsApp className="size-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-ink px-3 py-2 text-sm font-medium text-bone opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        Hablá con Andy
      </span>
    </a>
  );
}
