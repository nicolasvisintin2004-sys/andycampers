import { falta, isPending, type Maybe } from "@/lib/pending";

/**
 * TODO lo del P70 en un solo archivo: precio, los 3 equipamientos, los 5 colores,
 * los videos del selector, la ficha técnica y el equipamiento de serie.
 *
 * Solo existe la versión ACERO 100% (exclusiva para camionetas).
 * Lo que Andrés todavía no pasó va con `falta("…")` y se ve como cartel rojo.
 */

/* ───────────────────────── Precio ───────────────────────── */

/** Sobre esto se suman los equipamientos de cada nivel (audio de Andrés del 4/11). Cada nivel tiene su precio. */
export const precioBase = 17500;
export const moneda = "USD";

/* ───────────────────────── Qué lleva cada nivel (flyers marcados por Andrés) ───────────────────────── */

export interface ItemEquipamiento {
  nombre: string;
  detalle?: string;
  /** USD, el del flyer. No se muestra: solo suma al precio del nivel. */
  precio: number;
  /** Desde qué nivel viene: Rumbo (1), Terra (2) o solo Cima (3). */
  desde: 1 | 2 | 3;
}

/**
 * Andrés marcó los flyers de opcionales con el nombre de cada nivel: lo que no
 * está tachado es lo que ese nivel lleva (no son opcionales ni se venden aparte).
 * Cima lleva todo lo de los dos flyers. El precio de cada nivel es `precioBase`
 * más los precios de lo que lleva, sumados de a uno, sin el 8% de descuento.
 * Los nombres con `desde: 3` están tapados por la marca en los dos flyers (los
 * precios se leen): se confirman con el flyer limpio.
 */
export const itemsEquipamiento: ItemEquipamiento[] = [
  { nombre: "Aireador de techo eléctrico", detalle: "Extractor ventilador, muy recomendable. No es aire acondicionado pero es suficiente.", precio: 440, desde: 1 },
  { nombre: "Batería 1536 W", detalle: "Con picos de 1800 W", precio: 1960, desde: 1 },
  { nombre: "Panel solar 150 W y conexiones", detalle: "Recupera la batería en 2 horas del uso nocturno", precio: 620, desde: 1 },
  { nombre: "Bacha en mesada", detalle: "Tanque de 100 litros, bomba de agua automática y entrada. Conexiones y chapones protectores.", precio: 730, desde: 1 },
  { nombre: "Extensión de mesada", detalle: "Adaptador para usar el portón del espacio técnico como ampliación de la mesada de cocina", precio: 83, desde: 1 },
  { nombre: "Puerta segunda completa", precio: 1120, desde: 1 },
  { nombre: "Toberas para el guardado del calzado", precio: 540, desde: 1 },
  { nombre: "Enganche multidireccional extremo", detalle: "Mayor seguridad", precio: 660, desde: 1 },
  { nombre: "Chapón cubre chasis", precio: 235, desde: 1 },
  { nombre: "Ganchos de desatasco", detalle: "x2 unidades", precio: 55, desde: 1 },
  { nombre: "Trabas para puertas contra el viento", detalle: "x2 unidades", precio: 64, desde: 1 },
  { nombre: "Luz LED en espacio técnico de herramientas", precio: 44, desde: 1 },
  { nombre: "Tercera luz de stop", precio: 82, desde: 1 },

  { nombre: "Heladera Dometic a medida", precio: 1560, desde: 2 },
  { nombre: "Rack porta heladera con desplazamientos", precio: 280, desde: 2 },
  { nombre: "Baulera frontal de guardado", precio: 720, desde: 2 },
  { nombre: "Porta equipajes", detalle: "Preparado para sujetar toldo y baño o poner bicicletas", precio: 520, desde: 2 },
  { nombre: "Rueda de auxilio, cubierta y llanta", precio: 760, desde: 2 },
  { nombre: "Cubiertas más grandes", detalle: "De 740 a 810 mm de diámetro", precio: 460, desde: 2 },
  { nombre: "Embellecedor para llantas", detalle: "x2 unidades", precio: 95, desde: 2 },
  { nombre: "Pie rebatible", detalle: "x2 unidades", precio: 180, desde: 2 },

  { nombre: "Toldo 270 grados", precio: 680, desde: 3 },
  { nombre: "Luces LED en toldo", precio: 440, desde: 3 },
  { nombre: "Cerramiento lateral 270 grados", precio: 880, desde: 3 },
  { nombre: "Baño plegable", detalle: "Te podés dar una ducha y también ponerle el inodoro químico adentro", precio: 480, desde: 3 },
  { nombre: "Duchador baulera con calefón de agua caliente", detalle: "Con porta garrafa", precio: 840, desde: 3 },
  { nombre: "Cocina baulera completa", detalle: "Con porta garrafa", precio: 720, desde: 3 },
  { nombre: "Techo panorámico con apertura y luz", detalle: "Le da amplitud, para ver las estrellas de noche", precio: 820, desde: 3 },
  { nombre: "Freno de mano mecánico", precio: 1140, desde: 3 },
  { nombre: "Pava eléctrica", precio: 120, desde: 3 },
  { nombre: "Funda para el camper", precio: 420, desde: 3 },
];

/** Todo lo que trae el nivel. */
export const incluidos = (n: number) => itemsEquipamiento.filter((o) => o.desde <= n);
/** Lo que este nivel suma al anterior. */
export const nuevosEn = (n: number) => itemsEquipamiento.filter((o) => o.desde === n);
/** Precio final del nivel: la base más todo lo que lleva. */
const precioNivel = (n: number) => incluidos(n).reduce((total, o) => total + o.precio, precioBase);
/** "Desde USD …" del hero, las preguntas y los buscadores: el precio de Rumbo. */
export const precioDesde = precioNivel(1);

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
  /**
   * Barras de "stats" tipo juego. `null` = no se muestran (así quedan hasta que
   * Andrés defina los valores de los 3 equipamientos).
   */
  stats: Stats | null;
}

/** Los 3 niveles, de más base a más completo. Qué trae cada uno sale de `itemsEquipamiento`. */
export const equipamientos: Equipamiento[] = [
  {
    n: 1,
    nombre: "Rumbo",
    nombreCorto: "Rumbo",
    precio: precioNivel(1),
    descripcion: falta("descripción de una línea del nivel Rumbo"),
    stats: null,
  },
  {
    n: 2,
    nombre: "Terra",
    nombreCorto: "Terra",
    precio: precioNivel(2),
    descripcion: falta("descripción de una línea del nivel Terra"),
    stats: null,
  },
  {
    n: 3,
    nombre: "Cima",
    nombreCorto: "Cima",
    precio: precioNivel(3),
    descripcion: falta("descripción de una línea del nivel Cima"),
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
  version: 4,
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

/** "Rumbo" → "rumbo": nombre de archivo del catálogo descargable de cada nivel. */
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
