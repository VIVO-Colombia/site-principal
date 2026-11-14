const steps = [
  {
    number: "01",
    title: "Reúne lo que entra.",
    body: "Registras ingresos en el ciclo que tú defines, no en un mes calendario fijo.",
  },
  {
    number: "02",
    title: "Deja las obligaciones a la vista.",
    body: "Pagos programados y gastos del periodo quedan antes de decidir un gasto nuevo.",
  },
  {
    number: "03",
    title: "Mira cuánto puedes usar.",
    body: "El disponible sale de tus cuentas, tu presupuesto y lo que ya salió.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#091B35] sm:text-4xl">
            Un ciclo, de lo que entra a lo que puedes gastar.
          </h2>
          <p className="mt-3 text-[#596579]">
            El plan Free no vence. Premium se solicita aparte y se activa a mano, sin pasarela.
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
