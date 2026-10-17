import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

export default function NotFound() {
  return (
    <main id="contenido" className="grid min-h-[100svh] place-items-center bg-garage px-4 text-bone">
      <div className="text-center">
        <Wordmark />
        <p className="eyebrow mt-10 text-orange-glow">Error 404</p>
        <h1 className="font-display-x mt-3 text-[clamp(2.6rem,10vw,5rem)] uppercase">Te saliste del mapa.</h1>
        <Link href="/" className="mt-8 inline-flex min-h-14 items-center bg-orange-cta px-7 text-lg font-semibold text-ink hover:bg-[#f47b52]">
          Volver al P70
        </Link>
      </div>
    </main>
  );
}
