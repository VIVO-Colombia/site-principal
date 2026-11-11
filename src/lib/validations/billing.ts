import { z } from "zod"

export const paymentRequestSchema = z.object({
  planId: z.string().uuid("Selecciona un plan"),
  paymentMethodId: z.string().uuid().optional().or(z.literal("")),
  declaredAmount: z.string().trim().min(1, "Indica el valor pagado"),
  paidOn: z.string().min(1, "Indica la fecha de pago"),
  reference: z.string().trim().max(80).optional(),
  notes: z.string().max(500).optional(),
})
