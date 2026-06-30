import type { MetadataRoute } from "next";
import { FLAT } from "@/lib/nav";

const BASE = "https://docs.zkhelios.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return FLAT.map((item) => ({
    url: `${BASE}${item.href}`,
    changeFrequency: "weekly",
    priority: item.href === "/" ? 1 : 0.6,
  }));
}
