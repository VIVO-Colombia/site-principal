import type { MetadataRoute } from "next"

import { site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    publicRoutes.home,
    publicRoutes.plans,
    publicRoutes.login,
    publicRoutes.register,
    publicRoutes.privacy,
    publicRoutes.terms,
    publicRoutes.contact,
  ]

  return paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }))
}
