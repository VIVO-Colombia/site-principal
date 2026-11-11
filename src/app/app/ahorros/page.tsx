import { redirect } from "next/navigation"

export default function SavingsRedirect() {
  redirect("/app?accion=ahorro")
}
