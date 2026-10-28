import Link from "next/link";
import { site, waLink } from "@/config/site";
import { isPending } from "@/lib/pending";
import { Wordmark } from "@/components/ui/Wordmark";
import { Missing } from "@/components/ui/Missing";
import { IconFacebook, IconInstagram, IconWhatsApp } from "@/components/ui/Icons";
import { Descargas } from "./Descargas";

/**
 * Pie en el verde de la marca: el logo, las descargas (catálogo y preguntas
 * frecuentes en PDF), contacto y visitas. Cierra con la barra grafito de los
 * flyers: Instagram y Facebook a la izquierda, la web a la derecha.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-11 items-center gap-2 hover:text-durazno";
  const titulo = "mb-3 font-cond text-[1.05rem] font-semibold text-durazno uppercase";
  return (
    <footer className="zona-oscura cut-top-rev cv-auto relative bg-forest-deep text-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="text-[1.7rem]" />
            <p className="titulo-cond mt-3 max-w-xs text-[1.35rem] leading-tight text-white/85">{site.lema}</p>
            {isPending(site.logoSvg) && <Missing label={site.logoSvg} compact short="logo en vector" className="mt-4" />}
          </div>

          <div>
            <p className={titulo}>Descargas</p>
            <Descargas />
          </div>

          <div>
            <p className={titulo}>Contacto</p>
            <ul>
              <li>
                <a href={waLink("Hola Andy, vengo de la web. Me interesa el P70")} target="_blank" rel="noopener noreferrer" className={link}>
                  <IconWhatsApp className="size-5" /> {site.whatsapp.display}
                </a>
              </li>
              <li>
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className={link}>
                  <IconInstagram className="size-5" /> {site.social.instagramHandle}
                </a>
              </li>
              {!isPending(site.social.facebook) && (
                <li>
                  <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={link}>
                    <IconFacebook className="size-5" /> Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className={titulo}>Visitas al taller</p>
            <p className="max-w-xs text-white/85">{site.visitas.texto}</p>
            <a href={waLink(site.visitas.mensaje)} target="_blank" rel="noopener noreferrer" className={`${link} mt-1 font-semibold`}>
              <IconWhatsApp className="size-5" /> Coordinar una visita
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Precios en dólares de referencia, sujetos a confirmación.
          </p>
          <div className="flex flex-wrap items-center gap-x-6">
            <Link href="/privacidad" className="inline-flex min-h-11 items-center hover:text-white">
              Política de privacidad
            </Link>
            {site.credito.url ? (
              <a href={site.credito.url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center hover:text-white">
                {site.credito.texto}
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center">{site.credito.texto}</span>
            )}
          </div>
        </div>
      </div>

      {/* La barra de los flyers */}
      <div className="flex items-center justify-between bg-grafito px-4 py-3 sm:px-6 lg:px-10">
        <span className="flex items-center gap-1">
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de AndyCampers" className="grid size-11 place-items-center hover:text-durazno">
            <IconInstagram className="size-6" />
          </a>
          {!isPending(site.social.facebook) && (
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de AndyCampers" className="grid size-11 place-items-center hover:text-durazno">
              <IconFacebook className="size-6" />
            </a>
          )}
        </span>
        <span className="font-cond text-[1.05rem] font-semibold tracking-[0.08em] uppercase">{site.dominio}</span>
      </div>
    </footer>
  );
}
