"use client"

import { useEffect } from "react"

import type { AnalyticsEvent } from "@/config/analytics"
import { track } from "@/lib/analytics"

export function TrackView({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event)
  }, [event])

  return null
}
