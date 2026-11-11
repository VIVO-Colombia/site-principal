import { group } from "@/config/brand"
import { ogContentType, ogSize, vivoOgImage } from "@/lib/og-image"

export const alt = group.title
export const size = ogSize
export const contentType = ogContentType

export default async function OpenGraphImage() {
  return vivoOgImage({
    kicker: group.legalName,
    title: group.tagline,
    description: group.shortDescription,
  })
}
