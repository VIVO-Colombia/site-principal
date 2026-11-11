"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { approvePaymentRequestAction, rejectPaymentRequestAction } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function RequestReview({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const disabled = status !== "submitted"

  return (
    <form
      className="grid gap-2"
      action={async (formData) => {
        setError(null)
        const payload = {
          requestId,
          reviewNotes: formData.get("reviewNotes"),
        }
        const intent = String(formData.get("intent"))
        const result =
          intent === "reject"
            ? await rejectPaymentRequestAction(payload)
            : await approvePaymentRequestAction(payload)
        if (result.error) setError(result.error)
        else router.refresh()
      }}
    >
      <Textarea name="reviewNotes" placeholder="Observación de revisión" className="rounded-xl" disabled={disabled} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button name="intent" value="approve" type="submit" className="h-11 rounded-xl" disabled={disabled}>
          Aprobar
        </Button>
        <Button name="intent" value="reject" type="submit" variant="secondary" className="h-11 rounded-xl" disabled={disabled}>
          Rechazar
        </Button>
      </div>
    </form>
  )
}
