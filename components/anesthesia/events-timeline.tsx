'use client'

import { useState } from 'react'
import { Clock, Plus, X, Zap, Pill } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { ProcedureEvent, EventCategory, CardiacArrestDrug, Defibrillation } from '@/lib/types'

interface EventsTimelineProps {
  events: ProcedureEvent[]
  onAddEvent: (event: ProcedureEvent) => void
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  normal: 'General',
  hemorragia: 'Hemorragia',
  broncoespasmo: 'Broncoespasmo',
  anafilaxia: 'Anafilaxia',
  paro_cardiaco: 'Paro Cardíaco',
  inicio_rcp: 'Inicio RCP',
  complicacion_otro: 'Otra Complicación',
}

const CATEGORY_DOT: Record<EventCategory, string> = {
  normal: 'bg-primary',
  hemorragia: 'bg-red-600',
  broncoespasmo: 'bg-yellow-500',
  anafilaxia: 'bg-orange-500',
  paro_cardiaco: 'bg-red-800',
  inicio_rcp: 'bg-red-500',
  complicacion_otro: 'bg-orange-400',
}

const CATEGORY_BADGE: Record<EventCategory, string> = {
  normal: '',
  hemorragia: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300',
  broncoespasmo: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300',
  anafilaxia: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300',
  paro_cardiaco: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-950 dark:text-red-200 font-semibold',
  inicio_rcp: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300',
  complicacion_otro: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
}

const DRUG_UNITS = ['mg', 'mcg', 'ug', 'mEq', 'UI', 'mL']

const DEFAULT_ARREST_DRUGS = [
  'Adrenalina',
  'Amiodarona',
  'Atropina',
  'Lidocaína',
  'Bicarbonato',
  'Calcio',
  'Vasopresina',
  'Magnesio',
]

