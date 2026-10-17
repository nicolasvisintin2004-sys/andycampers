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
    opciones: [
      { id: "n1", label: "Nivel 1", detalle: "Ruta asfaltada y camping con servicios" },
      { id: "n2", label: "Nivel 2", detalle: "Me animo al ripio y a lugares tranquilos" },
      { id: "n3", label: "Nivel 3", detalle: "Busco lugares donde casi no llega nadie" },
      { id: "n4", label: "Nivel 4", detalle: "Off-road de verdad: barro, arena, nieve" },
    ],
  },
  {
    id: "viaje",
    tipo: "opciones",
    titulo: "¿Para qué tipo de viajes estás pensando usarlo?",
    opciones: [
      { id: "escapadas", label: "Escapadas y fines de semana" },
      { id: "largos", label: "Viajes largos" },
      { id: "offroad", label: "Off-Road / aventura" },
      { id: "actividad", label: "Surf, pesca u otra actividad" },
      { id: "indefinido", label: "Todavía no lo tengo definido" },
    ],
  },
  {
    id: "etapa",
    tipo: "opciones",
    titulo: "¿Cómo estás encarando hoy la compra?",
    opciones: [
      { id: "activo", label: "Estoy buscando activamente y quiero comprar próximamente" },
      { id: "comparando", label: "Estoy comparando opciones para decidir cuál comprar" },
      { id: "proyectando", label: "Me interesa, pero todavía estoy proyectando la compra" },
      { id: "averiguando", label: "Por ahora estoy averiguando" },
    ],
  },
  {
    id: "inversion",
    tipo: "opciones",
    titulo: "¿Cómo tenés pensado encarar la inversión?",
    opciones: [
      { id: "disponible", label: "Tengo el presupuesto disponible" },
      { id: "organizando", label: "Estoy organizando / reuniendo el presupuesto" },
      { id: "vende", label: "Necesito vender otro vehículo u otro bien para comprarlo" },
      { id: "financiacion", label: "Necesitaría financiación" },
      { id: "sin_definir", label: "Todavía no tengo definido el presupuesto" },
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
      { id: "este_anio", label: "Más adelante este año" },
      { id: "anio_que_viene", label: "El año que viene" },
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
    titulo: "¿Cómo conociste AndyCampers?",
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
