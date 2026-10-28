import { site } from "@/config/site";
import { IconFacebook, IconInstagram } from "@/components/ui/Icons";

/**
 * Piezas de los flyers de AndyCampers, para las descargas (catálogo y PDF):
 * el encabezado con el bloque verde y el logo, y la barra grafito del pie.
 */
export function FlyerHeader({ titulo, chico = false }: { titulo: string; chico?: boolean }) {
  return (
    <header className="flex items-center justify-between gap-6 overflow-hidden pl-8">
      <p className={`slab font-display-x uppercase ${chico ? "text-[2.6rem]" : "text-[3.4rem]"}`}>
        {titulo}
      </p>
      <p className={`font-display-x pr-8 text-forest uppercase ${chico ? "text-[1.55rem]" : "text-[2rem]"}`}>Andycampers</p>
    </header>
  );
}

export function FlyerFooter() {
  return (
    <footer className="flex items-center justify-between bg-grafito px-8 py-5 text-white">
      <span className="flex items-center gap-4">
        <IconInstagram className="size-8" />
        <IconFacebook className="size-8" />
      </span>
      <span className="font-cond text-[1.35rem] font-semibold tracking-[0.08em] uppercase">{site.dominio}</span>
    </footer>
  );
}
