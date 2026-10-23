import { falta, type Maybe } from "@/lib/pending";

/**
 * Datos del negocio. Lo que falta se carga como `falta("…")` y se ve en el
 * sitio como un CARTEL ROJO. Para completarlo, reemplazá la llamada por el dato.
 * Los datos del P70 (equipamientos, colores, ficha) están en config/p70.ts.
 */
export const site = {
  /**
   * Muestra el cartel rojo "DEMO" arriba de todo y pide a Google que no indexe.
   * Para publicar: NEXT_PUBLIC_DEMO=false en el hosting (y sin datos pendientes).
   */
  demo: process.env.NEXT_PUBLIC_DEMO !== "false",
  name: "AndyCampers",
  legalName: falta("razón social y CUIT del responsable de los datos") as Maybe<string>,
  /** Base de canonical, sitemap y vistas previas. En Netlify la define el build con $URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://andycampers.com.ar",
  dominio: "andycampers.com.ar",
  lema: "Descubrí la vida que querés vivir, moviéndote!",
  locale: "es_AR",

  owner: { nombre: "Andrés", apodo: "Andy" },

  whatsapp: {
    number: "5493415641103",
    display: "+54 9 341 564-1103",
    /** Para JSON-LD (formato internacional con guiones). */
    e164: "+54-9-341-564-1103",
  },

  social: {
    instagram: "https://www.instagram.com/andycampers/",
    instagramHandle: "@andycampers",
    facebook: "https://www.facebook.com/p/Andycampers-100063702243817/" as Maybe<string>,
    youtube: falta("canal de YouTube (si tiene)") as Maybe<string>,
  },

  /** La dirección y el horario del taller no se publican: las visitas se coordinan por mensaje. */
  visitas: {
    texto: "Se coordinan por mensaje: escribile a Andy y arreglan el día.",
    mensaje: "Hola Andy, quiero coordinar una visita al taller para ver el P70",
  },
  /** Ruta del logo en vector dentro de /public, ej. "/logo-andycampers.svg". */
  logoSvg: falta("logo en vector (SVG)") as Maybe<string>,

  comercial: {
    plazos: falta("plazos de fabricación y entrega") as Maybe<string>,
    formaDePago: falta("forma de pago y seña") as Maybe<string>,
    financiacion: falta("si ofrece financiación y en qué condiciones") as Maybe<string>,
    garantia: falta("garantía del P70") as Maybe<string>,
  },

  credito: { texto: "Diseño y desarrollo: Visintin Studio", url: null as string | null },
} as const;

export const waLink = (text?: string, number: string = site.whatsapp.number) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
