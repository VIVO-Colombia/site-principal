import { brand, productName } from "@/config/brand"
import { ogContentType, ogSize, vivoOgImage } from "@/lib/og-image"

export const alt = `${productName()} · ${brand.tagline}`
export const size = ogSize
export const contentType = ogContentType

export default async function OpenGraphImage() {
  return vivoOgImage({
    kicker: productName(),
    title: brand.tagline,
    description: brand.shortDescription,
  })
}
