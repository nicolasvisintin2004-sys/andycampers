import { Hero } from "@/components/hero/Hero";
import { Selector } from "@/components/selector/Selector";
import { Anatomy } from "@/components/p70/Anatomy";
import { Ficha } from "@/components/p70/Ficha";
import { InAction } from "@/components/accion/InAction";
import { Cotizar } from "@/components/cotizar/Cotizar";
import { Faq } from "@/components/faq/Faq";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqLd, productLd, videosLd } from "@/lib/jsonld";

/**
 * Landing del P70: hero (la experiencia) → "Armá tu P70" (selector) → qué es
 * el P70 (anatomía + ficha) → en acción → cotización → preguntas → footer.
 */
export default function Home() {
  return (
    <>
      <main id="contenido">
        <Hero />
        <Selector />
        <Anatomy />
        <Ficha />
        <InAction />
        <Cotizar />
        <Faq />
      </main>
      <Footer />
      <JsonLd data={[productLd(), faqLd(), ...videosLd()]} />
    </>
  );
}
