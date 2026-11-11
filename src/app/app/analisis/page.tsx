import { redirect } from "next/navigation"

export default function AnalysisRedirect() {
  redirect("/app?tab=analisis")
}
