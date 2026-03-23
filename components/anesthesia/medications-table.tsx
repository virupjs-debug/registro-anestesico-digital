'use client'

import { useState } from 'react'
import { Plus, Pill, Droplets, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Medication, TherapeuticGroup } from '@/lib/types'
import { commonMedications } from '@/lib/mock-data'

interface MedicationsTableProps {
  medications: Medication[]
  onAddMedication: (medication: Medication) => void
  onDeleteMedication?: (id: string) => void
  onUpdateMedication?: (medication: Medication) => void
}

const GROUP_CONFIG: Record<TherapeuticGroup, { label: string; dot: string; border: string }> = {
  opioide:         { label: 'Opioide (intraop.)',     dot: 'bg-blue-500',    border: 'border-l-blue-500'    },
  opiaceo_postop:  { label: 'Opiáceo postop.',        dot: 'bg-indigo-500',  border: 'border-l-indigo-500'  },
  aine:            { label: 'AINE / Analgésico',       dot: 'bg-cyan-500',    border: 'border-l-cyan-500'    },
  protector_gastrico: { label: 'Protector Gástrico',  dot: 'bg-lime-500',    border: 'border-l-lime-500'    },
  corticoide:      { label: 'Corticoide',              dot: 'bg-amber-500',   border: 'border-l-amber-500'   },
  broncodilatador: { label: 'Broncodilatador',         dot: 'bg-sky-400',     border: 'border-l-sky-400'     },
  benzodiacepina:  { label: 'Benzodiacepina',         dot: 'bg-orange-400',  border: 'border-l-orange-400'  },
  anticolinergico: { label: 'Anticolinérgico',        dot: 'bg-green-500',   border: 'border-l-green-500'   },
  vasopresor:      { label: 'Vasopresor',             dot: 'bg-violet-500',  border: 'border-l-violet-500'  },
  antibiotico:     { label: 'Antibiótico',            dot: 'bg-teal-500',    border: 'border-l-teal-500'    },
  antihemetico:    { label: 'Antiemético',            dot: 'bg-pink-400',    border: 'border-l-pink-400'    },
  otro:            { label: 'Otro',                   dot: 'bg-gray-400',    border: 'border-l-gray-400'    },
}

const LEGEND = Object.entries(GROUP_CONFIG) as [TherapeuticGroup, typeof GROUP_CONFIG[TherapeuticGroup]][]

const GROUP_ORDER: TherapeuticGroup[] = [
  'opioide', 'opiaceo_postop', 'aine', 'protector_gastrico', 'corticoide', 'broncodilatador', 'benzodiacepina', 'anticolinergico', 'vasopresor', 'antibiotico', 'antihemetico', 'otro',
]

const DEFAULT_INFUSION_UNITS = [
  'ml/hs',
  'mg/hs',
  'mg/kg/hs',
  'mcg/kg/min',
  'mcg/min',
  'mcg/kg/hs',
  'µg/kg/min',
  'ng/ml',
  'ng/kg/min',
  'UI/hs',
]

// ——— Form state helpers ———
function currentTimeHHMM() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function emptyForm() {
  return {
    selectedMed: '',
    dose: '',
    route: 'IV',
    isInfusion: false,
    infusionRate: '',
    infusionRateUnit: '',
    time: currentTimeHHMM(),
  }
}

function formFromMedication(med: Medication) {
  // med.time is stored as "HH:MM" — use it directly as the input value
  const timeValue = /^\d{2}:\d{2}$/.test(med.time) ? med.time : currentTimeHHMM()
  return {
    selectedMed: med.name,
    dose: med.isInfusion ? '' : med.dose,
    route: med.route,
    isInfusion: !!med.isInfusion,
    infusionRate: med.infusionRate !== undefined ? String(med.infusionRate) : '',
    infusionRateUnit: med.infusionRateUnit ?? '',
    time: timeValue,
  }
}

