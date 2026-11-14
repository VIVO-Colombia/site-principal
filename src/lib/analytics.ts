import type { AnalyticsEvent } from "@/config/analytics"

type PlausibleWindow = Window & {
  plausible?: (event: string, options?: { props?: Record<string, string> }) => void
}

export function track(event: AnalyticsEvent, props?: Record<string, string | undefined>) {
  if (typeof window === "undefined") return

  const clean: Record<string, string> = {}
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (!value) continue
      clean[key] = value.slice(0, 80)
    }
  }

  ;(window as PlausibleWindow).plausible?.(event, { props: clean })
}
