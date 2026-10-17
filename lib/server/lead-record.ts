import "server-only";
import { randomUUID } from "node:crypto";
import type { Categoria } from "@/config/lead-scoring";
import { labelDe } from "@/config/quote-questions";
import { inicial, nombreColor, nombreEq } from "@/config/p70";
import type { LeadInput } from "@/lib/lead-schema";
import { normalizeArPhone } from "@/lib/phone";
import { puntuar, remolcaSinCamioneta } from "@/lib/scoring";

type IdLabel = "aventurero" | "viaje" | "etapa" | "inversion" | "plazo" | "equipamiento" | "origen";

export interface LeadRecord extends LeadInput {
  id: string;
  fechaISO: string;
  fechaAR: string;
  whatsappNormalizado: string;
  puntaje: number;
  categoria: Categoria;
  detallePuntaje: Record<string, number>;
  vehiculoTexto: string;
  /** "⚠ remolca con auto/SUV" cuando corresponde (no resta puntos). */
  alertaVehiculo: string;
  /** Equipamiento y color elegidos en el selector, legibles. */
  seleccionTexto: { equipamiento: string; color: string; elegida: boolean };
  labels: Record<IdLabel, string>;
  attrib: NonNullable<LeadInput["attrib"]>;
}

const fechaAR = (d: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

/** Arma el registro completo del lead: puntaje, textos legibles y selección del P70. */
export function buildLeadRecord(input: LeadInput): LeadRecord {
  const now = new Date();
  const r = input.respuestas;
  const { puntaje, categoria, detalle } = puntuar(r);
  const sel = input.seleccion ?? { eq: inicial.eq, color: inicial.color, elegida: false };
  const v = r.vehiculo;

  return {
    ...input,
    id: randomUUID(),
    fechaISO: now.toISOString(),
    fechaAR: fechaAR(now),
    whatsappNormalizado: normalizeArPhone(input.contacto.whatsapp)!,
    puntaje,
    categoria,
    detallePuntaje: detalle,
    vehiculoTexto: [v.marca, v.modelo, v.anio].filter(Boolean).join(" ") || "(sin datos)",
    alertaVehiculo: remolcaSinCamioneta(v.tipo) ? "⚠ remolca con auto/SUV" : "",
    seleccionTexto: { equipamiento: nombreEq(sel.eq), color: nombreColor(sel.color), elegida: sel.elegida },
    labels: {
      aventurero: labelDe("aventurero", r.aventurero),
      viaje: labelDe("viaje", r.viaje),
      etapa: labelDe("etapa", r.etapa),
      inversion: labelDe("inversion", r.inversion),
      plazo: labelDe("plazo", r.plazo),
      equipamiento: labelDe("equipamiento", r.equipamiento),
      origen: labelDe("origen", r.origen),
    },
    attrib: input.attrib ?? {},
  };
}
