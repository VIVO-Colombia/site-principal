import type { Metadata, Viewport } from "next"

import { Providers } from "@/components/providers"
import { SkipLink } from "@/components/skip-link"
import { brand, productName, site } from "@/config/brand"
import { fhGiselle, geistMono, geistSans } from "@/lib/fonts"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${productName()} · ${brand.tagline}`,
    template: `%s · ${productName()}`,
  },
  description: brand.description,
  applicationName: productName(),
  openGraph: {
    title: `${productName()} · ${brand.tagline}`,
    description: brand.shortDescription,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${productName()} · ${brand.tagline}`,
    description: brand.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fhGiselle.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
