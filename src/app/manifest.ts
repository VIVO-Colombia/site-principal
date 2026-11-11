import type { MetadataRoute } from "next"

import { group } from "@/config/brand"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: group.legalName,
    short_name: group.name,
    description: group.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8FC",
    theme_color: "#2563EB",
    lang: "es",
    icons: [
      {
        src: "/icon.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
