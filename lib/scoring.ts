import "server-only";
import { FINANCING_OFFERED, leadScoring, umbrales, type Categoria } from "@/config/lead-scoring";
import type { LeadInput } from "@/lib/lead-schema";

/**
 * Puntaje del lead sobre 100. Se calcula SOLO en el servidor con los valores
 * de config/lead-scoring.ts; el navegador nunca lo envía ni lo ve.
 */
export function puntuar(r: LeadInput["respuestas"]): { puntaje: number; categoria: Categoria; detalle: Record<string, number> } {
  const s = leadScoring;
  const pick = (tabla: Record<string, number>, id: string) => tabla[id] ?? 0;

  const inversion = r.inversion === "financiacion" && FINANCING_OFFERED ? s.financiacionSiSeOfrece : pick(s.inversion, r.inversion);
  const v = r.vehiculo;
  const vehiculoCompleto = Boolean(v.marca && v.modelo && v.anio);

  const detalle = {
    aventurero: pick(s.aventurero, r.aventurero),
    etapa: pick(s.etapa, r.etapa),
    inversion,
    plazo: pick(s.plazo, r.plazo),
    equipamiento: pick(s.equipamiento, r.equipamiento),
    vehiculo: vehiculoCompleto ? s.vehiculoCompleto : 0,
  };
  const puntaje = Math.min(100, Object.values(detalle).reduce((a, b) => a + b, 0));
  const categoria: Categoria = puntaje >= umbrales.caliente ? "caliente" : puntaje >= umbrales.tibio ? "tibio" : "frio";
  return { puntaje, categoria, detalle };
}

/** Remolca con auto o SUV: no resta puntos, pero se marca en el aviso a Andrés. */
export const remolcaSinCamioneta = (tipo: string) => tipo === "auto" || tipo === "suv";
