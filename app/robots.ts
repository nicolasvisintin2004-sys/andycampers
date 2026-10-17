import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // En modo demo no se indexa nada, pero los robots de vista previa de links sí
    // pasan: si no, el link llega a WhatsApp sin imagen.
    rules: site.demo
      ? [
          { userAgent: ["facebookexternalhit", "Facebot", "WhatsApp", "Twitterbot", "TelegramBot", "LinkedInBot"], allow: "/" },
          { userAgent: "*", disallow: "/" },
        ]
      : [{ userAgent: "*", allow: "/", disallow: ["/api/", "/gracias"] }],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: site.url,
  };
}
