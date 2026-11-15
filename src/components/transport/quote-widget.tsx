"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { publicPricingOptions, quoteRouteAction, suggestPlacesAction } from "@/app/actions/transport-quote"
import { publicRoutes } from "@/config/routes"
import { TRANSPORT_DRAFT_KEY, type TransportDraft } from "@/lib/transport/draft"
import { QUOTE_DISCLAIMER } from "@/lib/transport/defaults"
import { transportWhatsappUrl } from "@/lib/transport/whatsapp"
import type { QuoteResult } from "@/lib/transport/types"

type Option = { id: string; label: string; maxWeightKg?: number; maxVolumeM3?: number }
type Suggestion = { id: string; label: string }

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function QuoteWidget({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [maps, setMaps] = useState<boolean | null>(null)
  const [vehicles, setVehicles] = useState<Option[]>([])
  const [cargo, setCargo] = useState<Option[]>([])
  const [originCity, setOriginCity] = useState<"popayan" | "cali">("popayan")
  const [originQuery, setOriginQuery] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")
  const [originHits, setOriginHits] = useState<Suggestion[]>([])
  const [destinationHits, setDestinationHits] = useState<Suggestion[]>([])
  const [originPlace, setOriginPlace] = useState<Suggestion | null>(null)
  const [destinationPlace, setDestinationPlace] = useState<Suggestion | null>(null)
  const [vehicleId, setVehicleId] = useState("liviano")
  const [cargoId, setCargoId] = useState("general")
  const [weight, setWeight] = useState("")
  const [volume, setVolume] = useState("")
  const [date, setDate] = useState("")
  const [helpers, setHelpers] = useState(0)
  const [originFloor, setOriginFloor] = useState("")
  const [destinationFloor, setDestinationFloor] = useState("")
  const [originElevator, setOriginElevator] = useState(false)
  const [destinationElevator, setDestinationElevator] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [distance, setDistance] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [routeMessage, setRouteMessage] = useState<string | null>(null)

  useEffect(() => {
    void publicPricingOptions().then((options) => {
      setMaps(options.maps)
      setVehicles(options.vehicles)
      setCargo(options.cargo)
      if (options.vehicles[0]) setVehicleId(options.vehicles[1]?.id ?? options.vehicles[0].id)
    })
  }, [])

  useEffect(() => {
    if (!maps || originQuery.trim().length < 3 || originPlace?.label === originQuery) return
    const handle = setTimeout(() => {
      void suggestPlacesAction(originQuery, originCity).then((result) => setOriginHits(result.suggestions))
    }, 400)
    return () => clearTimeout(handle)
  }, [originQuery, originCity, maps, originPlace])

  useEffect(() => {
    if (!maps || destinationQuery.trim().length < 3 || destinationPlace?.label === destinationQuery) return
    const handle = setTimeout(() => {
      void suggestPlacesAction(destinationQuery).then((result) => setDestinationHits(result.suggestions))
    }, 400)
    return () => clearTimeout(handle)
  }, [destinationQuery, maps, destinationPlace])

  function draft(): TransportDraft {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    const cargoLabel = cargo.find((item) => item.id === cargoId)?.label ?? cargoId
    return {
      originLabel: originPlace?.label || originQuery,
      destinationLabel: destinationPlace?.label || destinationQuery,
      originCity: originCity === "popayan" ? "Popayán" : "Cali",
      destinationCity: destinationPlace?.label || destinationQuery,
      cargo: cargoLabel,
      vehicle: vehicle?.label ?? "",
      helpers: String(helpers),
      date,
      distance,
      estimate: quote?.totalCop != null ? money.format(quote.totalCop) : quote?.transportCop != null ? `${money.format(quote.transportCop)} transporte, total pendiente` : "",
      pending: quote?.message || quote?.lines.filter((line) => line.pending).map((line) => line.pending).join(" ") || "",
      access: `Origen piso ${originFloor || "s/d"}${originElevator ? " con ascensor" : ""}. Destino piso ${destinationFloor || "s/d"}${destinationElevator ? " con ascensor" : ""}.`,
      weight: [weight && `${weight} kg`, volume && `${volume} m³`].filter(Boolean).join(" · "),
      calculatedAt: new Date().toISOString(),
    }
  }

  function persist() {
    const value = draft()
    sessionStorage.setItem(TRANSPORT_DRAFT_KEY, JSON.stringify(value))
    return value
  }

  async function calculate() {
    setPending(true)
    setError(null)
    if (!originPlace || !destinationPlace) {
      setPending(false)
      setError(
        maps
          ? "Elige origen y destino de las sugerencias para calcular la distancia real."
          : "El servicio de mapas no está configurado. Envía la solicitud para una cotización manual."
      )
      setQuote(null)
      setRouteMessage(
        "Este recorrido requiere una cotización personalizada. Envíanos tu solicitud para confirmar el valor."
      )
      setStep(4)
      return
    }
    const result = await quoteRouteAction({
      originPlaceId: originPlace.id,
      destinationPlaceId: destinationPlace.id,
      vehicleId,
      cargoId,
      weightKg: weight ? Number(weight) : null,
      volumeM3: volume ? Number(volume) : null,
      helpers,
      originFloor: originFloor ? Number(originFloor) : null,
      originElevator,
      destinationFloor: destinationFloor ? Number(destinationFloor) : null,
      destinationElevator,
      travelDate: date,
    })
    setPending(false)
    if (result.route.status === "ok" && result.route.distanceKm) {
      setDistance(`${result.route.distanceKm.toFixed(1)} km`)
      setDuration(result.route.durationMinutes ? `${Math.round(result.route.durationMinutes)} min` : "")
    } else {
      setDistance("")
      setDuration("")
    }
    setRouteMessage(result.route.message ?? result.quote?.message ?? null)
    setQuote(result.quote)
    setStep(4)
  }

  if (!open) return null

  const steps = ["Ruta", "Carga", "Acceso", "Revisión", "Resultado"]

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-end sm:p-4" role="dialog" aria-modal="true" aria-labelledby="cotizador-titulo">
      <button type="button" className="absolute inset-0 bg-[#07152C]/50" aria-label="Cerrar cotizador" onClick={() => onOpenChange(false)} />
      <div className="relative flex max-h-[min(92dvh,860px)] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F3F7FF] shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#07152C]/10 px-5 py-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-[#315BFF] uppercase">VIVO Transporte</p>
            <h2 id="cotizador-titulo" className="font-heading text-2xl text-[#07152C]">Cotiza tu viaje</h2>
          </div>
          <button type="button" className="min-h-11 rounded-full px-3 text-sm text-[#07152C]" onClick={() => onOpenChange(false)}>
            Cerrar
          </button>
        </div>
        <div className="flex gap-1 px-5 pt-3" aria-label="Avance">
          {steps.map((label, index) => (
            <span key={label} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-[#315BFF]" : "bg-[#07152C]/10"}`} title={label} />
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {maps === false ? (
            <p className="mb-3 rounded-2xl bg-white px-3 py-2 text-sm leading-6 text-[#07152C]">
              Falta GOOGLE_MAPS_API_KEY. No inventamos la distancia: puedes dejar los datos y pedir confirmación manual.
            </p>
          ) : null}
          {step === 0 ? (
            <div className="space-y-4">
              <label className="block text-sm">
                Ciudad de origen
                <select className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={originCity} onChange={(event) => setOriginCity(event.target.value as "popayan" | "cali")}>
                  <option value="popayan">Popayán, Cauca</option>
                  <option value="cali">Cali, Valle del Cauca</option>
                </select>
              </label>
              <PlaceField label="Dirección de origen" query={originQuery} setQuery={(value) => { setOriginHits([]); setOriginPlace(null); setOriginQuery(value) }} hits={originHits} onPick={(hit) => { setOriginHits([]); setOriginPlace(hit); setOriginQuery(hit.label) }} />
              <PlaceField label="Destino en Colombia" query={destinationQuery} setQuery={(value) => { setDestinationHits([]); setDestinationPlace(null); setDestinationQuery(value) }} hits={destinationHits} onPick={(hit) => { setDestinationHits([]); setDestinationPlace(hit); setDestinationQuery(hit.label) }} />
              <label className="block text-sm">
                Fecha estimada
                <input type="date" className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-sm">
                Tipo de carga
                <select className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={cargoId} onChange={(event) => setCargoId(event.target.value)}>
                  {cargo.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                Vehículo
                <select className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                  {vehicles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Peso kg<input inputMode="decimal" className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
                <label className="text-sm">Volumen m³<input inputMode="decimal" className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={volume} onChange={(event) => setVolume(event.target.value)} /></label>
              </div>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-4">
              <label className="block text-sm">Ayudantes<input type="number" min={0} max={8} className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={helpers} onChange={(event) => setHelpers(Number(event.target.value))} /></label>
              <FloorField label="Piso de origen" value={originFloor} onChange={setOriginFloor} elevator={originElevator} setElevator={setOriginElevator} />
              <FloorField label="Piso de destino" value={destinationFloor} onChange={setDestinationFloor} elevator={destinationElevator} setElevator={setDestinationElevator} />
              <p className="text-sm leading-6 text-[#07152C]/70">El personal se calcula una sola vez, con la mayor dificultad. El segundo piso y más de cuatro pisos quedan para confirmación.</p>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-2 text-sm leading-6 text-[#07152C]">
              <p><strong>Origen.</strong> {originPlace?.label || originQuery || "Sin definir"}</p>
              <p><strong>Destino.</strong> {destinationPlace?.label || destinationQuery || "Sin definir"}</p>
              <p><strong>Carga.</strong> {cargo.find((item) => item.id === cargoId)?.label} · {vehicles.find((item) => item.id === vehicleId)?.label}</p>
              <p><strong>Ayudantes.</strong> {helpers}</p>
            </div>
          ) : null}
          {step === 4 ? (
            <div className="space-y-3 text-sm leading-6 text-[#07152C]">
              <p><strong>Origen.</strong> {originPlace?.label || "—"}</p>
              <p><strong>Destino.</strong> {destinationPlace?.label || destinationQuery || "—"}</p>
              <p><strong>Distancia.</strong> {distance || "No disponible"}</p>
              <p><strong>Tiempo.</strong> {duration || "No disponible"}</p>
              <p><strong>Vehículo.</strong> {vehicles.find((item) => item.id === vehicleId)?.label}</p>
              <p><strong>Carga.</strong> {cargo.find((item) => item.id === cargoId)?.label}</p>
              {quote?.transportCop != null ? <p><strong>Transporte estimado.</strong> {money.format(quote.transportCop)}</p> : null}
              {quote?.helpersCop != null && helpers > 0 ? <p><strong>Ayudantes.</strong> {money.format(quote.helpersCop)}</p> : null}
              {quote?.lines.filter((line) => line.pending).map((line) => (
                <p key={line.id}><strong>Pendiente.</strong> {line.pending}</p>
              ))}
              {quote?.definitive && quote.totalCop != null ? <p className="font-heading text-3xl">{money.format(quote.totalCop)}</p> : <p>{routeMessage || quote?.message}</p>}
              <p className="text-xs leading-5 text-[#07152C]/70">{QUOTE_DISCLAIMER} El cálculo no reserva el viaje ni es una oferta vinculante.</p>
              {error ? <p role="alert">{error}</p> : null}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2 border-t border-[#07152C]/10 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step > 0 ? <button type="button" className="h-12 flex-1 rounded-full border border-[#07152C]/15" onClick={() => setStep((value) => value - 1)}>Atrás</button> : null}
          {step < 3 ? <button type="button" className="h-12 flex-1 rounded-full bg-[#07152C] text-white" onClick={() => setStep((value) => value + 1)}>Continuar</button> : null}
          {step === 3 ? <button type="button" className="h-12 flex-1 rounded-full bg-[#315BFF] text-white" disabled={pending} onClick={() => void calculate()}>{pending ? "Calculando…" : "Ver estimación"}</button> : null}
          {step === 4 ? (
            <>
              <button type="button" className="h-12 flex-1 rounded-full bg-[#07152C] text-sm text-white" onClick={() => { persist(); onOpenChange(false); router.push(`${publicRoutes.transport}#cotizacion`) }}>Solicitar confirmación</button>
              <a className="flex h-12 flex-1 items-center justify-center rounded-full border border-[#07152C]/15 text-sm" href={transportWhatsappUrl({ origin: originPlace?.label, destination: destinationPlace?.label, cargo: cargo.find((item) => item.id === cargoId)?.label, date, distance, estimate: quote?.totalCop != null ? money.format(quote.totalCop) : undefined, helpers: String(helpers) })} target="_blank" rel="noreferrer" onClick={() => persist()}>WhatsApp</a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PlaceField({ label, query, setQuery, hits, onPick }: { label: string; query: string; setQuery: (value: string) => void; hits: Suggestion[]; onPick: (hit: Suggestion) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
      {hits.length > 0 ? (
        <ul className="mt-1 overflow-hidden rounded-xl border border-[#07152C]/10 bg-white">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button type="button" className="min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-[#F3F7FF]" onClick={() => onPick(hit)}>{hit.label}</button>
            </li>
          ))}
        </ul>
      ) : null}
    </label>
  )
}

function FloorField({ label, value, onChange, elevator, setElevator }: { label: string; value: string; onChange: (value: string) => void; elevator: boolean; setElevator: (value: boolean) => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-3">
      <label className="text-sm">{label}<input type="number" min={1} max={20} className="mt-1 h-12 w-full rounded-xl border border-[#07152C]/15 bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)} /></label>
      <label className="flex h-12 items-center gap-2 text-sm"><input type="checkbox" checked={elevator} onChange={(event) => setElevator(event.target.checked)} />Ascensor</label>
    </div>
  )
}

export function QuoteLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="inline-flex h-12 items-center rounded-full bg-[#07152C] px-4 text-sm font-medium text-white shadow-lg">
      Cotiza tu viaje
    </button>
  )
}
