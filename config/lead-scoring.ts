/**
 * Puntaje de leads (suma 100). SOLO se usa en el servidor (lib/scoring.ts):
 * el navegador nunca envía ni ve el puntaje.
 * Andrés puede ajustar estos números sin tocar la lógica.
 * Las claves son los `id` de las opciones en config/quote-questions.ts.
 */

/** ⚠ Falta confirmar con Andrés si ofrece financiación. */
export const FINANCING_OFFERED = false;

export const leadScoring = {
  aventurero: { n4: 10, n3: 7, n2: 4, n1: 2 },
  etapa: { activo: 30, comparando: 20, proyectando: 10, averiguando: 0 },
  inversion: { disponible: 30, organizando: 15, vende: 15, financiacion: 10, sin_definir: 0 },
  /** Puntos de "Necesitaría financiación" cuando FINANCING_OFFERED = true. */
  financiacionSiSeOfrece: 20,
  plazo: { proximamente: 20, "3a6": 15, este_anio: 8, anio_que_viene: 4, sin_fecha: 0 },
  equipamiento: { eq3: 5, eq2: 3, eq1: 2, asesoramiento: 2 },
  /** Marca, modelo y año del vehículo completos. */
  vehiculoCompleto: 5,
} as const;

/** Tipo de viaje, origen y texto libre NO suman: se guardan como contexto. */

export const umbrales = {
  /** 70 o más → aviso inmediato por WhatsApp + planilla. */
  caliente: 70,
  /** 40 a 69 → resumen semanal + planilla. Menos de 40 → solo planilla. */
  tibio: 40,
} as const;

export type Categoria = "caliente" | "tibio" | "frio";
