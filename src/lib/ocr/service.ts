import "server-only"

import type { OcrProviderResult } from "@/lib/ocr/types"

/**
 * Provider-agnostic OCR port. Returns unavailable until a real extractor is configured.
 * Never invents amounts from a photograph.
 */
export async function extractReceiptFields(_input: {
  storagePath: string
  contentType: string
}): Promise<OcrProviderResult> {
  if (!process.env.OCR_PROVIDER) {
    return {
      status: "unavailable",
      message: "La lectura automática de recibos todavía no está configurada.",
    }
  }

  return {
    status: "unavailable",
    message: "La lectura automática de recibos todavía no está configurada.",
  }
}
