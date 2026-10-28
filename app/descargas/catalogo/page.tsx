import Link from "next/link";
import { equipamientos, nombreEq, slugEq } from "@/config/p70";

/** Índice de las piezas del catálogo: lo recorre scripts/descargas.mjs. */
export default function CatalogoIndice() {
  return (
    <main className="p-8">
      <ul className="space-y-2">
        {equipamientos.map((e) => (
          <li key={e.n}>
            <Link data-nivel={slugEq(e.n)} href={`/descargas/catalogo/${slugEq(e.n)}`} className="font-cond text-xl font-semibold text-forest uppercase underline">
              {nombreEq(e.n)}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
