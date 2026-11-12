/**
 * Fotos y videos reales que pasó Andrés. Importar las fotos de forma estática le
 * da a next/image el tamaño y el blur de carga automáticamente.
 */
import cordillera from "./media/camper-p70-amarillo-cordillera-ripio.jpg";
import exteriorBosque from "./media/p70-exterior-bosque.jpg";
import interiorLed from "./media/p70-interior-luces-led.jpg";
import toldoLateral from "./media/p70-toldo-lateral.jpg";
import cocinaPorton from "./media/p70-cocina-porton-trasero.jpg";
import banoPlegable from "./media/p70-bano-plegable.jpg";
import banoAdentro from "./media/p70-bano-plegable-adentro.jpg";
import duchador from "./media/p70-duchador.jpg";
import toldoTrasero from "./media/p70-toldo-trasero.jpg";
import heladera from "./media/p70-heladera-dometic.jpg";
import anafe from "./media/p70-anafe-desplegable.jpg";
import interiorDia from "./media/p70-interior-dia.jpg";
import camino from "./media/p70-camino-con-camioneta.jpg";
import rueda from "./media/p70-rueda.jpg";
import playa from "./media/p70-playa.jpg";

/** De las fotos anteriores queda esta sola, en el hero: el paisaje vale por sí mismo. */
export const media = { cordillera };

export const fotos = {
  playa: { img: playa, alt: "P70 enganchado a la camioneta en la playa, con el mar de fondo" },
  exteriorBosque: { img: exteriorBosque, alt: "P70 de costado en el bosque, con el toldo plegado en el techo" },
  interiorLed: { img: interiorLed, alt: "Dormitorio del P70 con las luces LED prendidas, la claraboya y las alacenas" },
  interiorDia: { img: interiorDia, alt: "Dormitorio del P70 de día, con la puerta lateral abierta" },
  cocinaPorton: { img: cocinaPorton, alt: "Portón trasero abierto con la cocina: mesada, bacha y alacenas" },
  anafe: { img: anafe, alt: "Cocina baulera desplegada al costado del P70, con anafe de dos hornallas" },
  heladera: { img: heladera, alt: "Heladera Dometic en su baulera frontal, sobre rack" },
  toldoLateral: { img: toldoLateral, alt: "Toldo abierto al costado del P70, con sus luces LED" },
  toldoTrasero: { img: toldoTrasero, alt: "Toldo abierto sobre el P70, con el portón de la cocina levantado y la camioneta al lado" },
  banoPlegable: { img: banoPlegable, alt: "Baño plegable armado al costado del P70" },
  banoAdentro: { img: banoAdentro, alt: "Baño plegable por dentro, visto desde arriba" },
  duchador: { img: duchador, alt: "Duchador montado en la estructura del baño plegable" },
  camino: { img: camino, alt: "P70 de atrás, enganchado a la camioneta en un camino de tierra" },
  rueda: { img: rueda, alt: "Detalle de la rueda off-road del P70, con el aro naranja" },
};

/** Orden de la sección "Fotos". */
export const galeria = [
  fotos.playa,
  fotos.exteriorBosque,
  fotos.camino,
  fotos.rueda,
  fotos.interiorLed,
  fotos.interiorDia,
  fotos.cocinaPorton,
  fotos.toldoTrasero,
  fotos.anafe,
  fotos.heladera,
  fotos.toldoLateral,
  fotos.banoPlegable,
  fotos.banoAdentro,
  fotos.duchador,
];

/** Videos reales con sonido, comprimidos en /public/video. El orden es el de la página. */
export const clips = {
  taller: {
    src: "/video/camper-p70-recorrido-taller",
    poster: "/video/camper-p70-recorrido-taller-poster.jpg",
    /** Miniatura 4:5 (232 px) para los videos del hero. */
    mini: "/video/camper-p70-recorrido-taller-mini.jpg",
    titulo: "Hecho a mano en Santa Fe",
    alt: "Recorrido por el P70 terminado, en el taller de andycampers",
    /** Fecha en que se publicó en este sitio (VideoObject.uploadDate). */
    publicado: "2026-11-01",
    duracion: "PT17S",
  },
  virYLeo: {
    src: "/video/camper-p70-vir-y-leo",
    poster: "/video/camper-p70-vir-y-leo-poster.jpg",
    mini: "/video/camper-p70-vir-y-leo-mini.jpg",
    titulo: "Financiá tu P70",
    alt: "Andy muestra en el taller el P70 terminado de Vir y Leo",
    publicado: "2026-11-01",
    duracion: "PT45S",
  },
  playa: {
    src: "/video/camper-p70-playa",
    poster: "/video/camper-p70-playa-poster.jpg",
    mini: "/video/camper-p70-playa-mini.jpg",
    titulo: "Un día en la playa",
    alt: "El P70 y la camioneta andycampers por la arena, hasta instalarse frente al mar",
    publicado: "2026-11-01",
    duracion: "PT1M27S",
  },
  frenteAlMar: {
    src: "/video/camper-p70-frente-al-mar",
    poster: "/video/camper-p70-frente-al-mar-poster.jpg",
    mini: "/video/camper-p70-frente-al-mar-mini.jpg",
    titulo: "Frente al mar",
    alt: "Recorrido por afuera y por adentro del P70, con la cama mirando al mar",
    publicado: "2026-11-01",
    duracion: "PT41S",
  },
  altaMontana: {
    src: "/video/camper-p70-alta-montana",
    poster: "/video/camper-p70-alta-montana-poster.jpg",
    mini: "/video/camper-p70-alta-montana-mini.jpg",
    titulo: "Durmiendo en alta montaña",
    alt: "Andy cuenta cómo durmió en el P70 en plena nevada, para probar el aislante térmico",
    publicado: "2026-11-01",
    duracion: "PT1M50S",
  },
  acampar: {
    src: "/video/camper-p70-acampar",
    poster: "/video/camper-p70-acampar-poster.jpg",
    mini: "/video/camper-p70-acampar-mini.jpg",
    titulo: "A acampar con los chicos",
    alt: "El dormitorio y la cocina del P70, abiertos en el bosque",
    publicado: "2026-11-01",
    duracion: "PT23S",
  },
  todoABordo: {
    src: "/video/camper-p70-todo-a-bordo",
    poster: "/video/camper-p70-todo-a-bordo-poster.jpg",
    mini: "/video/camper-p70-todo-a-bordo-mini.jpg",
    titulo: "Todo a bordo",
    alt: "Cocina, toldo, ducha, heladera y panel solar del P70",
    publicado: "2026-11-01",
    duracion: "PT38S",
  },
} as const;

export type ClipKey = keyof typeof clips;
