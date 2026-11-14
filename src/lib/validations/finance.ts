import { z } from "zod"

const amountString = z.string().trim().min(1, "Ingresa un valor")

const optionalDay = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().min(1).max(31).optional()
)

const optionalInterval = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().min(2).max(366).optional()
)

export const payScheduleSchema = z
  .object({
    frequency: z.enum(["monthly", "semimonthly", "every_n_days"]),
    payDay: optionalDay,
    payDay2: optionalDay,
    intervalDays: optionalInterval,
    anchorDate: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica la fecha del pago").optional()
    ),
    expectedAmount: z.preprocess(
      (value) => (value == null ? "" : value),
      z.string().trim().optional()
    ),
    accountId: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.string().uuid().optional()
    ),
    variable: z.preprocess(
      (value) => (value == null ? "" : value),
      z.enum(["true", "false", "on", ""]).optional()
    ),
  })
  .superRefine((value, context) => {
    if (value.frequency === "monthly" && !value.payDay) {
      context.addIssue({ code: "custom", message: "Indica el día de pago", path: ["payDay"] })
    }
    if (value.frequency === "semimonthly") {
      if (!value.payDay || !value.payDay2) {
        context.addIssue({ code: "custom", message: "Indica las dos fechas de pago", path: ["payDay"] })
      } else if (value.payDay === value.payDay2) {
        context.addIssue({ code: "custom", message: "Las dos fechas deben ser distintas", path: ["payDay2"] })
      }
    }
    if (value.frequency === "every_n_days") {
      if (!value.intervalDays) {
        context.addIssue({ code: "custom", message: "Indica cada cuántos días te pagan", path: ["intervalDays"] })
      }
      if (!value.anchorDate) {
        context.addIssue({ code: "custom", message: "Indica la fecha de un pago", path: ["anchorDate"] })
      }
    }
  })

export const cycleSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre").max(80),
  startsOn: z.string().min(1, "Indica la fecha de inicio"),
  endsOn: z.string().min(1, "Indica la fecha de finalización"),
  notes: z.string().max(500).optional(),
  duplicateFromId: z.string().uuid().optional().or(z.literal("")),
})

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ingresa un nombre").max(80),
  kind: z.enum(["cash", "bank", "digital_wallet", "pocket", "savings", "other"]),
  openingBalance: amountString.or(z.literal("0")).or(z.literal("")),
  color: z.string().max(16).optional(),
  icon: z.string().max(40).optional(),
  includeInTotal: z.enum(["true", "false", "on", ""]).optional(),
  notes: z.string().max(500).optional(),
})

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ingresa un nombre").max(80),
  groupCode: z.enum(["income", "scheduled_payment", "expense", "savings", "debt"]),
  color: z.string().max(16).optional(),
  icon: z.string().max(40).optional(),
})

export const budgetSchema = z.object({
  cycleId: z.string().uuid(),
  categoryId: z.string().uuid(),
  plannedAmount: amountString.or(z.literal("0")).or(z.literal("")),
})

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["income", "expense", "transfer", "savings_contribution", "debt_payment"]),
  amount: amountString,
  occurredOn: z.string().min(1, "Indica la fecha"),
  accountId: z.string().uuid("Selecciona una cuenta"),
  counterpartyAccountId: z.string().uuid().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  cycleId: z.string().uuid("Selecciona un ciclo"),
  description: z.string().trim().max(160).optional(),
  notes: z.string().max(500).optional(),
  scheduledPaymentId: z.string().uuid().optional().or(z.literal("")),
})

export const scheduledPaymentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ingresa el nombre del compromiso").max(80),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  expectedAmount: amountString,
  dueOn: z.string().min(1, "Indica el vencimiento"),
  preferredAccountId: z.string().uuid().optional().or(z.literal("")),
  cycleId: z.string().uuid(),
  notes: z.string().max(500).optional(),
})

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre").max(80),
  timezone: z.string().min(1),
})
