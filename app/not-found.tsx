import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenido" className="zona-oscura grid min-h-[calc(100svh-var(--bar-h))] place-items-center bg-forest px-4 text-white">
      <div className="text-center">
        <h1 className="font-display-x text-[clamp(2.6rem,10vw,5rem)] uppercase">Te saliste del mapa.</h1>
        <p className="titulo-cond mt-4 text-[1.6rem] text-durazno">(esta página no existe)</p>
        <Link href="/" className="mt-8 inline-flex min-h-14 items-center bg-durazno px-7 text-lg font-semibold text-forest-deep hover:bg-white">
          Volver al P70
        </Link>
      </div>
    </main>
  );
}
