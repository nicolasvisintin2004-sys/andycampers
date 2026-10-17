import { falta, type Maybe } from "@/lib/pending";

/**
 * Preguntas frecuentes: se responde SOLO con datos confirmados (flyers del P70).
 * Las respuestas pendientes van con `falta(...)`: se ven como cartel rojo y no
 * se publican en el JSON-LD de FAQPage.
 */
export const faq: { q: string; a: Maybe<string> }[] = [
  {
    q: "¿Qué vehículo necesito para remolcar el P70?",
    a: "Una camioneta. El P70 es 100% de acero, ronda los 1.100 kg y está pensado exclusivamente para camionetas. Igual revisá la capacidad de remolque que indica el manual de la tuya.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "El P70 arranca desde USD 16.500. El valor final depende del equipamiento que elijas: Andy te pasa la cotización de tu configuración por WhatsApp.",
  },
  {
    q: "¿Es homologado? ¿Tiene patente?",
    a: "Sí. El chasis es vehicular, de chapa plegada con corte láser (no caño ni perfiles de construcción), homologado y con patente. Para circular trae tortuga homologada, cadenas y pata estabilizadora.",
  },
  {
    q: "¿Cómo frena?",
    a: "Tiene frenos eléctricos que se accionan solos cuando pisás el freno de la camioneta.",
  },
  {
    q: "¿A qué velocidad se puede viajar?",
    a: "La suspensión inteligente Hard & Soft fue probada a 165 km/h: suave en los pozos y estable en ruta. Igual, respetá siempre las velocidades máximas para vehículos con tráiler.",
  },
  {
    q: "¿Cómo se comporta con frío o calor?",
    a: "Las paredes llevan 80 mm de aislamiento térmico y la pintura exterior es antirrayones.",
  },
  { q: "¿Cuánto tarda la fabricación y la entrega?", a: falta("plazos de fabricación y entrega") },
  { q: "¿Cuál es la forma de pago? ¿Hay financiación?", a: falta("forma de pago, seña y si hay financiación") },
  { q: "¿Qué garantía tiene?", a: falta("garantía del P70") },
  { q: "¿Puedo verlo en persona?", a: falta("dirección del taller, horario y si se puede visitar") },
];
