import Link from "next/link";
import { site, waLink } from "@/config/site";
import { isPending } from "@/lib/pending";
import { Wordmark } from "@/components/ui/Wordmark";
import { Missing } from "@/components/ui/Missing";
import { IconFacebook, IconInstagram, IconWhatsApp } from "@/components/ui/Icons";

export function Footer() {
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-11 items-center gap-2 hover:text-orange-glow";
  return (
    <footer className="cut-top-rev cv-auto relative bg-ink text-bone">
      <div className="mx-auto max-w-[1440px] px-4 pb-28 sm:px-6 lg:px-10 lg:pb-12">
        <div className="grid gap-12 border-b border-line pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="text-2xl" />
            <p className="mt-4 max-w-sm text-mist">{site.lema}</p>
            <p className="eyebrow mt-6 text-mist">Camper off-road P70 · Acero 100% · Hecho en Argentina</p>
            {isPending(site.logoSvg) && <Missing label={site.logoSvg} className="mt-6" />}
          </div>

          <div>
            <p className="eyebrow mb-4 text-mist">Contacto</p>
            <ul className="space-y-1">
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
              <li className="pt-1">
                {isPending(site.social.facebook) ? (
                  <Missing label={site.social.facebook} />
                ) : (
                  <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={link}>
                    <IconFacebook className="size-5" /> Facebook
                  </a>
                )}
              </li>
              <li>
                <a href={site.url} className={link}>
                  {site.dominio}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="eyebrow mb-4 text-mist">Taller</p>
            {isPending(site.address) ? <Missing label={site.address} block /> : <p>{site.address}</p>}
            {isPending(site.openingHours) ? <Missing label={site.openingHours} block /> : <p>{site.openingHours}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-8 text-sm text-mist sm:flex-row sm:items-center sm:justify-between sm:pr-20">
          <p>
            © {year} {site.name}. Precio en USD de referencia, sujeto a confirmación.
          </p>
          <div className="flex flex-wrap items-center gap-x-6">
            <Link href="/privacidad" className="inline-flex min-h-11 items-center hover:text-bone">
              Política de privacidad
            </Link>
            {site.credito.url ? (
              <a href={site.credito.url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-mist/80 hover:text-bone">
                {site.credito.texto}
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center text-mist/80">{site.credito.texto}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
