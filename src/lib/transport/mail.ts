import type { LeadInput } from "@/lib/validations/leads"

const topics: Record<string, string> = {
  transporte: "Transporte",
  software: "Soluciones de software",
  planner: "VIVO Planner",
  general: "Consulta general",
  otro: "Consulta general",
}

export function commercialMail(lead: LeadInput) {
  if (lead.kind === "quote") {
    const body = [
      "Datos del cliente",
      `Nombre: ${lead.name}`,
      `Correo: ${lead.email}`,
      `Celular: ${lead.phone}`,
      `Empresa: ${lead.company || "No indicada"}`,
      "",
      "Servicio",
      `Origen: ${lead.originCity}`,
      `Dirección de origen: ${lead.originAddress || "No indicada"}`,
      `Destino: ${lead.destinationCity}`,
      `Dirección de destino: ${lead.destinationAddress || "No indicada"}`,
      `Fecha estimada: ${lead.estimatedDate || "No indicada"}`,
      `Tipo de carga: ${lead.cargoType}`,
      `Peso o volumen: ${lead.weightVolume || "No indicado"}`,
      `Vehículo: ${lead.vehicleLabel || "No indicado"}`,
      `Ayudantes: ${lead.helpersLabel || "No indicados"}`,
      `Acceso: ${lead.accessNotes || "No indicado"}`,
      `Distancia: ${lead.distanceLabel || "No calculada"}`,
      `Valor estimado: ${lead.estimateLabel || "Pendiente de confirmación"}`,
      `Conceptos pendientes: ${lead.pendingNotes || "Ninguno informado"}`,
      "",
      "Observaciones",
      lead.message || "Sin observaciones",
      "",
      `Origen de la solicitud: sitio corporativo / transporte`,
      `Fecha de envío: ${new Date().toISOString()}`,
    ].join("\n")

    return { subject: "Nueva solicitud de transporte — VIVO Colombia", body }
  }

  const topic = topics[lead.topic ?? "general"] ?? "Consulta general"
  const body = [
    "Datos del cliente",
    `Nombre: ${lead.name}`,
    `Correo: ${lead.email}`,
    `Celular: ${lead.phone}`,
    `Empresa: ${lead.company || "No indicada"}`,
    "",
    `Interés: ${topic}`,
    "",
    "Mensaje",
    lead.message || "Sin mensaje adicional",
    "",
    "Origen de la solicitud: sitio corporativo",
    `Fecha de envío: ${new Date().toISOString()}`,
  ].join("\n")

  return { subject: `Nueva solicitud — ${topic} — VIVO Colombia`, body }
}
