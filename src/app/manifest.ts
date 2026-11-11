import type { MetadataRoute } from "next"

import { brand, productName } from "@/config/brand"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: productName(),
    short_name: productName(),
    description: brand.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9FC",
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
