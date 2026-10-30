import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/config/site";
import { ContactBar } from "@/components/layout/ContactBar";
import { INTRO_SCRIPT, LogoIntro } from "@/components/layout/LogoIntro";
import { AttributionCapture } from "@/components/providers/Attribution";
import { Analytics } from "@/components/providers/Analytics";
import { JsonLd } from "@/components/ui/JsonLd";
import { DESCRIPCION, OG_IMAGE, localBusinessLd, organizationLd } from "@/lib/jsonld";

// Las tipografías de los flyers, todas de Google Fonts (OFL), subset latin, servidas desde el sitio.
// Logo y "P70": Archivo extendida, Black, itálica (15 KB).
const archivo = localFont({
  src: [{ path: "./fonts/archivo-expanded-black-italic.woff2", weight: "900", style: "italic" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});
// Texto: Barlow. Sin preload: el primer pantallazo es la Archivo (logo y título) y la
// condensada; así no suma bytes antes del LCP (el swap no mueve nada visible).
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/barlow-600-latin.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});
// Títulos, tablas, botones y datos: Barlow Semi Condensed (sin preload: no compite con el LCP).
const barlowSc = localFont({
  src: [
    { path: "./fonts/barlow-semi-condensed-300-latin.woff2", weight: "300", style: "normal" },
    { path: "./fonts/barlow-semi-condensed-600-latin.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-barlow-sc",
  display: "swap",
  preload: false,
  fallback: ["Arial Narrow", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Camper off road P70 de acero para camioneta · AndyCampers",
    template: "%s · AndyCampers",
  },
  description: DESCRIPCION,
  applicationName: site.name,
  keywords: ["camper off road", "trailer camper para camioneta", "camper de acero", "casilla rodante off road", "camper P70", "AndyCampers"],
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: "Armá tu P70 · Camper off road de acero · AndyCampers",
    description: DESCRIPCION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Camper off-road P70 de AndyCampers" }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
  // Mientras sea demo, que no aparezca en Google.
  ...(site.demo ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#16181b",
  // La página es solo clara: sin esto, el modo oscuro forzado pinta el durazno de marrón.
  colorScheme: "only light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${archivo.variable} ${barlow.variable} ${barlowSc.variable}`} suppressHydrationWarning>
      <head>
        {/* Decide la entrada del logo antes de pintar (ver LogoIntro) */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <ContactBar />
        {children}
        <LogoIntro />
        <AttributionCapture />
        <Analytics />
        <JsonLd data={[organizationLd(), localBusinessLd()]} />
      </body>
    </html>
  );
}
