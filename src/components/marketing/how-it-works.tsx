const steps = [
  {
    number: "01",
    title: "Crea tu cuenta.",
    body: "Correo, contraseña y listo. Sin formularios eternos.",
  },
  {
    number: "02",
    title: "Activa el plan.",
    body: "Eliges vigencia, envías el comprobante y te habilitamos el acceso.",
  },
  {
    number: "03",
    title: "Arma tu ciclo.",
    body: "Cuentas, presupuesto y el primer movimiento. El saldo aparece solo.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tres pasos. Empiezas este mes.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            No hay prueba automática al registrarte. Si hace falta una, el equipo la abre con fecha
            de inicio y de cierre.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="rounded-[28px] bg-white px-6 py-7 ring-1 ring-[#e5eaf1]"
            >
              <span className="font-heading text-sm font-medium tracking-[0.16em] text-primary">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
