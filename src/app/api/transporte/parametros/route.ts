import { NextResponse } from "next/server"

import { loadPricingConfig, savePricingConfig } from "@/lib/transport/config-store"
import type { PricingConfig } from "@/lib/transport/types"

export async function GET(request: Request) {
  const token = request.headers.get("x-transport-admin-key")
  const expected = process.env.TRANSPORT_PRICING_ADMIN_KEY?.trim()
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }
  const config = await loadPricingConfig()
  return NextResponse.json(config)
}

export async function POST(request: Request) {
  const token = request.headers.get("x-transport-admin-key") ?? ""
  const expected = process.env.TRANSPORT_PRICING_ADMIN_KEY?.trim()
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }
  const body = (await request.json()) as PricingConfig
  if (!body?.vehicles?.length || body.margin.rate < 0 || body.margin.rate >= 0.95) {
    return NextResponse.json({ error: "Configuración inválida." }, { status: 400 })
  }
  const saved = await savePricingConfig(body)
  if (saved.error) return NextResponse.json({ error: saved.error }, { status: 500 })
  return NextResponse.json({ stored: saved.stored, version: body.version })
}
