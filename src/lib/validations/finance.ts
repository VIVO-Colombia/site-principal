import { z } from "zod"

const amountString = z.string().trim().min(1, "Ingresa un valor")

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
