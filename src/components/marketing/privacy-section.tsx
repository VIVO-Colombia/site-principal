import { KeyRound, Shield, UserRound } from "lucide-react"

const points = [
  {
    icon: UserRound,
    title: "Espacio independiente",
    body: "Cada cuenta tiene sus propias finanzas. Un usuario no consulta los movimientos de otro.",
  },
  {
    icon: KeyRound,
    title: "Acceso protegido",
    body: "El ingreso usa autenticación por correo y contraseña. Las rutas privadas se validan en el servidor.",
  },
  {
    icon: Shield,
    title: "Sin afirmaciones excesivas",
    body: "No publicamos certificaciones ni capacidades de seguridad que todavía no estén implementadas.",
  },
]

export function PrivacySection() {
  return (
    <section id="privacidad" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Privacidad</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tus finanzas son solo tuyas.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {points.map((point) => (
            <article
              key={point.title}
              className="rounded-[28px] bg-white p-6 ring-1 ring-[#e5eaf1]"
            >
              <point.icon className="size-5 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
