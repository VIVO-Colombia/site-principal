import { ImageResponse } from "next/og"

import { brand, productName } from "@/config/brand"

export const alt = `${productName()} · ${brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7F9FC",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#2563EB",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#2563EB",
            }}
          />
          {productName()}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 64,
            lineHeight: 1.1,
            fontWeight: 650,
            color: "#17243C",
            maxWidth: 900,
          }}
        >
          {brand.tagline}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#5B6B82", maxWidth: 760 }}>
          {brand.shortDescription}
        </div>
      </div>
    ),
    size
  )
}
