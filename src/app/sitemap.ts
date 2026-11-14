import type { MetadataRoute } from "next"

import { site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    publicRoutes.home,
    publicRoutes.transport,
    publicRoutes.software,
    publicRoutes.planner,
    publicRoutes.plans,
    publicRoutes.privacy,
    publicRoutes.terms,
    publicRoutes.contact,
  ]

  return paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority:
      path === publicRoutes.home
        ? 1
        : path === publicRoutes.transport ||
            path === publicRoutes.software ||
            path === publicRoutes.planner
          ? 0.8
          : 0.6,
  }))
}
