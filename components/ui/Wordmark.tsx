import { isPending } from "@/lib/pending";
import { site } from "@/config/site";

/**
 * Wordmark provisorio compuesto en la tipografía display, hasta tener el logo
 * en vector (site.logoSvg). Cuando llegue, reemplazar por <img src=...>.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  if (!isPending(site.logoSvg)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logoSvg} alt="AndyCampers" className={className} />;
  }
  return (
    <span className={`font-display-x text-[1.15rem] leading-none tracking-[-0.03em] ${className}`}>
      ANDYCAMPERS
    </span>
  );
}
