import { falta, isPending, type Maybe } from "@/lib/pending";

/**
 * TODO lo del P70 en un solo archivo: precio, los 4 equipamientos, los 4 colores,
 * los videos del selector, la ficha técnica y el equipamiento de serie.
 *
 * Solo existe la versión ACERO 100% (exclusiva para camionetas).
 * Lo que Andrés todavía no pasó va con `falta("…")` y se ve como cartel rojo.
 */

/* ───────────────────────── Precio ───────────────────────── */

/** Único precio que se muestra: "Desde USD 16.500". */
export const precioDesde = 16500;
export const moneda = "USD";

/* ───────────────────────── Equipamientos (4) ───────────────────────── */

export interface Stats {
  /** 0 a 100. */
  autonomia: number;
  confort: number;
  offroad: number;
}

export interface Equipamiento {
  /** 1 a 4: es el número que va en el nombre del video (p70-eq{n}-…). */
  n: 1 | 2 | 3 | 4;
  nombre: Maybe<string>;
  /** Para las pestañas en mobile (8–10 caracteres). */
  nombreCorto: Maybe<string>;
  /** Una línea debajo del nombre. */
  descripcion: Maybe<string>;
  /** Qué incluye este equipamiento (lista). */
  incluye: Maybe<string[]>;
  /**
   * Barras de "stats" tipo juego. `null` = no se muestran (así quedan hasta que
   * Andrés defina los valores de los 4 equipamientos).
   */
  stats: Stats | null;
}

export const equipamientos: Equipamiento[] = [
  {
    n: 1,
    nombre: falta("nombre del equipamiento 1"),
    nombreCorto: falta("nombre corto eq. 1"),
    descripcion: falta("descripción de una línea del equipamiento 1"),
    incluye: falta("qué incluye el equipamiento 1"),
    stats: null,
  },
  {
    n: 2,
    nombre: falta("nombre del equipamiento 2"),
    nombreCorto: falta("nombre corto eq. 2"),
    descripcion: falta("descripción de una línea del equipamiento 2"),
    incluye: falta("qué incluye el equipamiento 2"),
    stats: null,
  },
  {
    n: 3,
    nombre: falta("nombre del equipamiento 3"),
    nombreCorto: falta("nombre corto eq. 3"),
    descripcion: falta("descripción de una línea del equipamiento 3"),
    incluye: falta("qué incluye el equipamiento 3"),
    stats: null,
  },
  {
    n: 4,
    nombre: falta("nombre del equipamiento 4"),
    nombreCorto: falta("nombre corto eq. 4"),
    descripcion: falta("descripción de una línea del equipamiento 4"),
    incluye: falta("qué incluye el equipamiento 4"),
    stats: null,
  },
];

/* ───────────────────────── Colores (4) ───────────────────────── */

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
];

/** Combinación con la que arranca el selector (sin link compartido). */
export const inicial = { eq: 1, color: "c1" } as const;

/* ───────────────────────── Videos del selector (16) ─────────────────────────
   Un video por combinación: p70-eq{n}-{color}.mp4 y .webm, más el poster .jpg.
   Viven en un CDN (NEXT_PUBLIC_MEDIA_BASE_URL); sin esa variable se sirven
   desde /public/media (solo para desarrollo y la demo). */

export const videoSelector = {
  /** Duración de TODOS los videos, en segundos (deben ser iguales). */
  duracion: 10,
  /**
   * Fondo liso de los renders: TIENE que ser este hex para que el video se
   * funda con la pantalla. Es el mismo que --color-garage en globals.css.
   */
  fondo: "#1c1f23",
  /**
   * Si los renders traen su propio piso o plataforma, poné `true` y la web
   * oculta su pedestal.
   */
  renderIncludesFloor: false,
  /** Altura del contacto de las ruedas con el piso, como fracción del alto del cuadro. */
  pisoY: 0.74,
  /**
   * Pedestal de la web, medido sobre el encuadre de los renders (lo imprime
   * scripts/generate-placeholder-videos). rx: radio horizontal / ancho del cuadro;
   * frente y fondo: cuánto baja y sube la elipse del piso / alto del cuadro.
   */
  pedestal: { rx: 0.307, frente: 0.112, fondo: 0.07 },
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
  `${MEDIA_BASE}/p70/${res}/${nombreVideo(eq, color)}.${ext}`;

export const posterUrl = (eq: number, color: string) => `${MEDIA_BASE}/p70/posters/${nombreVideo(eq, color)}.jpg`;

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
export const getColor = (id: unknown) => colores.find((c) => c.id === id);

/* ───────────────────────── Ficha técnica (versión Acero) ───────────────────────── */

export interface FilaFicha {
  label: string;
  valor: Maybe<string>;
}

export const ficha: { grupo: string; filas: FilaFicha[] }[] = [
  {
    grupo: "Versión y remolque",
    filas: [
      { label: "Construcción", valor: "Acero 100%" },
      { label: "Vehículo de remolque", valor: "Exclusivo para camionetas" },
      { label: "Peso aproximado", valor: "1.100 kg" },
      { label: "Carga útil", valor: falta("carga útil del P70") },
      { label: "Capacidad de personas", valor: falta("capacidad de personas") },
    ],
  },
  {
    grupo: "Carrocería",
    filas: [
      { label: "Terminación", valor: "Pintura antirrayones" },
      { label: "Aislamiento térmico", valor: "80 mm" },
    ],
  },
  {
    grupo: "Chasis, suspensión y frenos",
    filas: [
      { label: "Chasis", valor: "Vehicular, de chapa plegada con corte láser (no caño ni perfiles de construcción). Homologado y con patente." },
      { label: "Suspensión", valor: "Inteligente Hard & Soft, probada a 165 km/h" },
      { label: "Frenos", valor: "Eléctricos: se accionan solos al pisar el freno de la camioneta" },
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
