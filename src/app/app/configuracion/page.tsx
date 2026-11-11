import { signOutAction } from "@/app/actions/auth"
import { ProfileForm } from "@/components/finance/profile-form"
import { Button } from "@/components/ui/button"
import { requireAppAccess } from "@/lib/auth/access"

export default async function SettingsPage() {
  const access = await requireAppAccess()

  return (
    <div className="mx-auto grid max-w-lg gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-[#5b6b82]">Tu perfil personal. El rol no se puede cambiar desde aquí.</p>
      </div>
      <ProfileForm fullName={access.profile?.full_name ?? ""} timezone={access.profile?.timezone ?? "America/Bogota"} />
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" className="h-11 w-full rounded-xl">
          Cerrar sesión
        </Button>
      </form>
    </div>
  )
}
