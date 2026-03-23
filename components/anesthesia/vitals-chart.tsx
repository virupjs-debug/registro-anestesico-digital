'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog'
import {
  ComposedChart, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { Plus, Pencil, Trash2, Activity, Printer } from 'lucide-react'
import type { VitalSign, ProcedureEvent } from '@/lib/types'

// ─────────────────────────────────────────────
// Types & props
// ─────────────────────────────────────────────
interface VitalsChartProps {
  vitals: VitalSign[]
  events?: ProcedureEvent[]
  onAddVital?: (v: VitalSign) => void
  onUpdateVital?: (v: VitalSign) => void
  onDeleteVital?: (timestamp: number) => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function nearestVitalTime(eventTime: string, vitalTimes: string[]): string | null {
  if (!vitalTimes.length) return null
  const eMin = toMinutes(eventTime)
  let best = vitalTimes[0]
  let bestDiff = Math.abs(toMinutes(vitalTimes[0]) - eMin)
  for (const vt of vitalTimes) {
    const diff = Math.abs(toMinutes(vt) - eMin)
    if (diff < bestDiff) { bestDiff = diff; best = vt }
  }
  return bestDiff <= 10 ? best : null
}

// Aggregate events → one label per time slot (avoid duplicates on chart)
function buildEventMarkers(events: ProcedureEvent[], vitalTimes: string[]) {
  const map = new Map<string, string[]>()
  for (const ev of events) {
    const nearest = nearestVitalTime(ev.time, vitalTimes)
    if (!nearest) continue
    if (!map.has(nearest)) map.set(nearest, [])
    map.get(nearest)!.push(ev.event)
  }
  return map
}

// ─────────────────────────────────────────────
// Event Reference Lines (shared across charts)
// ─────────────────────────────────────────────
function EventRefLines({ markerMap }: { markerMap: Map<string, string[]> }) {
  return (
    <>
      {[...markerMap.entries()].map(([time, labels]) => (
        <ReferenceLine
          key={time}
          x={time}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{
            value: labels.map(l => l.length > 14 ? l.slice(0, 13) + '…' : l).join(' / '),
            position: 'top',
            fill: '#f59e0b',
            fontSize: 9,
            fontWeight: 600,
          }}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────
// Header indicator pill
// ─────────────────────────────────────────────
function Pill({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground" suppressHydrationWarning>{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Empty form helper
// ─────────────────────────────────────────────
function emptyForm(): Partial<VitalSign> & { time: string } {
  return {
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    hr: undefined, sbp: undefined, dbp: undefined, map: undefined,
    spo2: undefined, etco2: undefined, temp: undefined, rr: undefined,
    bis: undefined, nirsL: undefined, nirsR: undefined,
    abpSys: undefined, abpDia: undefined, abpMean: undefined, cvp: undefined,
  }
}

function vitalToForm(v: VitalSign): ReturnType<typeof emptyForm> {
  return {
    time: v.time, hr: v.hr, sbp: v.sbp, dbp: v.dbp, map: v.map,
    spo2: v.spo2, etco2: v.etco2, temp: v.temp, rr: v.rr,
    bis: v.bis, nirsL: v.nirsL, nirsR: v.nirsR,
    abpSys: v.abpSys, abpDia: v.abpDia, abpMean: v.abpMean, cvp: v.cvp,
  }
}

// ─────────────────────────────────────────────
// Numeric input field (small, returns undefined if empty)
// ─────────────────────────────────────────────
function NumField({ label, unit, value, onChange, required }: {
  label: string; unit: string; value: number | undefined
  onChange: (v: number | undefined) => void; required?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">
        {label} <span className="text-muted-foreground font-normal">({unit})</span>
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        type="number"
        step="any"
        className="h-8 text-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Vital sign form (add / edit)
// ─────────────────────────────────────────────
function VitalForm({
  form, onChange, onSubmit, submitLabel, nextTimestamp,
}: {
  form: ReturnType<typeof emptyForm>
  onChange: (patch: Partial<ReturnType<typeof emptyForm>>) => void
  onSubmit: () => void
  submitLabel: string
  nextTimestamp: number
}) {
  const [showNeuro, setShowNeuro] = useState(
    !!(form.bis !== undefined || form.nirsL !== undefined || form.nirsR !== undefined)
  )
  const [showInvasive, setShowInvasive] = useState(
    !!(form.abpSys !== undefined || form.cvp !== undefined)
  )

  // Auto-calc MAP if sbp/dbp present and map not set
  const handleSbpDbp = (patch: Partial<ReturnType<typeof emptyForm>>) => {
    const sbp = patch.sbp ?? form.sbp
    const dbp = patch.dbp ?? form.dbp
    if (sbp !== undefined && dbp !== undefined && form.map === undefined) {
      patch.map = Math.round((sbp + 2 * dbp) / 3)
    }
    onChange(patch)
  }

  const isValid = form.time && form.hr !== undefined && form.sbp !== undefined &&
    form.dbp !== undefined && form.spo2 !== undefined

  return (
    <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
      {/* Hora */}
      <div className="space-y-1">
        <Label className="text-xs">Hora <span className="text-destructive">*</span></Label>
        <Input
          type="time"
          className="h-8 text-sm w-32"
          value={form.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />
      </div>

      {/* Hemodinámicos */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hemodinámicos</p>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="FC" unit="lpm" value={form.hr} onChange={(v) => onChange({ hr: v })} required />
          <NumField label="PA Sistólica" unit="mmHg" value={form.sbp} onChange={(v) => handleSbpDbp({ sbp: v })} required />
          <NumField label="PA Diastólica" unit="mmHg" value={form.dbp} onChange={(v) => handleSbpDbp({ dbp: v })} required />
          <NumField label="PAM" unit="mmHg" value={form.map} onChange={(v) => onChange({ map: v })} />
        </div>
      </div>

      {/* Respiratorios */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Respiratorios</p>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="SpO2" unit="%" value={form.spo2} onChange={(v) => onChange({ spo2: v })} required />
          <NumField label="EtCO2" unit="mmHg" value={form.etco2} onChange={(v) => onChange({ etco2: v })} />
          <NumField label="FR" unit="rpm" value={form.rr} onChange={(v) => onChange({ rr: v })} />
          <NumField label="Temperatura" unit="°C" value={form.temp} onChange={(v) => onChange({ temp: v })} />
        </div>
      </div>

      {/* Neuromonitoreo (toggle) */}
      <div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
          onClick={() => setShowNeuro((p) => !p)}
        >
          <span>{showNeuro ? '▾' : '▸'}</span> Neuromonitoreo (BIS / NIRS)
        </button>
        {showNeuro && (
          <div className="grid grid-cols-2 gap-3">
            <NumField label="BIS" unit="0–100" value={form.bis} onChange={(v) => onChange({ bis: v })} />
            <div />
            <NumField label="NIRS Izquierdo" unit="%" value={form.nirsL} onChange={(v) => onChange({ nirsL: v })} />
            <NumField label="NIRS Derecho" unit="%" value={form.nirsR} onChange={(v) => onChange({ nirsR: v })} />
          </div>
        )}
      </div>

      {/* Presiones invasivas (toggle) */}
      <div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
          onClick={() => setShowInvasive((p) => !p)}
        >
          <span>{showInvasive ? '▾' : '▸'}</span> Presiones Invasivas (Línea Arterial / PVC)
        </button>
        {showInvasive && (
          <div className="grid grid-cols-2 gap-3">
            <NumField label="LA Sistólica" unit="mmHg" value={form.abpSys} onChange={(v) => onChange({ abpSys: v })} />
            <NumField label="LA Diastólica" unit="mmHg" value={form.abpDia} onChange={(v) => onChange({ abpDia: v })} />
            <NumField label="LA Media" unit="mmHg" value={form.abpMean} onChange={(v) => onChange({ abpMean: v })} />
            <NumField label="PVC" unit="mmHg" value={form.cvp} onChange={(v) => onChange({ cvp: v })} />
          </div>
        )}
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={!isValid}>
        {submitLabel}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function VitalsChart({ vitals, events = [], onAddVital, onUpdateVital, onDeleteVital }: VitalsChartProps) {
  const [mounted, setMounted] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(emptyForm())
  const [editTimestamp, setEditTimestamp] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const latest = vitals[vitals.length - 1]
  const vitalTimes = vitals.map((v) => v.time)
  const markerMap = buildEventMarkers(events, vitalTimes)

  const hasBis = vitals.some((v) => v.bis !== undefined)
  const hasNirs = vitals.some((v) => v.nirsL !== undefined || v.nirsR !== undefined)
  const hasAbp = vitals.some((v) => v.abpSys !== undefined)
  const hasCvp = vitals.some((v) => v.cvp !== undefined)

  const nextTimestamp = vitals.length ? Math.max(...vitals.map(v => v.timestamp)) + 1 : 1

  type PrintView = 'all' | 'hemodynamics' | 'respiratory' | 'records'
  const [printView, setPrintView] = useState<PrintView>('all')
  const PRINT_OPTIONS: { value: PrintView; label: string }[] = [
    { value: 'all',          label: 'Todos' },
    { value: 'hemodynamics', label: 'Hemodinámicos' },
    { value: 'respiratory',  label: 'Respiratorios' },
    { value: 'records',      label: 'Tabla' },
  ]

  // ── Add ──
  const handleAdd = () => {
    if (!addForm.time || addForm.hr === undefined || addForm.sbp === undefined ||
      addForm.dbp === undefined || addForm.spo2 === undefined) return
    const newVital: VitalSign = {
      time: addForm.time,
      timestamp: nextTimestamp,
      hr: addForm.hr!,
      sbp: addForm.sbp!,
      dbp: addForm.dbp!,
      map: addForm.map ?? Math.round((addForm.sbp! + 2 * addForm.dbp!) / 3),
      spo2: addForm.spo2!,
      etco2: addForm.etco2 ?? 0,
      temp: addForm.temp ?? 36.5,
      rr: addForm.rr ?? 0,
      bis: addForm.bis,
      nirsL: addForm.nirsL,
      nirsR: addForm.nirsR,
      abpSys: addForm.abpSys,
      abpDia: addForm.abpDia,
      abpMean: addForm.abpMean,
      cvp: addForm.cvp,
    }
    onAddVital?.(newVital)
    setAddOpen(false)
    setAddForm(emptyForm())
  }

  // ── Edit ──
  const openEdit = (v: VitalSign) => {
    setEditTimestamp(v.timestamp)
    setEditForm(vitalToForm(v))
    setEditOpen(true)
  }

  const handleUpdate = () => {
    if (editTimestamp === null || !onUpdateVital) return
    const existing = vitals.find(v => v.timestamp === editTimestamp)
    if (!existing) return
    onUpdateVital({
      ...existing,
      time: editForm.time,
      hr: editForm.hr ?? existing.hr,
      sbp: editForm.sbp ?? existing.sbp,
      dbp: editForm.dbp ?? existing.dbp,
      map: editForm.map ?? existing.map,
      spo2: editForm.spo2 ?? existing.spo2,
      etco2: editForm.etco2 ?? existing.etco2,
      temp: editForm.temp ?? existing.temp,
      rr: editForm.rr ?? existing.rr,
      bis: editForm.bis,
      nirsL: editForm.nirsL,
      nirsR: editForm.nirsR,
      abpSys: editForm.abpSys,
      abpDia: editForm.abpDia,
      abpMean: editForm.abpMean,
      cvp: editForm.cvp,
    })
    setEditOpen(false)
    setEditTimestamp(null)
  }

  // ── Common chart props ──
  const chartProps = { data: vitals, margin: { top: 16, right: 10, left: 0, bottom: 0 } }
  const xAxis = <XAxis dataKey="time" tick={{ fontSize: 10 }} />
  const grid = <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
  const tooltip = <Tooltip contentStyle={TOOLTIP_STYLE} />

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Signos Vitales
          </CardTitle>

          {/* Indicators */}
          {mounted && latest && (
            <div className="flex flex-wrap items-center gap-2">
              <Pill label="FC" value={String(latest.hr)} unit="lpm" color="bg-chart-1" />
              <Pill label="PA" value={`${latest.sbp}/${latest.dbp}`} unit="mmHg" color="bg-chart-2" />
              <Pill label="SpO2" value={String(latest.spo2)} unit="%" color="bg-chart-3" />
              <Pill label="EtCO2" value={String(latest.etco2)} unit="mmHg" color="bg-chart-4" />
              <Pill label="Temp" value={latest.temp.toFixed(1)} unit="°C" color="bg-chart-5" />
              {hasBis && latest.bis !== undefined && (
                <Pill label="BIS" value={String(latest.bis)} unit="" color="bg-violet-500" />
              )}
              {hasNirs && latest.nirsL !== undefined && (
                <Pill label="NIRS" value={`${latest.nirsL}/${latest.nirsR}`} unit="%" color="bg-teal-500" />
              )}
              {hasAbp && latest.abpSys !== undefined && (
                <Pill label="LA" value={`${latest.abpSys}/${latest.abpDia}`} unit="mmHg" color="bg-red-500" />
              )}
              {hasCvp && latest.cvp !== undefined && (
                <Pill label="PVC" value={String(latest.cvp)} unit="mmHg" color="bg-blue-500" />
              )}
            </div>
          )}

          {/* Print view selector */}
          <div className="flex items-center gap-1 print:hidden">
            <Printer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground mr-0.5">Imprimir:</span>
            {PRINT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrintView(opt.value)}
                className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                  printView === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Registrar button */}
          {onAddVital && (
            <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setAddForm(emptyForm()) }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Registrar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar Signos Vitales</DialogTitle>
                  <DialogDescription>Ingrese los valores para el nuevo registro</DialogDescription>
                </DialogHeader>
                <VitalForm
                  form={addForm}
                  onChange={(p) => setAddForm(f => ({ ...f, ...p }))}
                  onSubmit={handleAdd}
                  submitLabel="Agregar registro"
                  nextTimestamp={nextTimestamp}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Edit dialog (hidden trigger) */}
          <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditTimestamp(null) }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Registro de Signos Vitales</DialogTitle>
                <DialogDescription>Modifique los valores del registro seleccionado</DialogDescription>
              </DialogHeader>
              <VitalForm
                form={editForm}
                onChange={(p) => setEditForm(f => ({ ...f, ...p }))}
                onSubmit={handleUpdate}
                submitLabel="Guardar cambios"
                nextTimestamp={nextTimestamp}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Event legend */}
        {markerMap.size > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <span className="text-[10px] text-muted-foreground font-medium">Eventos:</span>
            {[...markerMap.entries()].map(([time, labels]) => (
              <span key={time} className="text-[10px] text-amber-600 dark:text-amber-400">
                {time} — {labels.join(', ')}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="hemodynamics">Hemodinámicos</TabsTrigger>
            <TabsTrigger value="respiratory">Respiratorios</TabsTrigger>
            {(hasBis || hasNirs) && <TabsTrigger value="neuro">Neuromonitoreo</TabsTrigger>}
            {(hasAbp || hasCvp) && <TabsTrigger value="invasive">Presiones Invasivas</TabsTrigger>}
            <TabsTrigger value="records">Registros</TabsTrigger>
          </TabsList>

          {/* ── Todos (vista principal combinada) ── */}
          <TabsContent value="all">
            <div className="h-[340px]">
              {mounted && (
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={vitals} margin={{ top: 16, right: 52, left: 0, bottom: 0 }}>
                    {grid}
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    {/* Eje izquierdo: FC y presiones (mmHg / lpm) */}
                    <YAxis
                      yAxisId="left"
                      domain={[0, 220]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'mmHg / lpm', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#64748b', dx: 10 }}
                    />
                    {/* Eje derecho: porcentajes y escalas 0–100 */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 110]}
                      tick={{ fontSize: 10 }}
                      label={{ value: '%  /  u', angle: 90, position: 'insideRight', fontSize: 9, fill: '#64748b', dx: -8 }}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <EventRefLines markerMap={markerMap} />

                    {/* ── Eje izquierdo ─────────── */}
                    <Line yAxisId="left" type="monotone" dataKey="hr"  name="FC (lpm)"       stroke="#ef4444" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="sbp" name="PAS (mmHg)"      stroke="#3b82f6" strokeWidth={2}   dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="dbp" name="PAD (mmHg)"      stroke="#93c5fd" strokeWidth={2}   dot={false} strokeDasharray="6 3" />
                    <Line yAxisId="left" type="monotone" dataKey="map" name="PAM (mmHg)"      stroke="#1d4ed8" strokeWidth={2}   dot={false} strokeDasharray="2 4" />
                    {hasAbp && <Line yAxisId="left" type="monotone" dataKey="abpSys"  name="LA Sis (mmHg)" stroke="#dc2626" strokeWidth={2} dot={false} connectNulls strokeDasharray="8 2" />}
                    {hasAbp && <Line yAxisId="left" type="monotone" dataKey="abpDia"  name="LA Dia (mmHg)" stroke="#fca5a5" strokeWidth={2} dot={false} connectNulls strokeDasharray="5 5" />}
                    {hasCvp  && <Line yAxisId="left" type="monotone" dataKey="cvp"    name="PVC (mmHg)"    stroke="#6366f1" strokeWidth={2} dot={false} connectNulls />}

                    {/* ── Eje derecho ────────────── */}
                    <Line yAxisId="right" type="monotone" dataKey="spo2"  name="SpO2 (%)"     stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="etco2" name="EtCO2 (mmHg)" stroke="#f59e0b" strokeWidth={2}   dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="rr"    name="FR (rpm)"      stroke="#22c55e" strokeWidth={2}   dot={false} />
                    {hasBis  && <Line yAxisId="right" type="monotone" dataKey="bis"   name="BIS"           stroke="#8b5cf6" strokeWidth={2.5} dot={false} connectNulls />}
                    {hasNirs && <Line yAxisId="right" type="monotone" dataKey="nirsL" name="NIRS Izq (%)"  stroke="#0d9488" strokeWidth={2}   dot={false} connectNulls />}
                    {hasNirs && <Line yAxisId="right" type="monotone" dataKey="nirsR" name="NIRS Der (%)"  stroke="#0891b2" strokeWidth={2}   dot={false} connectNulls strokeDasharray="5 5" />}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Leyenda de ejes */}
            <div className="flex gap-6 mt-2 text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-blue-500" /> Eje izquierdo: FC, PA, LA, PVC (mmHg / lpm)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-cyan-500" /> Eje derecho: SpO2, EtCO2, FR, BIS, NIRS (%)</span>
            </div>
          </TabsContent>

          {/* ── Hemodinámicos ── */}
          <TabsContent value="hemodynamics">
            <div className="h-[300px]">
              {mounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={vitals} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {grid}{xAxis}
                    <YAxis domain={[30, 200]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <EventRefLines markerMap={markerMap} />
                    <Area type="monotone" dataKey="hr"  name="FC (lpm)"  stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="sbp" name="PAS (mmHg)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="dbp" name="PAD (mmHg)" stroke="#93c5fd" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                    <Line type="monotone" dataKey="map" name="PAM (mmHg)" stroke="#1d4ed8" strokeWidth={2} dot={false} strokeDasharray="2 4" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* ── Respiratorios ── */}
          <TabsContent value="respiratory">
            <div className="h-[300px]">
              {mounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart {...chartProps}>
                    {grid}{xAxis}
                    <YAxis domain={[0, 105]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <EventRefLines markerMap={markerMap} />
                    <Line type="monotone" dataKey="spo2"  name="SpO2 (%)"     stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="etco2" name="EtCO2 (mmHg)" stroke="#f59e0b" strokeWidth={2}   dot={false} />
                    <Line type="monotone" dataKey="rr"    name="FR (rpm)"      stroke="#22c55e" strokeWidth={2}   dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* ── Neuromonitoreo ── */}
          {(hasBis || hasNirs) && (
            <TabsContent value="neuro">
              <div className="h-[300px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart {...chartProps}>
                      {grid}{xAxis}
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {hasBis && (
                        <>
                          <ReferenceLine y={60} stroke="#a78bfa" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'BIS 60', position: 'right', fontSize: 9, fill: '#a78bfa' }} />
                          <ReferenceLine y={40} stroke="#a78bfa" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'BIS 40', position: 'right', fontSize: 9, fill: '#a78bfa' }} />
                        </>
                      )}
                      {hasNirs && (
                        <ReferenceLine y={50} stroke="#0d9488" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'NIRS 50%', position: 'right', fontSize: 9, fill: '#0d9488' }} />
                      )}
                      <EventRefLines markerMap={markerMap} />
                      {hasBis  && <Line type="monotone" dataKey="bis"   name="BIS"          stroke="#8b5cf6" strokeWidth={2.5} dot={false} connectNulls />}
                      {hasNirs && <Line type="monotone" dataKey="nirsL" name="NIRS Izq (%)" stroke="#0d9488" strokeWidth={2}   dot={false} connectNulls />}
                      {hasNirs && <Line type="monotone" dataKey="nirsR" name="NIRS Der (%)" stroke="#0891b2" strokeWidth={2}   dot={false} connectNulls strokeDasharray="5 5" />}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Presiones Invasivas ── */}
          {(hasAbp || hasCvp) && (
            <TabsContent value="invasive">
              <div className="h-[300px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart {...chartProps}>
                      {grid}{xAxis}
                      <YAxis domain={[0, 180]} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <EventRefLines markerMap={markerMap} />
                      {hasAbp && <Line type="monotone" dataKey="abpSys"  name="LA Sistólica (mmHg)"  stroke="#dc2626" strokeWidth={2.5} dot={false} connectNulls />}
                      {hasAbp && <Line type="monotone" dataKey="abpDia"  name="LA Diastólica (mmHg)" stroke="#fca5a5" strokeWidth={2}   dot={false} connectNulls strokeDasharray="5 5" />}
                      {hasAbp && <Line type="monotone" dataKey="abpMean" name="LA Media (mmHg)"       stroke="#f59e0b" strokeWidth={2}   dot={false} connectNulls strokeDasharray="2 4" />}
                      {hasCvp  && <Line type="monotone" dataKey="cvp"    name="PVC (mmHg)"            stroke="#6366f1" strokeWidth={2}   dot={false} connectNulls />}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Registros (tabla editable) ── */}
          <TabsContent value="records">
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 text-left pl-2">Hora</th>
                    <th className="py-2 text-left">FC</th>
                    <th className="py-2 text-left">PAS/PAD</th>
                    <th className="py-2 text-left">PAM</th>
                    <th className="py-2 text-left">SpO2</th>
                    <th className="py-2 text-left">EtCO2</th>
                    <th className="py-2 text-left">Temp</th>
                    {hasBis && <th className="py-2 text-left">BIS</th>}
                    {hasNirs && <th className="py-2 text-left">NIRS I/D</th>}
                    {hasAbp && <th className="py-2 text-left">LA S/D</th>}
                    {hasCvp && <th className="py-2 text-left">PVC</th>}
                    {(onUpdateVital || onDeleteVital) && <th className="py-2 w-16" />}
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v) => (
                    <tr key={v.timestamp} className="group border-b border-border/50 last:border-0 hover:bg-muted/30">
                      <td className="py-1.5 pl-2 tabular-nums font-medium">{v.time}</td>
                      <td className="py-1.5 tabular-nums">{v.hr}</td>
                      <td className="py-1.5 tabular-nums">{v.sbp}/{v.dbp}</td>
                      <td className="py-1.5 tabular-nums">{v.map}</td>
                      <td className="py-1.5 tabular-nums">{v.spo2}%</td>
                      <td className="py-1.5 tabular-nums">{v.etco2}</td>
                      <td className="py-1.5 tabular-nums">{v.temp?.toFixed(1)}</td>
                      {hasBis && <td className="py-1.5 tabular-nums">{v.bis ?? '—'}</td>}
                      {hasNirs && <td className="py-1.5 tabular-nums">{v.nirsL !== undefined ? `${v.nirsL}/${v.nirsR}` : '—'}</td>}
                      {hasAbp && <td className="py-1.5 tabular-nums">{v.abpSys !== undefined ? `${v.abpSys}/${v.abpDia}` : '—'}</td>}
                      {hasCvp && <td className="py-1.5 tabular-nums">{v.cvp ?? '—'}</td>}
                      {(onUpdateVital || onDeleteVital) && (
                        <td className="py-1">
                          {deleteId === v.timestamp ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="destructive" className="h-5 px-1.5 text-[10px]" onClick={() => { onDeleteVital?.(v.timestamp); setDeleteId(null) }}>Sí</Button>
                              <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => setDeleteId(null)}>No</Button>
                            </div>
                          ) : (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {onUpdateVital && (
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => openEdit(v)}>
                                  <Pencil className="h-2.5 w-2.5" />
                                </Button>
                              )}
                              {onDeleteVital && (
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => setDeleteId(v.timestamp)}>
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Print-only view (always mounted, not inside Tabs) ── */}
        <div id="vitals-print-view" className="hidden">
          {/* Label */}
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {PRINT_OPTIONS.find(o => o.value === printView)?.label ?? 'Signos Vitales'}
          </p>

          {/* All */}
          {printView === 'all' && mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={vitals} margin={{ top: 16, right: 52, left: 0, bottom: 0 }}>
                {grid}<XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left"  domain={[0, 220]} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 110]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} /><Legend wrapperStyle={{ fontSize: 10 }} />
                <EventRefLines markerMap={markerMap} />
                <Line yAxisId="left"  type="monotone" dataKey="hr"  name="FC (lpm)"   stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="left"  type="monotone" dataKey="sbp" name="PAS"         stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="left"  type="monotone" dataKey="dbp" name="PAD"         stroke="#93c5fd" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                <Line yAxisId="left"  type="monotone" dataKey="map" name="PAM"         stroke="#1d4ed8" strokeWidth={2} dot={false} strokeDasharray="2 4" />
                <Line yAxisId="right" type="monotone" dataKey="spo2"  name="SpO2 (%)"  stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="etco2" name="EtCO2"     stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="rr"    name="FR (rpm)"  stroke="#22c55e" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* Hemodynamics */}
          {printView === 'hemodynamics' && mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={vitals} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
                {grid}<XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[30, 200]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} /><Legend wrapperStyle={{ fontSize: 10 }} />
                <EventRefLines markerMap={markerMap} />
                <Area type="monotone" dataKey="hr"  name="FC (lpm)"   stroke="#ef4444" fill="transparent" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sbp" name="PAS (mmHg)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dbp" name="PAD (mmHg)" stroke="#93c5fd" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                <Line type="monotone" dataKey="map" name="PAM (mmHg)" stroke="#1d4ed8" strokeWidth={2} dot={false} strokeDasharray="2 4" />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* Respiratory */}
          {printView === 'respiratory' && mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vitals} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
                {grid}<XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 105]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} /><Legend wrapperStyle={{ fontSize: 10 }} />
                <EventRefLines markerMap={markerMap} />
                <Line type="monotone" dataKey="spo2"  name="SpO2 (%)"     stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="etco2" name="EtCO2 (mmHg)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rr"    name="FR (rpm)"      stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Records table */}
          {printView === 'records' && (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1 text-left pl-1">Hora</th>
                  <th className="py-1 text-left">FC</th>
                  <th className="py-1 text-left">PAS/PAD</th>
                  <th className="py-1 text-left">PAM</th>
                  <th className="py-1 text-left">SpO2</th>
                  <th className="py-1 text-left">EtCO2</th>
                  <th className="py-1 text-left">FR</th>
                  <th className="py-1 text-left">Temp</th>
                  {hasBis && <th className="py-1 text-left">BIS</th>}
                  {hasNirs && <th className="py-1 text-left">NIRS I/D</th>}
                  {hasAbp && <th className="py-1 text-left">LA S/D</th>}
                  {hasCvp && <th className="py-1 text-left">PVC</th>}
                </tr>
              </thead>
              <tbody>
                {vitals.map((v) => (
                  <tr key={v.timestamp} className="border-b border-border/50 last:border-0">
                    <td className="py-0.5 pl-1 tabular-nums font-medium">{v.time}</td>
                    <td className="py-0.5 tabular-nums">{v.hr}</td>
                    <td className="py-0.5 tabular-nums">{v.sbp}/{v.dbp}</td>
                    <td className="py-0.5 tabular-nums">{v.map}</td>
                    <td className="py-0.5 tabular-nums">{v.spo2}%</td>
                    <td className="py-0.5 tabular-nums">{v.etco2}</td>
                    <td className="py-0.5 tabular-nums">{v.rr}</td>
                    <td className="py-0.5 tabular-nums">{v.temp?.toFixed(1)}</td>
                    {hasBis && <td className="py-0.5 tabular-nums">{v.bis ?? '—'}</td>}
                    {hasNirs && <td className="py-0.5 tabular-nums">{v.nirsL !== undefined ? `${v.nirsL}/${v.nirsR}` : '—'}</td>}
                    {hasAbp && <td className="py-0.5 tabular-nums">{v.abpSys !== undefined ? `${v.abpSys}/${v.abpDia}` : '—'}</td>}
                    {hasCvp && <td className="py-0.5 tabular-nums">{v.cvp ?? '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
