import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { RecoverForm } from "@/components/auth/recover-form"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Recuperar contraseña",
}

export default function RecoverPage() {
  return (
    <AuthCard
      title="Recuperar acceso"
      description="Te enviaremos un enlace si el correo está registrado."
      footer={
        <Link href={publicRoutes.login} className="font-medium text-primary hover:underline">
          Volver al inicio de sesión
        </Link>
      }
    >
      <RecoverForm />
    </AuthCard>
  )
}
