import { z } from "zod"

export const leadKinds = ["quote", "software", "contact"] as const
export type LeadKind = (typeof leadKinds)[number]

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))

const leadBase = {
  name: z.string().trim().min(2, "Ingresa tu nombre").max(120, "El nombre es demasiado largo"),
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .min(7, "Ingresa un teléfono de contacto")
    .max(40, "El teléfono es demasiado largo"),
  company: optionalText(160),
  message: optionalText(2000),
  consent: z.boolean().refine((value) => value === true, "Autoriza el tratamiento de estos datos"),
  turnstileToken: z.string().optional(),
  companyUrl: z.string().max(0).optional().or(z.literal("")),
}

export const quoteLeadSchema = z.object({
  ...leadBase,
  kind: z.literal("quote"),
  originCity: z.string().trim().min(2, "Indica la ciudad de origen").max(80),
  destinationCity: z.string().trim().min(2, "Indica la ciudad de destino").max(80),
  cargoType: z.string().trim().min(2, "Describe el tipo de carga").max(120),
  weightVolume: optionalText(80),
  estimatedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha válida")
    .optional()
    .or(z.literal("")),
})

export const messageLeadSchema = z.object({
  ...leadBase,
  kind: z.enum(["software", "contact"]),
  topic: z.enum(["software", "transporte", "otro"]).optional(),
})

export const leadSchema = z.discriminatedUnion("kind", [quoteLeadSchema, messageLeadSchema])

export type LeadInput = z.infer<typeof leadSchema>
