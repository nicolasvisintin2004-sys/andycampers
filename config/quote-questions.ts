import { equipamientos, nombreEq } from "@/config/p70";

/**
 * Preguntas del formulario de cotización, con los textos de Andrés.
 * Los `id` de cada opción son los que usa config/lead-scoring.ts para puntuar:
 * si cambiás un id, cambialo en los dos lados.
 */
export interface OpcionPregunta {
  id: string;
  label: string;
  /** Texto chico debajo (lo usa el selector de dificultad). */
  detalle?: string;
}

export type IdOpciones = "aventurero" | "viaje" | "etapa" | "inversion" | "plazo" | "equipamiento" | "origen";

export interface PreguntaOpciones {
  id: IdOpciones;
  tipo: "opciones";
  /** "niveles" se dibuja como el selector de dificultad de un juego. */
  estilo?: "niveles";
  titulo: string;
  ayuda?: string;
  opciones: OpcionPregunta[];
}

export interface PreguntaVehiculo {
  id: "vehiculo";
  tipo: "vehiculo";
  titulo: string;
  ayuda?: string;
}

export interface PreguntaTexto {
  id: "comentario";
  tipo: "texto";
  titulo: string;
  ayuda?: string;
}

export type PreguntaCotizador = PreguntaOpciones | PreguntaVehiculo | PreguntaTexto;

export const preguntas: PreguntaCotizador[] = [
  {
    id: "aventurero",
    tipo: "opciones",
    estilo: "niveles",
    titulo: "¿Qué tan aventurero sos?",
    // Andrés (audios del 11/11): máximo 3 opciones por pregunta.
    opciones: [
      { id: "relajado", label: "Relajado", detalle: "Ruta asfaltada y camping con servicios" },
      { id: "aventurero", label: "Aventurero", detalle: "Me animo al ripio y a lugares tranquilos" },
      { id: "extremo", label: "Extremo, off-road, 4x4", detalle: "Busco lugares donde casi no llega nadie" },
    ],
  },
  {
    id: "viaje",
    tipo: "opciones",
    titulo: "¿Para qué tipo de viajes estás pensando usarlo?",
    opciones: [
      { id: "escapadas", label: "Escapada de fin de semana" },
      { id: "largos", label: "Viajes largos" },
      { id: "deportes", label: "Deportes / kitesurf" },
      { id: "offroad", label: "Off-road, aventura, pesca, caza" },
    ],
  },
  {
    id: "etapa",
    tipo: "opciones",
    titulo: "¿Cómo estás encarando hoy la compra?",
    opciones: [
      { id: "activo", label: "Estoy buscando activamente y quiero comprar próximamente" },
      { id: "comparando", label: "Estoy comparando opciones para decidir cuál comprar" },
      { id: "proyectando", label: "Estoy averiguando, pero todavía estoy proyectando la compra" },
    ],
  },
  {
    id: "inversion",
    tipo: "opciones",
    titulo: "¿Cómo tenés pensado encarar la inversión?",
    opciones: [
      { id: "disponible", label: "Tengo el presupuesto disponible" },
      { id: "organizando", label: "Estoy organizando / reuniendo el presupuesto, necesito vender otro vehículo" },
      { id: "financiacion", label: "Necesitaría financiación" },
    ],
  },
  {
    id: "vehiculo",
    tipo: "vehiculo",
    titulo: "¿Con qué vehículo tenés pensado remolcar el P70?",
    ayuda: "Marca, modelo, año y tipo.",
  },
  {
    id: "plazo",
    tipo: "opciones",
    titulo: "Suponiendo que encuentres tu configuración, ¿cuándo te gustaría tenerlo?",
    opciones: [
      { id: "proximamente", label: "Lo quiero comprar próximamente" },
      { id: "3a6", label: "Dentro de 3 a 6 meses" },
      { id: "sin_fecha", label: "Todavía no tengo una fecha definida" },
    ],
  },
  {
    id: "equipamiento",
    tipo: "opciones",
    titulo: "¿Qué equipamiento te interesa?",
    ayuda: "Viene marcado el que elegiste arriba. Podés cambiarlo.",
    opciones: [
      ...equipamientos.map((e) => ({ id: `eq${e.n}`, label: nombreEq(e.n) })),
      { id: "asesoramiento", label: "No sé todavía, quiero que me asesoren" },
    ],
  },
  {
    id: "origen",
    tipo: "opciones",
    titulo: "¿Cómo conociste andycampers?",
    opciones: [
      { id: "instagram", label: "Instagram" },
      { id: "recomendacion", label: "Recomendación de alguien" },
      { id: "youtube_redes", label: "YouTube / redes" },
      { id: "google", label: "Google" },
      { id: "personalmente", label: "Vi uno personalmente" },
      { id: "otro", label: "Otro" },
    ],
  },
  {
    id: "comentario",
    tipo: "texto",
    titulo: "¿Estás evaluando otras opciones de campers? ¿Hay algo que estés buscando y todavía no hayas encontrado?",
    ayuda: "Opcional. Contanos lo que quieras.",
  },
];

export const tiposVehiculo = [
  { id: "camioneta", label: "Camioneta" },
  { id: "suv", label: "SUV" },
  { id: "auto", label: "Auto" },
] as const;

export type TipoVehiculo = (typeof tiposVehiculo)[number]["id"];

/** Nota amable cuando el vehículo no es camioneta (no resta puntos). */
export const notaNoCamioneta = "El P70 está pensado para camionetas; Andy te asesora.";

export const provincias = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos",
  "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
  "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán", "Fuera de Argentina",
] as const;

export const labelDe = (preguntaId: string, opcionId?: string) => {
  const p = preguntas.find((x) => x.id === preguntaId);
  if (!p || p.tipo !== "opciones" || !opcionId) return opcionId ?? "";
  const o = p.opciones.find((x) => x.id === opcionId);
  if (!o) return opcionId;
  return o.detalle ? `${o.label} · ${o.detalle}` : o.label;
};
