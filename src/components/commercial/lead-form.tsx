"use client"

import { useState } from "react"

import { submitLeadAction } from "@/app/actions/leads"
import { TurnstileField } from "@/components/auth/turnstile-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analyticsEvents, type AnalyticsEvent } from "@/config/analytics"
import { publicRoutes } from "@/config/routes"
import { track } from "@/lib/analytics"
import type { LeadKind } from "@/lib/validations/leads"
import { cn } from "cn"

const fieldClass = "h-12 rounded-xl bg-white px-3 text-base md:text-base"

export function LeadForm({
  kind,
  ready,
  id,
}: {
  kind: LeadKind
  ready: boolean
  id?: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [token, setToken] = useState("")
  const [started, setStarted] = useState(false)
  const [topic, setTopic] = useState<"software" | "transporte" | "otro">(
    kind === "software" ? "software" : "otro"
  )

  if (!ready) {
    return (
      <aside id={id} className="rounded-[28px] bg-white p-6 ring-1 ring-[#e3e9f2] sm:p-8">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#091B35]">
          Canal en preparación
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#596579]">
          El formulario se publica cuando hay un destino para guardar la solicitud y, en producción,
          la verificación de seguridad. Hasta entonces no pedimos datos que no podamos recibir.
        </p>
      </aside>
    )
  }

  if (success) {
    return (
      <div id={id} className="rounded-[28px] bg-white p-6 ring-1 ring-[#e3e9f2] sm:p-8" role="status">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#091B35]">
          Solicitud recibida
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#596579]">{success}</p>
      </div>
    )
  }

  function markStart() {
    if (started) return
    setStarted(true)
    const event: AnalyticsEvent =
      kind === "quote" ? analyticsEvents.quoteStart : analyticsEvents.infoRequest
    track(event)
  }

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const payload =
      kind === "quote"
        ? {
            kind,
            name: String(formData.get("name") ?? ""),
            company: String(formData.get("company") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            originCity: String(formData.get("originCity") ?? ""),
            destinationCity: String(formData.get("destinationCity") ?? ""),
            cargoType: String(formData.get("cargoType") ?? ""),
            weightVolume: String(formData.get("weightVolume") ?? ""),
            estimatedDate: String(formData.get("estimatedDate") ?? ""),
            message: String(formData.get("message") ?? ""),
            consent: formData.get("consent") === "on",
            turnstileToken: token,
            companyUrl: String(formData.get("companyUrl") ?? ""),
          }
        : {
            kind,
            name: String(formData.get("name") ?? ""),
            company: String(formData.get("company") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            message: String(formData.get("message") ?? ""),
            topic: kind === "contact" ? topic : "software",
            consent: formData.get("consent") === "on",
            turnstileToken: token,
            companyUrl: String(formData.get("companyUrl") ?? ""),
          }

    const result = await submitLeadAction(payload)
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (kind === "quote") track(analyticsEvents.quoteSent)
    else if (kind === "software") track(analyticsEvents.infoRequest)
    else track(analyticsEvents.contactSent)
    setSuccess(result.success ?? "Recibimos tu solicitud.")
  }

  return (
    <form
      id={id}
      action={onSubmit}
      onFocus={markStart}
      className="scroll-mt-28 rounded-[28px] bg-white p-5 ring-1 ring-[#e3e9f2] sm:p-8"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="name" autoComplete="name" required />
        <Field label="Empresa, si aplica" name="company" autoComplete="organization" />
        <Field label="Correo" name="email" type="email" autoComplete="email" required />
        <Field label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
        {kind === "quote" ? (
          <>
            <Field label="Ciudad de origen" name="originCity" autoComplete="address-level2" required />
            <Field label="Ciudad de destino" name="destinationCity" required />
            <Field label="Tipo de carga" name="cargoType" required />
            <Field label="Peso o volumen aproximado" name="weightVolume" />
            <Field label="Fecha estimada" name="estimatedDate" type="date" />
          </>
        ) : null}
        {kind === "contact" ? (
          <div className="sm:col-span-2">
            <Label htmlFor="topic">Motivo</Label>
            <select
              id="topic"
              name="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value as typeof topic)}
              className={cn(fieldClass, "mt-2 w-full border border-input")}
            >
              <option value="transporte">Transportar mercancía</option>
              <option value="software">Conocer VIVO Software</option>
              <option value="otro">Otro mensaje</option>
            </select>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <Label htmlFor="message">Información adicional</Label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-2 w-full rounded-xl border border-input bg-white px-3 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        name="companyUrl"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#596579]">
        <input name="consent" type="checkbox" required className="mt-1 size-4 accent-[#2457B2]" />
        <span>
          Autorizo a VIVO a usar estos datos para responder esta solicitud. La política publicada
          todavía requiere validación jurídica.{" "}
          <a href={publicRoutes.privacy} className="font-medium text-[#2457B2] underline">
            Ver privacidad
          </a>
          .
        </span>
      </label>

      <div className="mt-5">
        <TurnstileField onSuccess={setToken} />
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#dc2626]" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-6 h-12 rounded-xl px-5 text-base">
        {pending ? "Enviando…" : kind === "quote" ? "Enviar cotización" : "Enviar solicitud"}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-[#2457B2]"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={cn(fieldClass, "mt-2")}
      />
    </div>
  )
}
