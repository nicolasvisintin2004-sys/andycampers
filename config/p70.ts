import { falta, isPending, type Maybe } from "@/lib/pending";

/**
 * TODO lo del P70 en un solo archivo: precio, los 3 equipamientos, los 5 colores,
 * los videos del selector, la ficha técnica y el equipamiento de serie.
 *
 * Solo existe la versión ACERO 100% (exclusiva para camionetas).
 * Lo que Andrés todavía no pasó va con `falta("…")` y se ve como cartel rojo.
 */

/* ───────────────────────── Precio ───────────────────────── */

/** Precio base del P70: "Desde USD 16.500" (hero y buscadores). Cada equipamiento tiene el suyo. */
export const precioDesde = 16500;
export const moneda = "USD";

/* ───────────────────────── Equipamientos (3 niveles) ───────────────────────── */

export interface Stats {
  /** 0 a 100. */
  autonomia: number;
  confort: number;
  offroad: number;
}

export interface Equipamiento {
  /** 1 a 3: es el número que va en el nombre del video (p70-eq{n}-…). */
  n: 1 | 2 | 3;
  /** Es lo único que se ve en la pestaña del selector. */
  nombre: Maybe<string>;
  /** Para las pestañas en mobile (8–10 caracteres). */
  nombreCorto: Maybe<string>;
  /** Precio final de este nivel, en USD (va arriba del panel, no "desde"). */
  precio: Maybe<number>;
  /** Una línea debajo del precio. */
  descripcion: Maybe<string>;
  /** Qué incluye este equipamiento (lista). */
  incluye: Maybe<string[]>;
  /**
   * Barras de "stats" tipo juego. `null` = no se muestran (así quedan hasta que
   * Andrés defina los valores de los 3 equipamientos).
   */
  stats: Stats | null;
}

/** Nombres provisorios que pidió Andrés (audio del 27/10): "después voy a ver qué le pongo, ponelo así ahora". */
export const equipamientos: Equipamiento[] = [
  {
    n: 1,
    nombre: "Santa Fe",
    nombreCorto: "Santa Fe",
    precio: falta("precio del nivel Santa Fe"),
    descripcion: falta("descripción de una línea del nivel Santa Fe"),
    incluye: falta("qué incluye el nivel Santa Fe"),
    stats: null,
  },
  {
    n: 2,
    nombre: "Patagonia",
    nombreCorto: "Patagonia",
    precio: falta("precio del nivel Patagonia"),
    descripcion: falta("descripción de una línea del nivel Patagonia"),
    incluye: falta("qué incluye el nivel Patagonia"),
    stats: null,
  },
  {
    n: 3,
    nombre: "Sapukái",
    nombreCorto: "Sapukái",
    precio: falta("precio del nivel Sapukái"),
    descripcion: falta("descripción de una línea del nivel Sapukái"),
    incluye: falta("qué incluye el nivel Sapukái"),
    stats: null,
  },
];

/* ───────────────────────── Colores (5) ───────────────────────── */

export interface ColorP70 {
  /**
   * Va en la URL compartida (?color=…) y en el nombre del video (p70-eq1-{id}).
   * Minúsculas, sin espacios ni tildes: "verde", "gris-grafito".
   */
  id: string;
  nombre: Maybe<string>;
  /** Color de la muestra. */
  hex: Maybe<string>;
  /** Solo mientras `hex` esté pendiente: muestra provisoria y color de los videos demo. */
  hexDemo: string;
}

export const colores: ColorP70[] = [
  { id: "c1", nombre: falta("nombre del color 1"), hex: falta("hex del color 1"), hexDemo: "#e4572e" },
  { id: "c2", nombre: falta("nombre del color 2"), hex: falta("hex del color 2"), hexDemo: "#4f8a5b" },
  { id: "c3", nombre: falta("nombre del color 3"), hex: falta("hex del color 3"), hexDemo: "#d9a62e" },
  { id: "c4", nombre: falta("nombre del color 4"), hex: falta("hex del color 4"), hexDemo: "#c9c4ba" },
  { id: "c5", nombre: falta("nombre del color 5"), hex: falta("hex del color 5"), hexDemo: "#3f6e8c" },
];

/** Combinación con la que arranca el selector (sin link compartido). Arranca en verde, el color de la marca. */
export const inicial = { eq: 1, color: "c2" } as const;

/* ───────────────────────── Videos del selector (15) ─────────────────────────
   Un video por combinación: p70-eq{n}-{color}.mp4 y .webm, más el poster .jpg.
   Viven en un CDN (NEXT_PUBLIC_MEDIA_BASE_URL); sin esa variable se sirven
   desde /public/media (solo para desarrollo y la demo). */

