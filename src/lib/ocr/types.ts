export type OcrExtraction = {
  amount: number | null
  occurredOn: string | null
  merchant: string | null
  currency: string | null
  description: string | null
  categoryHint: string | null
  confidence: number | null
  fileRef: string | null
}

export type OcrProviderResult =
  | { status: "unavailable"; message: string }
  | { status: "ready"; extraction: OcrExtraction }
  | { status: "failed"; message: string }
