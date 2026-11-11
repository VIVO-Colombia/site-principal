import {
  AccountsMini,
  AnalysisMini,
  BudgetMini,
  GoalsMini,
  MovementsMini,
  PaymentsMini,
} from "@/components/product/mini-visuals"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Presupuestos mensuales",
    body: "Planea cuánto quieres gastar y conoce cuánto has utilizado.",
    visual: <BudgetMini />,
    wide: true,
    status: "Próximamente",
  },
  {
    title: "Movimientos",
    body: "Registra ingresos y gastos de forma rápida.",
    visual: <MovementsMini />,
    status: "Próximamente",
  },
  {
    title: "Pagos y recordatorios",
    body: "Mantén a la vista tus compromisos y fechas de vencimiento.",
    visual: <PaymentsMini />,
    status: "Próximamente",
  },
  {
    title: "Cuentas y saldos",
    body: "Organiza tu dinero en diferentes cuentas.",
    visual: <AccountsMini />,
    status: "Próximamente",
  },
  {
    title: "Ahorros y deudas",
    body: "Da seguimiento a tus metas y obligaciones.",
    visual: <GoalsMini />,
    status: "Próximamente",
  },
  {
    title: "Análisis financiero",
    body: "Comprende cómo evoluciona tu dinero.",
    visual: <AnalysisMini />,
    wide: true,
    status: "Próximamente",
  },
]

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Funcionalidades</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Todo lo que usabas en la hoja de cálculo, en un solo lugar.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            El módulo financiero se construye sobre las reglas del planeador original. En esta
            primera versión pública estas pantallas todavía no están operativas.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`rounded-[28px] bg-white p-6 ring-1 ring-[#e5eaf1] ${
                feature.wide ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <Badge variant="secondary" className="h-6 bg-[#eef2f7] text-[#5b6b82]">
                  {feature.status}
                </Badge>
              </div>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5b6b82]">{feature.body}</p>
              <div className="mt-5">{feature.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
