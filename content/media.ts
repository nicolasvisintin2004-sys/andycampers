/**
 * Fotos reales (vienen optimizadas de la demo anterior). Importarlas de forma
 * estática le da a next/image el tamaño y el blur de carga automáticamente.
 */
import ruta from "./media/camper-p70-amarillo-ruta-atardecer.jpg";
import cordillera from "./media/camper-p70-amarillo-cordillera-ripio.jpg";
import nieve from "./media/camper-p70-amarillo-nieve-camioneta.jpg";
import playaMedanos from "./media/camper-p70-playa-camioneta-medanos.jpg";
import cocina from "./media/camper-p70-cocina-baulera-lateral.jpg";
import portonCocina from "./media/camper-p70-porton-trasero-cocina-bacha.jpg";
import playa from "./media/camper-p70-exterior-playa.jpg";
import interiorLed from "./media/camper-p70-interior-dormitorio-luz-led.jpg";
import toldoLed from "./media/camper-p70-toldo-270-luces-led.jpg";
import naranjaBosque from "./media/camper-p70-naranja-exterior-bosque.jpg";
import caminoBosque from "./media/camper-p70-exterior-camino-bosque.jpg";

export const media = { ruta, cordillera, nieve, playaMedanos, cocina, portonCocina, playa, interiorLed, toldoLed, naranjaBosque, caminoBosque };
export type MediaKey = keyof typeof media;

/** Clips reales (de los reels de Instagram), comprimidos en /public/video. */
export const clips = {
  medanos: {
    src: "/video/camper-p70-medanos-4x4",
    poster: "/video/camper-p70-medanos-4x4-poster.jpg",
    titulo: "4x4 en los médanos",
    alt: "Camioneta AndyCampers remolcando el P70 por los médanos de arena",
    /** Fecha en que se publicó en este sitio (VideoObject.uploadDate). */
    publicado: "2026-10-15",
    duracion: "PT12S",
  },
  cocinaPlaya: {
    src: "/video/camper-p70-cocina-en-la-playa",
    poster: "/video/camper-p70-cocina-en-la-playa-poster.jpg",
    titulo: "Cocinar frente al mar",
    alt: "Cocina baulera del P70 abierta en la playa, cocinando a la plancha frente al mar",
    publicado: "2026-10-15",
    duracion: "PT14S",
  },
  despertar: {
    src: "/video/camper-p70-despertar",
    poster: "/video/camper-p70-despertar-poster.jpg",
    titulo: "Despertar adentro",
    alt: "Mañana dentro del P70 con vista a la laguna",
    publicado: "2026-10-15",
    duracion: "PT6S",
  },
  agua: {
    src: "/video/camper-p70-del-camper-al-agua",
    poster: "/video/camper-p70-del-camper-al-agua-poster.jpg",
    titulo: "Del camper al agua",
    alt: "Wakeboard en una laguna a pocos metros del camper",
    publicado: "2026-10-15",
    duracion: "PT9.2S",
  },
} as const;

export type ClipKey = keyof typeof clips;
