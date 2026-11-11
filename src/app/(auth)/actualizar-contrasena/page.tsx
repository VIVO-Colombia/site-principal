import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata: Metadata = {
  title: "Actualizar contraseña",
}

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Nueva contraseña"
      description="Elige una contraseña nueva para recuperar el acceso a tu cuenta."
    >
      <UpdatePasswordForm />
    </AuthCard>
  )
}
