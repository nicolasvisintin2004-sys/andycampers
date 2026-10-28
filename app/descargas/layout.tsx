import type { Metadata } from "next";

/**
 * Páginas internas que scripts/descargas.mjs convierte en archivos (PDF de
 * preguntas y catálogo en JPG). No llevan la barra fija ni se indexan.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DescargasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`[data-barra]{display:none}body{padding-top:0;background:var(--color-durazno)}`}</style>
      {children}
    </>
  );
}
