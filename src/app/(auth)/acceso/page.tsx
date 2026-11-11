import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Iniciar sesión",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ razon?: string }>
}) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ razon?: string }>
}) {
  const { razon } = await searchParams

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Ingresa con el correo de tu cuenta para continuar."
      footer={
        <p>
          ¿Aún no tienes cuenta?{" "}
          <Link href={publicRoutes.register} className="font-medium text-primary hover:underline">
            Crear una
          </Link>
        </p>
      }
    >
      {razon === "configuracion" ? (
        <p className="mb-4 rounded-2xl bg-[#eef2f7] px-3 py-2 text-sm text-[#3d4d66]">
          Supabase todavía no está configurado en este entorno. El portal privado permanece
          protegido.
        </p>
      ) : null}
      {razon === "enlace" ? (
        <p className="mb-4 rounded-2xl bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
          El enlace de confirmación no es válido o ya expiró.
        </p>
      ) : null}
      <LoginForm />
    </AuthCard>
  )
}
