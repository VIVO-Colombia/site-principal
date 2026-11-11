import { Ban, CalendarClock, FileSpreadsheet, PieChart, Wallet } from "lucide-react"

const problems = [
  {
    icon: CalendarClock,
    problem: "Olvidar pagos o fechas importantes",
    solution: "Los compromisos quedan a la vista, con su vencimiento.",
  },
  {
    icon: Wallet,
    problem: "No saber cuánto dinero queda disponible",
    solution: "El disponible se calcula con tus cuentas y tus gastos reales.",
  },
  {
    icon: Ban,
    problem: "Tener gastos dispersos",
    solution: "Cada movimiento vive en un mismo registro, con categoría y cuenta.",
  },
  {
    icon: PieChart,
    problem: "Dificultad para mantener un presupuesto",
    solution: "Planeas el ciclo y ves cuánto ya usaste, categoría por categoría.",
  },
  {
    icon: FileSpreadsheet,
    problem: "Depender de un Excel que hay que actualizar a mano",
    solution: "Las reglas del planeador se convierten en un sistema que puedes usar a diario.",
  },
]

export function ProblemSection() {
  return (
    <section id="control" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Control sin complicaciones</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Menos incertidumbre. Más claridad al decidir.
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
