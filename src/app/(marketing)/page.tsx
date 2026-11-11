import type { Metadata } from "next"

import { GroupHome } from "@/components/corporate/group-home"
import { group } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: group.title,
  description: group.description,
  path: publicRoutes.home,
})

export default function GroupPage() {
  return <GroupHome />
}
