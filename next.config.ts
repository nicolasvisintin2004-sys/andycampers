import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  // `next dev` usa su propia carpeta: así no pisa el build de producción de `next start`.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85],
    deviceSizes: [375, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    const inmutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/video/:path*", headers: inmutable },
      // Videos demo del selector (en producción van al CDN: NEXT_PUBLIC_MEDIA_BASE_URL).
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
});

export default nextConfig;
