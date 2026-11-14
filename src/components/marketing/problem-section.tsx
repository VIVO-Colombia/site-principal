import { Ban, CalendarClock, FileSpreadsheet, PieChart, Wallet } from "lucide-react"

const problems = [
  {
    icon: CalendarClock,
    problem: "Se te pasan las fechas.",
    solution: "Cada compromiso tiene vencimiento y queda a la vista.",
  },
  {
    icon: Wallet,
    problem: "No sabes cuánto te queda.",
    solution: "El disponible sale de tus cuentas y de lo que ya gastaste.",
  },
  {
    icon: Ban,
    problem: "Los gastos viven en el chat, el banco y la cabeza.",
    solution: "Un solo registro: fecha, valor, categoría y cuenta.",
  },
  {
    icon: PieChart,
    problem: "El presupuesto se queda en un propósito.",
    solution: "Planeas el ciclo y ves, categoría por categoría, cuánto ya usaste.",
  },
  {
    icon: FileSpreadsheet,
    problem: "El Excel se rompe en cuanto lo tocas.",
    solution: "Las reglas del planeador, listas para usar todos los días.",
  },
]

export function ProblemSection() {
  return (
    <section id="control" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">El problema</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#091B35] sm:text-4xl">
            El problema no es anotar. Es no saber qué puedes gastar.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-[#e5eaf1] overflow-hidden rounded-[28px] bg-white ring-1 ring-[#e5eaf1]">
          {problems.map((item) => (
            <div
              key={item.problem}
              className="grid gap-3 px-5 py-5 sm:grid-cols-[auto_1fr_1fr] sm:items-center sm:gap-8 sm:px-7"
            >
              <item.icon className="size-5 text-primary" />
              <p className="text-[15px] text-[#5b6b82]">{item.problem}</p>
              <p className="text-[15px] font-medium text-[#17243c]">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