export function EventsTimeline({ events, onAddEvent }: EventsTimelineProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<EventCategory>('normal')
  const [eventText, setEventText] = useState('')
  const [notes, setNotes] = useState('')

  const [arrestDrugs, setArrestDrugs] = useState<CardiacArrestDrug[]>([])
  const [newDrugName, setNewDrugName] = useState('')
  const [newDrugDose, setNewDrugDose] = useState('')
  const [newDrugUnit, setNewDrugUnit] = useState('mg')

  const [defibrillations, setDefibrillations] = useState<Defibrillation[]>([])
  const [newJoules, setNewJoules] = useState('')

  const isArrest = category === 'paro_cardiaco'
  const isComplication = category !== 'normal'

  const resetForm = () => {
    setCategory('normal')
    setEventText('')
    setNotes('')
    setArrestDrugs([])
    setNewDrugName('')
    setNewDrugDose('')
    setNewDrugUnit('mg')
    setDefibrillations([])
    setNewJoules('')
  }

  const handleCategoryChange = (val: EventCategory) => {
    setCategory(val)
    if (val !== 'normal' && val !== 'complicacion_otro') {
      setEventText(CATEGORY_LABELS[val])
    } else {
      setEventText('')
    }
  }

  const addDrug = () => {
    if (!newDrugName || !newDrugDose) return
    setArrestDrugs((prev) => [...prev, { name: newDrugName, dose: newDrugDose, unit: newDrugUnit }])
    setNewDrugName('')
    setNewDrugDose('')
  }

  const removeDrug = (i: number) => setArrestDrugs((prev) => prev.filter((_, idx) => idx !== i))

  const addDefibrillation = () => {
    const j = parseFloat(newJoules)
    if (!j || j <= 0) return
    setDefibrillations((prev) => [
      ...prev,
      { joules: j, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) },
    ])
    setNewJoules('')
  }

  const removeDefib = (i: number) => setDefibrillations((prev) => prev.filter((_, idx) => idx !== i))

  const handleAddEvent = () => {
    const text = eventText.trim() || (category !== 'normal' ? CATEGORY_LABELS[category] : '')
    if (!text) return

    const newEvent: ProcedureEvent = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      event: text,
      notes: notes || undefined,
      category,
      cardiacArrestData: isArrest
        ? { drugs: arrestDrugs, defibrillations }
        : undefined,
    }

    onAddEvent(newEvent)
    setIsOpen(false)
    resetForm()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Línea de Tiempo
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm() }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Evento</DialogTitle>
                <DialogDescription>Registre un nuevo evento en la línea de tiempo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">

                {/* Tipo de evento */}
                <div className="space-y-2">
                  <Label>Tipo de Evento</Label>
                  <Select value={category} onValueChange={(v) => handleCategoryChange(v as EventCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">General</SelectItem>
                      <SelectItem value="hemorragia">🔴 Hemorragia</SelectItem>
                      <SelectItem value="broncoespasmo">🟡 Broncoespasmo</SelectItem>
                      <SelectItem value="anafilaxia">🟠 Anafilaxia</SelectItem>
                      <SelectItem value="paro_cardiaco">🔴 Paro Cardíaco</SelectItem>
                      <SelectItem value="inicio_rcp">🔴 Inicio RCP</SelectItem>
                      <SelectItem value="complicacion_otro">🟠 Otra Complicación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input
                    placeholder="Descripción del evento"
                    value={eventText}
                    onChange={(e) => setEventText(e.target.value)}
                  />
                </div>

                {/* Sub-form para paro cardíaco */}
                {isArrest && (
                  <Tabs defaultValue="drogas">
                    <TabsList className="w-full">
                      <TabsTrigger value="drogas" className="flex-1">
                        <Pill className="mr-1 h-3 w-3" />
                        Drogas de Paro
                      </TabsTrigger>
                      <TabsTrigger value="defib" className="flex-1">
                        <Zap className="mr-1 h-3 w-3" />
                        Desfibrilación
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="drogas" className="space-y-3 pt-2">
                      {/* Lista de drogas agregadas */}
                      {arrestDrugs.length > 0 && (
                        <div className="space-y-1">
                          {arrestDrugs.map((d, i) => (
                            <div key={i} className="flex items-center justify-between rounded bg-muted px-2 py-1 text-xs">
                              <span className="font-medium">{d.name}</span>
                              <span className="text-muted-foreground">{d.dose} {d.unit}</span>
                              <button onClick={() => removeDrug(i)} className="text-destructive hover:text-destructive/70 ml-2">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Agregar droga */}
                      <div className="grid grid-cols-5 gap-1 items-end">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Droga</Label>
                          <Select value={newDrugName} onValueChange={setNewDrugName}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEFAULT_ARREST_DRUGS.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                              <SelectItem value="__otro__">Otro...</SelectItem>
                            </SelectContent>
                          </Select>
                          {newDrugName === '__otro__' && (
                            <Input
                              className="h-8 text-xs mt-1"
                              placeholder="Nombre"
                              onChange={(e) => setNewDrugName(e.target.value)}
                            />
                          )}
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">Dosis</Label>
                          <Input className="h-8 text-xs" placeholder="0" value={newDrugDose} onChange={(e) => setNewDrugDose(e.target.value)} />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">Unidad</Label>
                          <Select value={newDrugUnit} onValueChange={setNewDrugUnit}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DRUG_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 col-span-1" onClick={addDrug}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="defib" className="space-y-3 pt-2">
                      {/* Lista de desfibrilaciones */}
                      {defibrillations.length > 0 && (
                        <div className="space-y-1">
                          {defibrillations.map((d, i) => (
                            <div key={i} className="flex items-center justify-between rounded bg-muted px-2 py-1 text-xs">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium">{d.joules} J</span>
                              </span>
                              <span className="text-muted-foreground">{d.time}</span>
                              <button onClick={() => removeDefib(i)} className="text-destructive hover:text-destructive/70 ml-2">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Agregar desfibrilación */}
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Joules</Label>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            placeholder="Ej: 200"
                            value={newJoules}
                            onChange={(e) => setNewJoules(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addDefibrillation() }}
                          />
                        </div>
                        <Button size="sm" variant="outline" className="h-8" onClick={addDefibrillation}>
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">La hora se registra automáticamente al agregar.</p>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Notas */}
                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    placeholder="Notas adicionales"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <Button onClick={handleAddEvent} className="w-full">
                  Agregar Evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative max-h-[400px] overflow-auto">
          <div className="absolute left-[52px] top-0 h-full w-px bg-border" />
          <div className="space-y-4">
            {events.map((event) => {
              const cat = event.category ?? 'normal'
              const dotColor = CATEGORY_DOT[cat]
              const badgeClass = CATEGORY_BADGE[cat]
              const hasArrestData =
                event.cardiacArrestData &&
                (event.cardiacArrestData.drugs.length > 0 || event.cardiacArrestData.defibrillations.length > 0)

              return (
                <div key={event.id} className="relative flex gap-4">
                  <span className="w-12 shrink-0 text-sm font-medium text-muted-foreground">
                    {event.time}
                  </span>
                  <div className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-card ${dotColor}`} />
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium text-foreground">{event.event}</p>
                      {cat !== 'normal' && (
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${badgeClass}`}>
                          {CATEGORY_LABELS[cat]}
                        </Badge>
                      )}
                    </div>
                    {event.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>
                    )}
                    {hasArrestData && (
                      <div className="mt-2 space-y-1">
                        {event.cardiacArrestData!.drugs.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.cardiacArrestData!.drugs.map((d, i) => (
                              <span key={i} className="inline-flex items-center gap-0.5 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-1.5 py-0.5 text-xs text-red-700 dark:text-red-300">
                                <Pill className="h-2.5 w-2.5" />
                                {d.name} {d.dose}{d.unit}
                              </span>
                            ))}
                          </div>
                        )}
                        {event.cardiacArrestData!.defibrillations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.cardiacArrestData!.defibrillations.map((d, i) => (
                              <span key={i} className="inline-flex items-center gap-0.5 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-700 px-1.5 py-0.5 text-xs text-yellow-700 dark:text-yellow-300">
                                <Zap className="h-2.5 w-2.5" />
                                {d.joules} J · {d.time}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
