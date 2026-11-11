import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Crear cuenta",
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  return (
    <Suspense>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  )
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams

  return (
    <AuthCard
      title="Crear cuenta"
      description="Regístrate con tu correo. El rol administrativo no se elige desde aquí."
      footer={
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link href={publicRoutes.login} className="font-medium text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <RegisterForm plan={plan} />
    </AuthCard>
  )
}
