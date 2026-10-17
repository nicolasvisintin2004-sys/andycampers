import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string) => new URL(path, site.url).toString();
  return [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: u("/privacidad"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
