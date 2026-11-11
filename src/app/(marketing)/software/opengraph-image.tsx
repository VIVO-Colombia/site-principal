import { ogContentType, ogSize, vivoOgImage } from "@/lib/og-image"

export const alt = "VIVO Software | Gestión de manifiestos"
export const size = ogSize
export const contentType = ogContentType

export default async function OpenGraphImage() {
  return vivoOgImage({
    kicker: "VIVO Software",
    title: "Menos trámites. Más movimiento.",
    description: "Gestión y emisión de documentos de transporte, en una solución digital.",
  })
}
