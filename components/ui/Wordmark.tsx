import { isPending } from "@/lib/pending";
import { site } from "@/config/site";

/**
 * Wordmark provisorio compuesto en la tipografía display, hasta tener el logo
 * en vector (site.logoSvg). Cuando llegue, reemplazar por <img src=...>.
 * El tamaño lo da `className` (text-…); sin tamaño, 1.15rem.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  if (!isPending(site.logoSvg)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logoSvg} alt="AndyCampers" className={className} />;
  }
  return (
    <span className={`font-display-x leading-none tracking-[-0.03em] ${/\btext-(\[|xs|sm|base|lg|\dxl)/.test(className) ? "" : "text-[1.15rem]"} ${className}`}>
      ANDYCAMPERS
    </span>
  );
}
