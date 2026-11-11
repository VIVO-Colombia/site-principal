import type { Metadata } from "next"

import { group, site } from "@/config/brand"

type PageSeo = {
  title: string
  description: string
  path: string
}

export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  const url = path === "/" ? site.url : `${site.url}${path}`

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      locale: site.locale,
      type: "website",
      siteName: group.legalName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}
