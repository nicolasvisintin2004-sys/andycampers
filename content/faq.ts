import { falta, type Maybe } from "@/lib/pending";
import { site } from "@/config/site";

/**
 * Preguntas frecuentes del PDF que se descarga al pie de la página
 * (app/descargas/preguntas → scripts/descargas.mjs). Se responde SOLO con datos
 * confirmados (flyers del P70 y lo que dijo Andrés); lo pendiente va con
 * `falta(...)` y sale en rojo en el PDF hasta completarlo.
 */
export const faq: { q: string; a: Maybe<string> }[] = [
  {
    q: "¿Qué vehículo necesito para remolcar el P70?",
    a: "Una camioneta. El P70 es 100% de acero, ronda los 1.100 kg y está pensado exclusivamente para camionetas. Igual revisá la capacidad de remolque que indica el manual de la tuya.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "El P70 arranca desde U$D 16.500.- y hay tres niveles de equipamiento, cada uno con su precio. Andy te pasa la cotización de tu configuración por WhatsApp.",
  },
  {
    q: "¿Qué trae de serie?",
    a: "Mobiliario de dormitorio con placar de 6 puertas y 6 compartimentos, 4 tomas de 220 V con luz LED y cargador de celulares, mesada y alacenas de 4 puertas en la cocina con luz LED, puerta lateral con ventana, ventanas importadas con apertura, mosquitero y cortina, y 2 portones traseros: cocina y espacio técnico.",
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
  {
    q: "¿Hay opcionales?",
    a: "Sí: toldo 270°, techo panorámico, porta equipajes, baño plegable, cocina baulera, panel solar y más. Pedile a Andy el listado completo con precios.",
  },
  { q: "¿Cuánto tarda la fabricación y la entrega?", a: falta("plazos de fabricación y entrega") },
  { q: "¿Cuál es la forma de pago? ¿Hay financiación?", a: falta("forma de pago, seña y si hay financiación") },
  { q: "¿Qué garantía tiene?", a: falta("garantía del P70") },
  { q: "¿Puedo verlo en persona?", a: `Sí. ${site.visitas.texto}` },
];
