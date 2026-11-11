import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

export const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/** Display face for marketing headings. The attached cut is a test file: A–Z, a–z and digits only. Accented Spanish glyphs fall back to Geist. */
export const fhGiselle = localFont({
  src: [
    { path: "../fonts/FHGiselle-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/FHGiselle-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/FHGiselle-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/FHGiselle-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/FHGiselle-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/FHGiselle-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-giselle",
  display: "swap",
})
