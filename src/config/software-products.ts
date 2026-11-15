import { publicRoutes } from "@/config/routes"

export const softwareProducts = [
  {
    id: "manifiestos",
    audience: "Empresas",
    name: "VIVO Manifiestos",
    summary: "Centraliza solicitudes y organiza la información de documentos de transporte.",
    points: [
      "Una sola fuente para los datos que hoy viven en papeles, chats y planillas.",
      "Estados visibles: datos, validación y seguimiento.",
      "El alcance publicado depende de lo que esté disponible. Esta página no afirma integraciones que aún no operan.",
    ],
    href: `${publicRoutes.software}#informacion`,
    cta: "Pedir información",
  },
  {
    id: "planner",
    audience: "Personas",
    name: "VIVO Planner",
    summary: "Planeación financiera personal para ver el dinero disponible y anticipar obligaciones.",
    points: [
      "Ingresos, gastos, cuentas y próximos pagos en un mismo lugar.",
      "La aplicación y su landing conservan su funcionamiento actual.",
    ],
    href: publicRoutes.planner,
    cta: "Ver VIVO Planner",
  },
] as const
