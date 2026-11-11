"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { signInAction } from "@/app/actions/auth"
import { AuthConfigNotice } from "@/components/auth/auth-config-notice"
import { PasswordField } from "@/components/auth/password-field"
import { TurnstileField } from "@/components/auth/turnstile-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { publicRoutes } from "@/config/routes"
import { loginSchema, type LoginValues } from "@/lib/validations/auth"

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [remember, setRemember] = useState(true)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
      turnstileToken: "",
    },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    const result = await signInAction(values)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <AuthConfigNotice />
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
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <div className="flex items-center justify-between gap-3">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <Checkbox
            checked={remember}
            onCheckedChange={(checked) => {
              const value = Boolean(checked)
              setRemember(value)
              form.setValue("remember", value)
            }}
          />
          Recordar sesión
        </label>
        <Link
          href={publicRoutes.recoverPassword}
          className="text-sm font-medium text-primary hover:underline"
        >
          Recuperar contraseña
        </Link>
      </div>
      <TurnstileField onSuccess={(token) => form.setValue("turnstileToken", token)} />
      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  )
}
