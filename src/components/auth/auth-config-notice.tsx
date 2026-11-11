import { isSupabaseBrowserConfigured } from "@/lib/public-env"

export function AuthConfigNotice() {
  if (isSupabaseBrowserConfigured()) {
    return null
  }

  return (
    <div className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#9a3412]">
      La autenticación real se activa cuando existan las claves de Supabase. Puedes revisar el
      formulario, pero el ingreso no creará una sesión hasta completar esa configuración.
    </div>
  )
}
