"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { signUpAction } from "@/app/actions/auth"
import { AuthConfigNotice } from "@/components/auth/auth-config-notice"
import { PasswordField } from "@/components/auth/password-field"
import { TurnstileField } from "@/components/auth/turnstile-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analyticsEvents } from "@/config/analytics"
import { catalogPlans } from "@/config/plans"
import { track } from "@/lib/analytics"
import { publicRoutes } from "@/config/routes"
import { registerSchema, type RegisterValues } from "@/lib/validations/auth"

export function RegisterForm({ plan }: { plan?: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      privacy: false,
      turnstileToken: "",
    },
  })

  async function onSubmit(values: RegisterValues) {
    setServerError(null)
    setMessage(null)
    const result = await signUpAction(values)
    if (result?.error) {
      setServerError(result.error)
      return
    }
    if (result?.success) {
      track(analyticsEvents.signupComplete, { plan: plan || "gratis" })
      setMessage(result.success)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <AuthConfigNotice />
      {plan ? (
        <p className="rounded-xl bg-[#eef2f7] px-3 py-2 text-sm">
          Plan seleccionado:{" "}
          <span className="font-medium">
            {catalogPlans.find((item) => item.id === plan)?.name ?? plan}
          </span>
        </p>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" autoComplete="name" className="h-11 rounded-xl" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="h-11 rounded-xl"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <PasswordField
        id="password"
        label="Contraseña"
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <PasswordField
        id="confirmPassword"
        label="Confirmar contraseña"
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <label className="flex items-start gap-3 text-sm leading-5">
        <Checkbox
          className="mt-0.5"
          checked={acceptedTerms}
          onCheckedChange={(checked) => {
            const value = Boolean(checked)
            setAcceptedTerms(value)
            form.setValue("terms", value, { shouldValidate: true })
          }}
        />
        <span>
          Acepto los{" "}
          <Link href={publicRoutes.terms} className="font-medium text-primary hover:underline">
            términos y condiciones
          </Link>
          .
        </span>
      </label>
      {form.formState.errors.terms ? (
        <p className="text-sm text-destructive">{form.formState.errors.terms.message}</p>
      ) : null}
      <label className="flex items-start gap-3 text-sm leading-5">
        <Checkbox
          className="mt-0.5"
          checked={acceptedPrivacy}
          onCheckedChange={(checked) => {
            const value = Boolean(checked)
            setAcceptedPrivacy(value)
            form.setValue("privacy", value, { shouldValidate: true })
          }}
        />
        <span>
          Autorizo el tratamiento de datos descrito en{" "}
          <Link href={publicRoutes.privacy} className="font-medium text-primary hover:underline">
            privacidad
          </Link>
          .
        </span>
      </label>
      {form.formState.errors.privacy ? (
        <p className="text-sm text-destructive">{form.formState.errors.privacy.message}</p>
      ) : null}
      <TurnstileField onSuccess={(token) => form.setValue("turnstileToken", token)} />
      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      {message ? <p className="text-sm text-[#16a34a]">{message}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creando cuenta…" : "Crear mi cuenta"}
      </Button>
    </form>
  )
}
