import { ogContentType, ogSize, vivoOgImage } from "@/lib/og-image"

export const alt = "VIVO Transporte | Transporte de carga"
export const size = ogSize
export const contentType = ogContentType

export default async function OpenGraphImage() {
  return vivoOgImage({
    kicker: "VIVO Transporte",
    title: "Tu carga en movimiento. Tu negocio avanzando.",
    description: "Soluciones de transporte terrestre de carga para tu operación.",
  })
}
