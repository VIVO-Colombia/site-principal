"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { recoverPasswordAction } from "@/app/actions/auth"
import { AuthConfigNotice } from "@/components/auth/auth-config-notice"
import { TurnstileField } from "@/components/auth/turnstile-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { recoverSchema, type RecoverValues } from "@/lib/validations/auth"

export function RecoverForm() {
  const [message, setMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<RecoverValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "", turnstileToken: "" },
  })

  async function onSubmit(values: RecoverValues) {
    setMessage(null)
    setServerError(null)
    const result = await recoverPasswordAction(values)
    if (result?.error) setServerError(result.error)
    if (result?.success) setMessage(result.success)
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
      <TurnstileField onSuccess={(token) => form.setValue("turnstileToken", token)} />
      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      {message ? <p className="text-sm text-[#16a34a]">{message}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  )
}
