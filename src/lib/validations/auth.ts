import { z } from "zod"

import { passwordPolicy } from "@/config/security"

const passwordSchema = z
  .string()
  .min(passwordPolicy.minLength, `Usa al menos ${passwordPolicy.minLength} caracteres`)
  .regex(/[A-Za-z]/, "Incluye al menos una letra")
  .regex(/[0-9]/, "Incluye al menos un número")

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  remember: z.boolean().optional(),
  turnstileToken: z.string().optional(),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre")
      .max(80, "El nombre es demasiado largo"),
    email: z.email("Ingresa un correo válido"),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, "Debes aceptar los términos y condiciones"),
    privacy: z
      .boolean()
      .refine((value) => value === true, "Debes autorizar el tratamiento de datos"),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const recoverSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  turnstileToken: z.string().optional(),
})

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type RecoverValues = z.infer<typeof recoverSchema>
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>
