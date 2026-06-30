import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, priority: 1, changeFrequency: "weekly" },
    { url: `${SITE.url}/app`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE.url}/docs`, priority: 0.7, changeFrequency: "weekly" },
  ];
}
