import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/product", "/how-it-works", "/consultants", "/facility-teams", "/security", "/contact"],
      disallow: ["/app/", "/onboarding", "/auth/", "/api/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/account-verified"],
    },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
