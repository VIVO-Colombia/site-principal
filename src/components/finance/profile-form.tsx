"use client"

import { useState } from "react"

import { updateProfileAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileForm({ fullName, timezone }: { fullName: string; timezone: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="grid gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]"
      action={async (formData) => {
        setError(null)
        setMessage(null)
        const result = await updateProfileAction({
          fullName: formData.get("fullName"),
          timezone: formData.get("timezone") || "America/Bogota",
        })
        if (result.error) setError(result.error)
        else setMessage(result.success ?? "Guardado.")
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nombre</Label>
        <Input id="fullName" name="fullName" required defaultValue={fullName} className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="timezone">Zona horaria</Label>
        <Input id="timezone" name="timezone" defaultValue={timezone} className="h-11 rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-[#16a34a]">{message}</p> : null}
      <Button type="submit" className="h-11 rounded-xl">
        Guardar perfil
      </Button>
    </form>
  )
}
