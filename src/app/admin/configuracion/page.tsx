"use client"

import { useState } from "react"

import { savePaymentMethodAction } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminSettingsPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="grid max-w-xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-[#5b6b82]">
          Instrucciones de pago manual. No hay pasarela en esta fase. El primer Super Admin se asigna por SQL, nunca
          desde un formulario público.
        </p>
      </div>
      <form
        className="grid gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]"
        action={async (formData) => {
          setError(null)
          setMessage(null)
          const result = await savePaymentMethodAction({
            name: formData.get("name"),
            instructions: formData.get("instructions"),
            isActive: true,
          })
          if (result.error) setError(result.error)
          else setMessage(result.success ?? "Guardado.")
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Medio de pago</Label>
          <Input id="name" name="name" required className="h-11 rounded-xl" placeholder="Transferencia" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="instructions">Instrucciones</Label>
          <Textarea id="instructions" name="instructions" className="rounded-xl" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-[#16a34a]">{message}</p> : null}
        <Button type="submit" className="h-11 rounded-xl">
          Guardar medio de pago
        </Button>
      </form>
    </div>
  )
}
