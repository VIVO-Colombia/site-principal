"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { updatePasswordAction } from "@/app/actions/auth"
import { PasswordField } from "@/components/auth/password-field"
import { Button } from "@/components/ui/button"
import { updatePasswordSchema, type UpdatePasswordValues } from "@/lib/validations/auth"

export function UpdatePasswordForm() {
  const [message, setMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: UpdatePasswordValues) {
    setMessage(null)
    setServerError(null)
    const result = await updatePasswordAction(values)
    if (result?.error) setServerError(result.error)
    if (result?.success) setMessage(result.success)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <PasswordField
        id="password"
        label="Nueva contraseña"
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
      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      {message ? <p className="text-sm text-[#16a34a]">{message}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando…" : "Actualizar contraseña"}
      </Button>
    </form>
  )
}
