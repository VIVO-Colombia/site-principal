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
    title: "Presupuesto por ciclo",
    body: "Defines el periodo. Ves cuánto planeaste y cuánto ya salió, categoría por categoría.",
    visual: <BudgetMini />,
    wide: true,
  },
  {
    title: "Movimientos",
    body: "Ingresos, gastos y transferencias con fecha, valor, cuenta y categoría.",
    visual: <MovementsMini />,
  },
  {
    title: "Pagos programados",
    body: "Arriendo, servicios y deudas con vencimiento. El dinero se mueve cuando registras el pago.",
    visual: <PaymentsMini />,
  },
  {
    title: "Cuentas y saldos",
    body: "Efectivo, banco o billetera. El saldo sale del historial, no de una celda suelta.",
    visual: <AccountsMini />,
  },
  {
    title: "Ahorros y deudas",
    body: "Metas y obligaciones con seguimiento propio.",
    visual: <GoalsMini />,
    status: "Siguiente etapa",
  },
  {
    title: "Análisis",
    body: "Evolución de tu dinero entre ciclos, cuando el núcleo esté rodando contigo.",
    visual: <AnalysisMini />,
    wide: true,
    status: "Siguiente etapa",
  },
]

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">El producto</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Un ciclo. Todas las cuentas. Cero hojas.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            Planea, registra y mira qué ya se gastó. Sin fórmulas que se rompen y sin esperar al
            cierre del mes calendario.
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
                {feature.status ? (
                  <Badge variant="secondary" className="h-6 bg-[#eef2f7] text-[#5b6b82]">
                    {feature.status}
                  </Badge>
                ) : null}
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
