export type ActionResult = {
  error?: string
  success?: string
  id?: string
}

export function actionError(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error && error.message) {
    return { error: error.message }
  }
  return { error: fallback }
}