// ——— Shared medication form ———
function MedicationForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
}: {
  form: ReturnType<typeof emptyForm>
  onChange: (patch: Partial<ReturnType<typeof emptyForm>>) => void
  onSubmit: () => void
  submitLabel: string
}) {
  const [manualDose, setManualDose] = useState(false)

  const selectedMedData = commonMedications.find((m) => m.name === form.selectedMed)
  const availableUnits = selectedMedData?.infusionUnits ?? DEFAULT_INFUSION_UNITS
  const hasDoseOptions = selectedMedData && selectedMedData.doses[0] !== 'Infusión continua'

  const handleSelectMed = (name: string) => {
    const med = commonMedications.find((m) => m.name === name)
    const autoInfusion = med?.group === 'vasopresor' || med?.doses[0] === 'Infusión continua'
    setManualDose(false)
    onChange({
      selectedMed: name,
      dose: '',
      infusionRate: '',
      isInfusion: !!autoInfusion,
      infusionRateUnit: med?.infusionUnits?.[0] ?? '',
    })
  }

  const isValid = form.selectedMed &&
    (form.isInfusion ? !!form.infusionRate : !!form.dose)

  return (
    <div className="space-y-4 pt-4">
      {/* Medicamento */}
      <div className="space-y-2">
        <Label>Medicamento</Label>
        <Select value={form.selectedMed} onValueChange={handleSelectMed}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar medicamento" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {GROUP_ORDER.map((group) => {
              const meds = commonMedications.filter((m) => m.group === group)
              if (!meds.length) return null
              return (
                <div key={group}>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className={`h-2 w-2 rounded-full ${GROUP_CONFIG[group].dot}`} />
                    {GROUP_CONFIG[group].label}
                  </div>
                  {meds.map((med) => (
                    <SelectItem key={med.name} value={med.name} className="pl-6">
                      {med.name}
                      {med.supportsInfusion && (
                        <span className="ml-2 text-[10px] text-muted-foreground">(inf.)</span>
                      )}
                    </SelectItem>
                  ))}
                </div>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de administración */}
      {form.selectedMed && (
        <div className="space-y-2">
          <Label>Tipo de administración</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={!form.isInfusion ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onChange({ isInfusion: false })}
            >
              Bolo
            </Button>
            <Button
              type="button"
              size="sm"
              variant={form.isInfusion ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                const upd: Partial<ReturnType<typeof emptyForm>> = { isInfusion: true }
                if (!form.infusionRateUnit && availableUnits.length) {
                  upd.infusionRateUnit = availableUnits[0]
                }
                onChange(upd)
              }}
              disabled={!selectedMedData?.supportsInfusion}
            >
              <Droplets className="mr-1 h-3.5 w-3.5" />
              Infusión continua
            </Button>
          </div>
        </div>
      )}

      {/* Dosis en bolo */}
      {form.selectedMed && !form.isInfusion && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Dosis</Label>
            {hasDoseOptions && (
              <button
                type="button"
                className="text-xs text-primary hover:underline underline-offset-2"
                onClick={() => { setManualDose(!manualDose); onChange({ dose: '' }) }}
              >
                {manualDose ? '← Ver opciones predefinidas' : 'Ingresar manualmente (pediátrico)'}
              </button>
            )}
          </div>
          {hasDoseOptions && !manualDose ? (
            <Select value={form.dose} onValueChange={(v) => onChange({ dose: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar dosis" />
              </SelectTrigger>
              <SelectContent>
                {selectedMedData!.doses.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Ej: 0.1 mg/kg"
              value={form.dose}
              onChange={(e) => onChange({ dose: e.target.value })}
              autoFocus={manualDose}
            />
          )}
        </div>
      )}

      {/* Velocidad de infusión */}
      {form.selectedMed && form.isInfusion && (
        <div className="space-y-2">
          <Label>Velocidad de infusión</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={form.infusionRate}
              onChange={(e) => onChange({ infusionRate: e.target.value })}
              className="flex-1"
              min={0}
              step={0.01}
            />
            <Select value={form.infusionRateUnit} onValueChange={(v) => onChange({ infusionRateUnit: v })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Unidad" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Vía */}
      <div className="space-y-2">
        <Label>Vía</Label>
        <Select value={form.route} onValueChange={(v) => onChange({ route: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IV">Intravenosa (IV)</SelectItem>
            <SelectItem value="IM">Intramuscular (IM)</SelectItem>
            <SelectItem value="SC">Subcutánea (SC)</SelectItem>
            <SelectItem value="INH">Inhalada (INH)</SelectItem>
            <SelectItem value="VO">Vía oral (VO)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hora de administración */}
      <div className="space-y-2">
        <Label htmlFor="med-time">Hora de administración</Label>
        <Input
          id="med-time"
          type="time"
          value={form.time}
          onChange={(e) => onChange({ time: e.target.value })}
          className="w-36"
        />
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={!isValid}>
        {submitLabel}
      </Button>
    </div>
  )
}

// ——— Main component ———
export function MedicationsTable({
  medications,
  onAddMedication,
  onDeleteMedication,
  onUpdateMedication,
}: MedicationsTableProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ——— Add ———
  const handleAdd = () => {
    const medData = commonMedications.find((m) => m.name === addForm.selectedMed)
    const newMed: Medication = {
      id: Date.now().toString(),
      name: addForm.selectedMed,
      dose: addForm.isInfusion ? `${addForm.infusionRate} ${addForm.infusionRateUnit}` : addForm.dose,
      route: addForm.route,
      time: addForm.time || currentTimeHHMM(),
      administeredBy: 'Usuario',
      therapeuticGroup: medData?.group ?? 'otro',
      isInfusion: addForm.isInfusion,
      infusionRate: addForm.isInfusion ? Number(addForm.infusionRate) : undefined,
      infusionRateUnit: addForm.isInfusion ? addForm.infusionRateUnit : undefined,
    }
    onAddMedication(newMed)
    setAddOpen(false)
    setAddForm(emptyForm())
  }

  // ——— Edit ———
  const openEdit = (med: Medication) => {
    setEditingId(med.id)
    setEditForm(formFromMedication(med))
    setEditOpen(true)
  }

  const handleUpdate = () => {
    if (!editingId || !onUpdateMedication) return
    const existing = medications.find((m) => m.id === editingId)
    if (!existing) return
    const medData = commonMedications.find((m) => m.name === editForm.selectedMed)
    const updated: Medication = {
      ...existing,
      name: editForm.selectedMed,
      dose: editForm.isInfusion ? `${editForm.infusionRate} ${editForm.infusionRateUnit}` : editForm.dose,
      route: editForm.route,
      time: editForm.time || existing.time,
      therapeuticGroup: medData?.group ?? existing.therapeuticGroup ?? 'otro',
      isInfusion: editForm.isInfusion,
      infusionRate: editForm.isInfusion ? Number(editForm.infusionRate) : undefined,
      infusionRateUnit: editForm.isInfusion ? editForm.infusionRateUnit : undefined,
    }
    onUpdateMedication(updated)
    setEditOpen(false)
    setEditingId(null)
    setEditForm(emptyForm())
  }

  // ——— Delete ———
  const handleDelete = (id: string) => {
    onDeleteMedication?.(id)
    setDeleteConfirmId(null)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-4 w-4" />
            Medicamentos
          </CardTitle>

          {/* Botón Agregar */}
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setAddForm(emptyForm()) }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Medicamento</DialogTitle>
                <DialogDescription>Seleccione el medicamento, dosis y vía de administración</DialogDescription>
              </DialogHeader>
              <MedicationForm
                form={addForm}
                onChange={(patch) => setAddForm((f) => ({ ...f, ...patch }))}
                onSubmit={handleAdd}
                submitLabel="Agregar Medicamento"
              />
            </DialogContent>
          </Dialog>

          {/* Dialog Editar (oculto, abierto desde fila) */}
          <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingId(null); setEditForm(emptyForm()) } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Medicamento</DialogTitle>
                <DialogDescription>Modifique los datos del medicamento registrado</DialogDescription>
              </DialogHeader>
              <MedicationForm
                form={editForm}
                onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
                onSubmit={handleUpdate}
                submitLabel="Guardar cambios"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="w-1 pb-2" />
                <th className="pb-2 text-left font-medium text-muted-foreground">Hora</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Medicamento</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Dosis / Vel.</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Vía</th>
                {(onDeleteMedication || onUpdateMedication) && (
                  <th className="pb-2 w-16" />
                )}
              </tr>
            </thead>
            <tbody>
              {medications.map((med) => {
                const group = med.therapeuticGroup ?? 'otro'
                const cfg = GROUP_CONFIG[group]
                const isDeleting = deleteConfirmId === med.id

                return (
                  <tr
                    key={med.id}
                    className={`group border-b border-border/50 last:border-0 border-l-4 ${cfg.border}`}
                  >
                    <td className="pl-2 pr-1 py-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
                    </td>
                    <td className="py-2 text-foreground tabular-nums">{med.time}</td>
                    <td className="py-2 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        {med.name}
                        {med.isInfusion && (
                          <Droplets className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-foreground">
                      {med.isInfusion ? (
                        <span className="font-mono text-xs">
                          {med.infusionRate} {med.infusionRateUnit}
                        </span>
                      ) : (
                        med.dose
                      )}
                    </td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">{med.route}</Badge>
                    </td>

                    {/* Acciones */}
                    {(onDeleteMedication || onUpdateMedication) && (
                      <td className="py-1 pr-2">
                        {isDeleting ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleDelete(med.id)}
                            >
                              Eliminar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onUpdateMedication && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => openEdit(med)}
                                title="Editar"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            {onDeleteMedication && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirmId(med.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
              {medications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Sin medicamentos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Leyenda de colores */}
        <div className="mt-3 border-t border-border pt-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {LEGEND.map(([group, cfg]) => (
              <div key={group} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
