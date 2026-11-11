export default function AdminNotificationsPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
      <p className="mt-2 text-sm leading-6 text-[#5b6b82]">
        Los avisos de activación y rechazo se guardan en la bandeja interna del usuario. El correo transaccional de
        Supabase Auth ya envía confirmación y recuperación. Los recordatorios push no están configurados y no se
        simulan.
      </p>
    </div>
  )
}
