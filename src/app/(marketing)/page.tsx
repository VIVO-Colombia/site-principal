import type { Metadata } from "next"

import { GroupHome } from "@/components/corporate/group-home"
import { JsonLd } from "@/components/seo/json-ld"
import { group, site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: group.title,
  description: group.description,
  path: publicRoutes.home,
})

export default function GroupPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: group.legalName,
          url: site.url,
          description: group.description,
          slogan: group.tagline,
        }}
      />
      <GroupHome />
    </>
  )
}
