import { redirect } from "next/navigation"

export default function PlanningRedirect() {
  redirect("/app?tab=presupuesto")
}
