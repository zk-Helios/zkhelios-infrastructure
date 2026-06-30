import type { MetadataRoute } from "next";

const BASE = "https://app.zkhelios.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/prove", "/verify", "/transactions", "/explorer", "/settings"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
