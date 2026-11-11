import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { brand, productName } from "@/config/brand"

export const alt = `${productName()} · ${brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const mark = await readFile(join(process.cwd(), "public/brand/vivo-mark.png"))

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
            color: "#17243C",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <img
            src={`data:image/png;base64,${mark.toString("base64")}`}
            width={56}
            height={56}
            alt=""
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
