import { productName } from "@/config/brand"

export function getFaqItems() {
  const name = productName()

  return [
    {
      question: `¿Cómo funciona ${name}?`,
      answer:
        "Creas la cuenta, confirmas el correo y entras al plan Free. Armas tu ciclo, tu presupuesto y registras movimientos desde una sola pantalla. Premium se solicita aparte; las pruebas Premium solo las concede un Super Admin.",
    },
    {
      question: "¿Puedo usarlo desde el celular?",
      answer:
        "Sí. El portal está pensado primero para celular y también corre en el navegador de escritorio. Más adelante podrás instalarlo en la pantalla de inicio.",
    },
    {
      question: "¿Cómo registro un gasto?",
      answer:
        "Abres la ruleta inferior, eliges Gasto, introduces el valor y guardas. Las transferencias mueven dinero entre tus cuentas y no cuentan como ingreso ni como gasto.",
    },
    {
      question: "¿Cómo se paga el plan?",
      answer:
        "El cobro inicial es manual. Eliges la vigencia, sigues las instrucciones, envías el comprobante y un Super Admin activa el acceso. Todavía no hay pasarela en línea.",
    },
    {
      question: "¿Puedo dejar de renovar?",
      answer:
        "Sí. Al vencer el periodo simplemente no se renueva. No hay cobro automático que siga girando.",
    },
    {
      question: "¿Qué pasa si se vence el plan?",
      answer:
        "Tus datos se quedan. Puedes consultar y exportar movimientos, pero no crear ni editar registros hasta reactivar el acceso.",
    },
    {
      question: "¿Puedo exportar mi información?",
      answer:
        "Sí. Con acceso activo o vencido puedes descargar el CSV de movimientos, con todo el historial paginado.",
    },
  ]
}
