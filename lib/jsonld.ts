import { site } from "@/config/site";
import { precioDesde, moneda } from "@/config/p70";
import { clips } from "@/content/media";
import { isPending, type Maybe } from "@/lib/pending";

const ok = <T,>(v: Maybe<T>) => (isPending(v) ? undefined : v);
const abs = (path: string) => new URL(path, site.url).toString();
export const OG_IMAGE = "/og/camper-p70-og.jpg";
export const DESCRIPCION =
  "Camper off road P70 de AndyCampers: 100% de acero, exclusivo para camionetas, con frenos eléctricos, suspensión Hard & Soft probada a 165 km/h y aislamiento de 80 mm. Armá tu P70 y cotizalo. Desde USD 16.500.";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: site.name,
    url: site.url,
    slogan: site.lema,
    logo: ok(site.logoSvg) ? abs(site.logoSvg as string) : undefined,
    sameAs: [site.social.instagram, ok(site.social.facebook), ok(site.social.youtube)].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.whatsapp.e164,
      contactType: "sales",
      areaServed: "AR",
      availableLanguage: ["es"],
    },
  };
}

/**
 * LocalBusiness sin dirección ni horario: no se publican (las visitas al taller
 * se coordinan por mensaje). Solo país y teléfono.
 */
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": abs("/#business"),
    name: site.name,
    url: site.url,
    telephone: site.whatsapp.e164,
    image: abs(OG_IMAGE),
    priceRange: `Desde ${moneda} ${precioDesde}`,
    parentOrganization: { "@id": abs("/#organization") },
    address: { "@type": "PostalAddress", addressCountry: "AR" },
    areaServed: "AR",
  };
}

export function productLd() {
  const url = abs("/");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#p70`,
    name: "Camper off-road P70 · Acero 100%",
    description: DESCRIPCION,
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@id": abs("/#organization") },
    category: "Camper / trailer off-road para camioneta",
    image: [abs(OG_IMAGE)],
    url,
    offers: {
      "@type": "Offer",
      price: precioDesde,
      priceCurrency: moneda,
      description: "Precio base del P70 Acero 100% (desde). El valor final depende del equipamiento elegido.",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: precioDesde,
        priceCurrency: moneda,
        priceType: "https://schema.org/MinimumAdvertisedPrice",
      },
      availability: "https://schema.org/PreOrder",
      url: `${url}#armalo`,
      seller: { "@id": abs("/#organization") },
    },
  };
}

/** VideoObject de los clips reales de "En acción" (no de los videos demo del selector). */
export function videosLd() {
  return Object.values(clips).map((c) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `P70 · ${c.titulo}`,
    description: c.alt,
    thumbnailUrl: [abs(c.poster)],
    contentUrl: abs(`${c.src}.mp4`),
    uploadDate: c.publicado,
    duration: c.duracion,
    publisher: { "@id": abs("/#organization") },
  }));
}
