import type { MetadataRoute } from "next"

import { site } from "@/config/brand"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/admin", "/activar", "/api"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
