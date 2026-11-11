import { redirect } from "next/navigation"

export default function DebtsRedirect() {
  redirect("/app?tab=pagos")
}
