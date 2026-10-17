import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/config/site";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AttributionCapture } from "@/components/providers/Attribution";
import { Analytics } from "@/components/providers/Analytics";
import { JsonLd } from "@/components/ui/JsonLd";
import { DESCRIPCION, OG_IMAGE, localBusinessLd, organizationLd } from "@/lib/jsonld";

// Display: Archivo extendida (wdth 125), Black, itálica — instancia estática de Google
// Fonts (OFL), subset latin: 15 KB. El wordmark provisorio también la usa, así la
// recta (archivo-expanded-black.woff2) no se descarga; queda en app/fonts por si vuelve.
const archivo = localFont({
  src: [{ path: "./fonts/archivo-expanded-black-italic.woff2", weight: "900", style: "italic" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});
// Texto: Inter Tight (grotesca técnica). Datos: JetBrains Mono (tabular).
const interTight = localFont({
  src: "./fonts/inter-tight-latin.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-inter-tight",
  display: "swap",
});
// La mono es para datos chicos: sin preload para no competir con el LCP.
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${archivo.variable} ${interTight.variable} ${jetbrains.variable}${site.demo ? " is-demo" : ""}`}>
      <body className="min-h-dvh">
        <DemoBanner />
        {children}
        <WhatsAppFloat />
        <SmoothScroll />
        <AttributionCapture />
        <Analytics />
        <JsonLd data={[organizationLd(), localBusinessLd()]} />
      </body>
    </html>
  );
}
