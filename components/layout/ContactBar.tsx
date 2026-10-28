"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, waLink } from "@/config/site";
import { isPending } from "@/lib/pending";
import { track } from "@/lib/analytics";
import { useSeleccion } from "@/lib/selection";
import { mensajeGracias, mensajeWhatsApp } from "@/lib/whatsapp";
import { Wordmark } from "@/components/ui/Wordmark";
import { IconFacebook, IconInstagram, IconWhatsApp } from "@/components/ui/Icons";

/**
 * Barra fija de arriba, siempre a la vista: el logo y los contactos de Andy
 * (Instagram, Facebook y WhatsApp). El WhatsApp lleva el mensaje precargado con
 * la configuración elegida ("…el P70 con [equipamiento] en [color]").
 * En mobile los contactos quedan como íconos; desde sm, con su texto.
 */
export function ContactBar() {
  const pathname = usePathname();
  const sel = useSeleccion();
  const text = pathname.startsWith("/gracias") ? mensajeGracias(sel) : mensajeWhatsApp(sel);
  const link = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-2 text-sm font-semibold text-white/85 transition-colors hover:text-menta sm:px-3";

  return (
    <header data-barra className="zona-oscura fixed inset-x-0 top-0 z-[55] h-[var(--bar-h)] bg-grafito text-white">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={`${site.name}, inicio`} className="inline-flex min-h-11 items-center" data-logo-target>
          <Wordmark className="text-[1.02rem] lg:text-[1.2rem]" />
        </Link>

        <nav aria-label="Contacto" className="-mr-2 flex items-center sm:mr-0">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_instagram", { ubicacion: "barra" })}
            aria-label={`Instagram ${site.social.instagramHandle}`}
            className={link}
          >
            <IconInstagram className="size-5" />
            <span className="hidden font-cond text-[0.95rem] font-semibold sm:inline">{site.social.instagramHandle}</span>
          </a>
          {!isPending(site.social.facebook) && (
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_facebook", { ubicacion: "barra" })}
              aria-label="Facebook de AndyCampers"
              className={link}
            >
              <IconFacebook className="size-5" />
              <span className="hidden font-cond text-[0.95rem] font-semibold sm:inline">Facebook</span>
            </a>
          )}
          <a
            href={waLink(text)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_whatsapp", { ubicacion: "barra", equipamiento: sel.elegida ? sel.eq : undefined, color: sel.elegida ? sel.color : undefined })}
            aria-label="Escribile a Andy por WhatsApp"
            className="ml-1 inline-flex min-h-9 min-w-9 items-center justify-center gap-2 rounded-full bg-wa px-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:min-h-10 sm:px-4"
          >
            <IconWhatsApp className="size-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