export const videoSelector = {
  /**
   * Versión de los videos y posters: va en la URL (?v=…). Subila cada vez que se
   * reemplazan los archivos con los mismos nombres, si no los navegadores siguen
   * mostrando los viejos que tienen guardados.
   */
  version: 3,
  /** Duración de TODOS los videos, en segundos (deben ser iguales). Más largo = gira más lento. */
  duracion: 14,
  /**
   * Fondo liso de los renders (un estudio claro, como los renders de los flyers):
   * TIENE que ser este hex para que el video se funda con la pantalla. Es el
   * mismo que --color-estudio en globals.css.
   */
  fondo: "#ebe8e3",
  /**
   * Los renders traen su propia base (la brújula): la web no dibuja el pedestal.
   * Con `false` la web dibuja el suyo encima del video (components/selector/Pedestal).
   */
  renderIncludesFloor: true,
  /** Altura del contacto de las ruedas con el piso, como fracción del alto del cuadro. */
  pisoY: 0.66,
  /**
   * Pedestal de la web, medido sobre el encuadre de los renders (lo imprime
   * scripts/generate-placeholder-videos). rx: radio horizontal / ancho del cuadro;
   * frente y fondo: cuánto baja y sube la elipse del piso / alto del cuadro.
   */
  pedestal: { rx: 0.285, frente: 0.177, fondo: 0.116 },
  /**
   * `true` mientras se usen los videos generados por scripts/generate-placeholder-videos.
   * Muestra el cartel rojo de "videos demo" en el selector.
   */
  sonDemo: true,
} as const;

export const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "/media").replace(/\/$/, "");

export type Resolucion = "desktop" | "mobile";

export const nombreVideo = (eq: number, color: string) => `p70-eq${eq}-${color}`;

export const videoUrl = (eq: number, color: string, res: Resolucion, ext: "mp4" | "webm") =>
  `${MEDIA_BASE}/p70/${res}/${nombreVideo(eq, color)}.${ext}?v=${videoSelector.version}`;

export const posterUrl = (eq: number, color: string) => `${MEDIA_BASE}/p70/posters/${nombreVideo(eq, color)}.jpg?v=${videoSelector.version}`;

/* ───────────────────────── Helpers de texto ───────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");

/** Nombre legible aunque falte el dato (para WhatsApp, la planilla y analítica). */
export const nombreEq = (n: number) => {
  const e = equipamientos.find((x) => x.n === n);
  return e && !isPending(e.nombre) ? e.nombre : `Equipamiento ${pad(n)}`;
};
export const nombreColor = (id: string) => {
  const i = colores.findIndex((x) => x.id === id);
  const c = colores[i];
  return c && !isPending(c.nombre) ? c.nombre : `Color ${pad(i + 1)}`;
};
export const hexColor = (c: ColorP70) => (isPending(c.hex) ? c.hexDemo : c.hex);

export const getEq = (n: unknown) => equipamientos.find((e) => e.n === Number(n));

/** "Sapukái" → "sapukai": nombre de archivo del catálogo descargable de cada nivel. */
export const slugEq = (n: number) =>
  nombreEq(n)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Archivos que genera scripts/descargas.mjs en /public/descargas. */
export const descargas = {
  preguntas: "/descargas/andycampers-p70-preguntas-frecuentes.pdf",
  catalogo: (n: number) => `/descargas/andycampers-p70-${slugEq(n)}.jpg`,
};
export const getColor = (id: unknown) => colores.find((c) => c.id === id);

/* ───────────────────────── Ficha técnica (versión Acero) ───────────────────────── */

export interface FilaFicha {
  label: string;
  valor: Maybe<string>;
}

/**
 * Chasis, suspensión, frenos, aislamiento y portones no se repiten acá: los
 * cuentan las piezas del plano (components/p70/P70Drawing → hotspots).
 */
export const ficha: { grupo: string; filas: FilaFicha[] }[] = [
  {
    grupo: "General",
    filas: [
      { label: "Construcción", valor: "Acero 100%" },
      { label: "Remolque", valor: "Exclusivo para camionetas" },
      { label: "Peso aproximado", valor: "1.100 kg" },
      { label: "Carga útil", valor: falta("carga útil del P70") },
      { label: "Capacidad de personas", valor: falta("capacidad de personas") },
      { label: "Terminación", valor: "Pintura antirrayones" },
      { label: "Circulación", valor: "Tortuga homologada, cadenas y pata estabilizadora" },
    ],
  },
  {
    grupo: "Medidas",
    filas: [
      { label: "Exteriores (largo × ancho × alto)", valor: falta("medidas exteriores del P70") },
      { label: "Interiores", valor: falta("medidas interiores del P70") },
      { label: "Cama", valor: falta("medida de la cama") },
    ],
  },
  {
    grupo: "Compra",
    filas: [
      { label: "Garantía", valor: falta("garantía del P70") },
      { label: "Fabricación y entrega", valor: falta("plazos de fabricación y entrega") },
      { label: "Forma de pago y seña", valor: falta("forma de pago y seña") },
    ],
  },
];

/** De serie en todos los P70 (flyer "Presentación"). */
export const equipamientoDeSerie = [
  "Mobiliario de dormitorio con placar de 6 puertas y 6 compartimentos",
  "4 tomas de 220 V con luz LED y cargador de celulares",
  "Mesada y alacenas de 4 puertas en la cocina, con luz LED",
  "Puerta lateral con ventana",
  "Ventanas importadas con apertura, mosquitero y cortina",
  "2 portones traseros: cocina y espacio técnico",
];
