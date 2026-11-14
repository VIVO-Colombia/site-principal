import type { MetadataRoute } from "next"

import { site } from "@/config/brand"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app",
        "/admin",
        "/activar",
        "/api",
        "/acceso",
        "/registro",
        "/recuperar-contrasena",
        "/actualizar-contrasena",
        "/auth",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
