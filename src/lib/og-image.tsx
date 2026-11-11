import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = "image/png"

export async function vivoOgImage({
  kicker = "VIVO",
  title,
  description,
}: {
  kicker?: string
  title: string
  description: string
}) {
  const mark = await readFile(join(process.cwd(), "public/brand/vivo-mark.png"))

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F6F8FC",
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
            color: "#102A56",
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          {/* OG images run in Satori, which does not use next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${mark.toString("base64")}`}
            width={56}
            height={56}
            alt=""
          />
          {kicker}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 58,
            lineHeight: 1.08,
            fontWeight: 650,
            color: "#142238",
            maxWidth: 960,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 26, color: "#5B6B82", maxWidth: 820 }}>
          {description}
        </div>
      </div>
    ),
    ogSize
  )
}
