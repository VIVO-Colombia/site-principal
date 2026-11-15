import "server-only"

import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { defaultPricingConfig } from "@/lib/transport/defaults"
import type { PricingConfig } from "@/lib/transport/types"
import { createServiceSupabaseClient } from "@/lib/supabase/admin"

const filePath = path.join(process.cwd(), "data", "transport-pricing.json")

function parseConfig(value: unknown): PricingConfig | null {
  if (!value || typeof value !== "object") return null
  const config = value as PricingConfig
  if (!Array.isArray(config.vehicles) || !config.margin || !Array.isArray(config.helpers)) return null
  if (config.margin.rate < 0 || config.margin.rate >= 1) return null
  return config
}

export async function loadPricingConfig(): Promise<PricingConfig> {
  const fromEnv = process.env.TRANSPORT_PRICING_JSON?.trim()
  if (fromEnv) {
    try {
      const parsed = parseConfig(JSON.parse(fromEnv))
      if (parsed) return parsed
    } catch {
      /* sigue con la siguiente fuente */
    }
  }

  const supabase = createServiceSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase
      .from("transport_pricing_versions")
      .select("config")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!error && data && typeof data === "object" && "config" in data) {
      const parsed = parseConfig((data as { config: unknown }).config)
      if (parsed) return parsed
    }
  }

  try {
    const parsed = parseConfig(JSON.parse(readFileSync(filePath, "utf8")))
    if (parsed) return parsed
  } catch {
    /* archivo ausente */
  }

  return defaultPricingConfig
}

export async function savePricingConfig(config: PricingConfig) {
  const supabase = createServiceSupabaseClient()
  if (supabase) {
    const { error } = await supabase.from("transport_pricing_versions").insert({
      version: config.version,
      effective_from: config.effectiveFrom,
      config,
    })
    if (!error) return { stored: "database" as const }
  }

  try {
    writeFileSync(filePath, JSON.stringify(config, null, 2))
    return { stored: "file" as const }
  } catch {
    return {
      stored: null,
      error:
        "No se pudo guardar. Aplica la migración de transport_pricing_versions o define TRANSPORT_PRICING_JSON.",
    }
  }
}
