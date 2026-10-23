import { Hero } from "@/components/hero/Hero";
import { Selector } from "@/components/selector/Selector";
import { QueEsP70 } from "@/components/p70/QueEsP70";
import { InAction } from "@/components/accion/InAction";
import { Cotizar } from "@/components/cotizar/Cotizar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { productLd, videosLd } from "@/lib/jsonld";

/**
 * Landing del P70: hero (la experiencia y 3 videos) → "Armá tu P70" (selector) →
 * qué es el P70 (piezas clave + ficha) → en acción → cotización → footer.
 */
export default function Home() {
  return (
    <>
      <main id="contenido">
        <Hero />
        <Selector />
        <QueEsP70 />
        <InAction />
        <Cotizar />
      </main>
      <Footer />
      <JsonLd data={[productLd(), ...videosLd()]} />
    </>
  );
}
