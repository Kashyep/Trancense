import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site-url";

const publicRoutes = ["/", "/product", "/how-it-works", "/consultants", "/facility-teams", "/security", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return publicRoutes.map((route) => ({ url: canonicalUrl(route), lastModified }));
}
