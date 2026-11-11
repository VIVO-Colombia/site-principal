import { z } from "zod"

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .min(2, "Ingresa un identificador")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Usa minúsculas, números y guiones"),
  name: z.string().trim().min(2).max(80),
  description: z.string().max(400).optional(),
  cadence: z.enum(["monthly", "quarterly", "semiannual", "annual", "custom"]),
  durationDays: z.coerce.number().int().positive("La duración debe ser positiva"),
  priceAmount: z.string().optional(),
  currency: z.string().min(3).max(8).default("COP"),
  isActive: z.boolean(),
  visibleOnLanding: z.boolean(),
  sortOrder: z.coerce.number().int(),
})

export const paymentMethodSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  instructions: z.string().max(1000).optional(),
  isActive: z.boolean(),
})

export const reviewRequestSchema = z.object({
  requestId: z.string().uuid(),
  reviewNotes: z.string().max(500).optional(),
})

export const grantTrialSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  reason: z.string().trim().min(3, "Indica el motivo").max(300),
})

export const subscriptionActionSchema = z.object({
  subscriptionId: z.string().uuid(),
  reason: z.string().trim().min(3, "Indica el motivo").max(300),
  days: z.coerce.number().int().positive().optional(),
  planId: z.string().uuid().optional(),
})

export const accountStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["enabled", "suspended"]),
  reason: z.string().trim().min(3).max(300),
})
