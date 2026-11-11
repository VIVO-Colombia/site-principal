"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/lib/auth/access"
import { actionError, type ActionResult } from "@/lib/action-result"
import { parseAmountInput } from "@/lib/finance/money"
import { requireSupabase } from "@/lib/supabase/require"
import { paymentRequestSchema } from "@/lib/validations/billing"

export async function submitPaymentRequestAction(formData: FormData): Promise<ActionResult> {
  try {
    const access = await requireUser()
    if (!access.user?.emailConfirmed) {
      return { error: "Confirma tu correo antes de solicitar la activación." }
    }
    if (access.profile?.account_status === "suspended") {
      return { error: "Tu cuenta está suspendida. No puedes enviar solicitudes." }
    }

    const parsed = paymentRequestSchema.safeParse({
      planId: formData.get("planId"),
      paymentMethodId: formData.get("paymentMethodId") || "",
      declaredAmount: formData.get("declaredAmount"),
      paidOn: formData.get("paidOn"),
      reference: formData.get("reference") || "",
      notes: formData.get("notes") || "",
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }

    const supabase = await requireSupabase()
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", parsed.data.planId)
      .eq("is_active", true)
      .maybeSingle()
    if (planError || !plan) return { error: "El plan seleccionado no está disponible." }

    const { data: open } = await supabase
      .from("payment_requests")
      .select("id")
      .eq("user_id", access.user.id)
      .eq("status", "submitted")
      .limit(1)
      .maybeSingle()
    if (open?.id) {
      return { error: "Ya tienes una solicitud en revisión. Espera la respuesta antes de enviar otra." }
    }

    const declared = parseAmountInput(String(parsed.data.declaredAmount))
    let receiptPath: string | null = null
    const file = formData.get("receipt")
    if (file instanceof File && file.size > 0) {
      if (file.size > 6 * 1024 * 1024) {
        return { error: "El comprobante no puede superar 6 MB." }
      }
      const extension = file.name.split(".").pop() || "bin"
      const path = `${access.user.id}/${crypto.randomUUID()}.${extension}`
      const upload = await supabase.storage.from("receipts").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      })
      if (upload.error) {
        return { error: "No se pudo guardar el comprobante. Puedes enviar la solicitud sin archivo o reintentar." }
      }
      receiptPath = path
    }

    const { error } = await supabase.from("payment_requests").insert({
      user_id: access.user.id,
      plan_id: plan.id,
      payment_method_id: parsed.data.paymentMethodId || null,
      expected_amount: plan.price_amount,
      declared_amount: declared,
      currency: plan.currency ?? "COP",
      paid_on: parsed.data.paidOn,
      reference: parsed.data.reference || null,
      receipt_path: receiptPath,
      notes: parsed.data.notes || null,
      status: "submitted",
    })
    if (error) return { error: error.message }

    revalidatePath("/activar")
    revalidatePath("/app/mi-suscripcion")
    return { success: "Solicitud enviada. Un administrador revisará el pago de forma manual." }
  } catch (error) {
    return actionError(error, "No pudimos enviar la solicitud.")
  }
}
