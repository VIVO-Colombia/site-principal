const steps = [
  {
    number: "01",
    title: "Crea tu cuenta.",
    body: "Regístrate con tu correo electrónico.",
  },
  {
    number: "02",
    title: "Activa tu acceso.",
    body: "Selecciona tu plan y solicita su activación.",
  },
  {
    number: "03",
    title: "Organiza tus finanzas.",
    body: "Configura tu presupuesto y comienza a registrar movimientos.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tres pasos. Sin prueba automática.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            Las pruebas gratuitas solamente las puede conceder un Super Admin, con fechas de inicio y
            vencimiento.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="rounded-[28px] bg-white px-6 py-7 ring-1 ring-[#e5eaf1]"
            >
              <span className="text-sm font-medium tracking-[0.16em] text-primary">
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
