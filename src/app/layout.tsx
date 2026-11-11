import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Providers } from "@/components/providers"
import { SkipLink } from "@/components/skip-link"
import { brand, productName, site } from "@/config/brand"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
