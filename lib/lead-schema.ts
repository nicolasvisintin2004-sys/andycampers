import { z } from "zod";
import { preguntas, provincias, tiposVehiculo } from "@/config/quote-questions";
import { colores, equipamientos } from "@/config/p70";
import { normalizeArPhone } from "@/lib/phone";

/** IDs válidos por pregunta, sacados de config/quote-questions.ts. */
const opcionesDe = (id: string) => {
  const p = preguntas.find((x) => x.id === id);
  if (!p || p.tipo !== "opciones") throw new Error(`Pregunta ${id} sin opciones`);
  return p.opciones.map((o) => o.id) as [string, ...string[]];
};

const anioActual = new Date().getFullYear();
const texto = (max: number) => z.string().trim().max(max);

/** Lo que manda el navegador. El puntaje NO viaja: lo calcula el servidor. */
export const leadSchema = z.object({
  respuestas: z.object({
    aventurero: z.enum(opcionesDe("aventurero")),
    viaje: z.enum(opcionesDe("viaje")),
    etapa: z.enum(opcionesDe("etapa")),
    inversion: z.enum(opcionesDe("inversion")),
    plazo: z.enum(opcionesDe("plazo")),
    equipamiento: z.enum(opcionesDe("equipamiento")),
    origen: z.enum(opcionesDe("origen")),
    comentario: texto(1500).optional().default(""),
    vehiculo: z.object({
      tipo: z.enum(tiposVehiculo.map((t) => t.id) as [string, ...string[]]),
      marca: texto(60).optional().default(""),
      modelo: texto(60).optional().default(""),
      anio: z
        .union([z.literal(""), z.coerce.number().int().min(1950).max(anioActual + 1)])
        .optional()
        .default(""),
    }),
  }),
  contacto: z.object({
    nombre: texto(80).min(2, "Ingresá tu nombre"),
    whatsapp: z
      .string()
      .trim()
      .max(30)
      .refine((v) => normalizeArPhone(v) !== null, "Ingresá un celular argentino válido, con código de área"),
    email: z.union([z.literal(""), z.string().trim().max(120).email("El email no es válido")]).optional().default(""),
    localidad: texto(80).min(2, "Ingresá tu localidad"),
    provincia: z.enum(provincias),
  }),
  consentimiento: z.literal(true, { errorMap: () => ({ message: "Necesitamos tu consentimiento para contactarte" }) }),
  /** Lo elegido en el selector "Armá tu P70". */
  seleccion: z
    .object({
      eq: z.coerce.number().refine((n) => equipamientos.some((e) => e.n === n), "Equipamiento inválido"),
      color: z.string().refine((c) => colores.some((x) => x.id === c), "Color inválido"),
      elegida: z.boolean().optional().default(false),
    })
    .optional(),
  attrib: z
    .object({
      utm_source: texto(120).optional(),
      utm_medium: texto(120).optional(),
      utm_campaign: texto(160).optional(),
      landing: texto(200).optional(),
      referrer: texto(200).optional(),
    })
    .optional()
    .default({}),
  turnstileToken: z.string().max(4096).optional(),
  /** Honeypot: un humano nunca lo completa. */
  empresa: z.string().max(200).optional(),
  /** Momento en que empezó el formulario (ms), para descartar bots instantáneos. */
  startedAt: z.number().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
