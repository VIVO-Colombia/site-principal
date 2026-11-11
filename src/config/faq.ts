import { productName } from "@/config/brand"

export function getFaqItems() {
  const name = productName()

  return [
    {
      question: `¿Cómo funciona ${name}?`,
      answer:
        "Creas una cuenta, eliges un plan y envías una solicitud de activación. Cuando el acceso queda habilitado, configuras tu ciclo financiero, tu presupuesto y empiezas a registrar movimientos. No hay prueba automática al registrarte.",
    },
    {
      question: "¿Puedo utilizarlo desde mi celular?",
      answer:
        "Sí. El portal financiero está diseñado primero para celular. También puedes usarlo en el navegador de escritorio. Más adelante podrás instalarlo como PWA en la pantalla de inicio.",
    },
    {
      question: "¿Cómo registro mis gastos?",
      answer:
        "Cuando tu acceso esté activo, podrás registrar ingresos, gastos y transferencias con fecha, valor, categoría, cuenta y descripción. Esa pantalla todavía está en construcción en esta primera versión pública.",
    },
    {
      question: "¿Cómo funcionan las suscripciones?",
      answer:
        "El cobro inicial es manual. Eliges un plan, consultas las instrucciones de pago, envías la solicitud con el comprobante y un Super Admin revisa la activación. No hay pasarela de pago en línea en esta etapa.",
    },
    {
      question: "¿Puedo cancelar mi suscripción?",
      answer:
        "Sí. Puedes dejar de renovar al vencer el periodo. La cancelación y las renovaciones se gestionan con el equipo, no desde un botón de cobro automático.",
    },
    {
      question: "¿Qué ocurre con mis datos si vence mi plan?",
      answer:
        "Tu información se conserva. Con una suscripción vencida podrás consultar y exportar, pero no crear ni modificar registros financieros hasta que se reactive el acceso.",
    },
    {
      question: "¿Puedo exportar mi información?",
      answer:
        "La exportación forma parte del producto y se habilitará junto con el módulo financiero. En esta primera versión todavía no está disponible.",
    },
  ]
}
