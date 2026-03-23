'use client'

import { useState } from 'react'
import { Wind, ChevronDown, AlertTriangle, Video, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AirwayManagement, AirwayDeviceType } from '@/lib/types'

interface AirwayInfoProps {
  airway: AirwayManagement
  onChange?: (airway: AirwayManagement) => void
}

const DEVICE_OPTIONS: { value: AirwayDeviceType; label: string }[] = [
  { value: 'tubo_endotraqueal', label: 'Tubo Endotraqueal' },
  { value: 'mascaraLaringea', label: 'Máscara Laríngea' },
  { value: 'igel', label: 'iGel' },
]

const ETT_SIZES = ['2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']
const SGA_SIZES = ['1', '1.5', '2', '2.5', '3', '4', '5']

function getDeviceLabel(deviceType?: AirwayDeviceType): string {
  return DEVICE_OPTIONS.find((d) => d.value === deviceType)?.label ?? 'Tubo Endotraqueal'
}

function getSizesForDevice(deviceType?: AirwayDeviceType): string[] {
  if (deviceType === 'tubo_endotraqueal' || !deviceType) return ETT_SIZES
  return SGA_SIZES
}

export function AirwayInfo({ airway, onChange }: AirwayInfoProps) {
  const [editing, setEditing] = useState(false)
  const [editingVent, setEditingVent] = useState(false)
  const ventilation = airway.ventilation

  const setVent = <K extends keyof NonNullable<typeof ventilation>>(field: K, value: NonNullable<typeof ventilation>[K]) => {
    const base = ventilation ?? { type: 'mecanica' as const, mode: 'volumen' as const }
    onChange?.({ ...airway, ventilation: { ...base, [field]: value } })
  }

  const initVentilation = () => {
    onChange?.({ ...airway, ventilation: { type: 'mecanica', mode: 'volumen', frequency: 14, tidalVolume: 500, minuteVolume: 7, peep: 5, peakPressure: 20 } })
    setEditingVent(true)
  }
  const deviceType = airway.deviceType ?? 'tubo_endotraqueal'
  const isETT = deviceType === 'tubo_endotraqueal'
  const sizes = getSizesForDevice(deviceType)

  const handleDeviceChange = (value: AirwayDeviceType) => {
    const label = getDeviceLabel(value)
    const newSizes = getSizesForDevice(value)
    const defaultSize = value === 'tubo_endotraqueal' ? '7.5' : '3'
    onChange?.({
      ...airway,
      deviceType: value,
      method: label,
      size: newSizes.includes(airway.size) ? airway.size : defaultSize,
      hasBalloon: value === 'tubo_endotraqueal' ? (airway.hasBalloon ?? true) : undefined,
    })
  }

  const handleSizeChange = (size: string) => {
    onChange?.({ ...airway, size })
  }

  const handleBalloonChange = (hasBalloon: boolean) => {
    onChange?.({ ...airway, hasBalloon })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Manejo de Vía Aérea y Ventilación
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Listo' : 'Editar'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="airway">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="airway" className="flex-1 text-xs">Vía Aérea</TabsTrigger>
            <TabsTrigger value="ventilation" className="flex-1 text-xs">Ventilación</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1 text-xs">Comentarios</TabsTrigger>
          </TabsList>

          {/* ── Solapa Vía Aérea ── */}
          <TabsContent value="airway" className="mt-0 space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dispositivo</Label>
                  <div className="flex flex-wrap gap-2">
                    {DEVICE_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={deviceType === opt.value ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        onClick={() => handleDeviceChange(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {isETT && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Balón</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant={airway.hasBalloon === true ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => handleBalloonChange(true)}>Con balón</Button>
                      <Button size="sm" variant={airway.hasBalloon === false ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => handleBalloonChange(false)}>Sin balón</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tamaño {isETT ? '(mm DI)' : '(Nº)'}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        {airway.size}<ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-56 overflow-y-auto">
                      {sizes.map((s) => (
                        <DropdownMenuItem key={s} onSelect={() => handleSizeChange(s)} className={airway.size === s ? 'font-semibold' : ''}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dificultades</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={airway.difficultAirway ? 'destructive' : 'outline'} className="h-8 text-xs gap-1" onClick={() => onChange?.({ ...airway, difficultAirway: !airway.difficultAirway })}>
                      <AlertTriangle className="h-3 w-3" />Vía Aérea Difícil
                    </Button>
                    <Button size="sm" variant={airway.difficultVentilation ? 'destructive' : 'outline'} className="h-8 text-xs gap-1" onClick={() => onChange?.({ ...airway, difficultVentilation: !airway.difficultVentilation })}>
                      <AlertTriangle className="h-3 w-3" />Dificultad Ventilación
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dispositivos de apoyo</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={airway.videoLaryngoscope ? 'default' : 'outline'} className="h-8 text-xs gap-1" onClick={() => onChange?.({ ...airway, videoLaryngoscope: !airway.videoLaryngoscope })}>
                      <Video className="h-3 w-3" />Videolaringoscopio
                    </Button>
                    <Button size="sm" variant={airway.fiberopticBronchoscopy ? 'default' : 'outline'} className="h-8 text-xs gap-1" onClick={() => onChange?.({ ...airway, fiberopticBronchoscopy: !airway.fiberopticBronchoscopy })}>
                      <Eye className="h-3 w-3" />Fibrobroncoscopía
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dispositivo</p>
                  <p className="font-medium text-foreground">{getDeviceLabel(deviceType)}</p>
                </div>

                {isETT && (
                  <div>
                    <p className="text-muted-foreground">Balón</p>
                    <Badge variant="outline">{airway.hasBalloon ? 'Con balón' : 'Sin balón'}</Badge>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground">Tamaño</p>
                  <p className="font-medium text-foreground">{airway.size} {isETT ? 'mm' : ''}</p>
                </div>

                {airway.fixationCm && isETT && (
                  <div>
                    <p className="text-muted-foreground">Fijación (comisura)</p>
                    <p className="font-medium text-foreground">{airway.fixationCm} cm</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground">Intentos</p>
                  <Badge variant={airway.attempts === 1 ? 'secondary' : 'outline'}>{airway.attempts}</Badge>
                </div>

                <div>
                  <p className="text-muted-foreground">Dificultad</p>
                  <Badge variant={airway.difficulty === 'Fácil' ? 'secondary' : airway.difficulty === 'Difícil' ? 'destructive' : 'outline'}>
                    {airway.difficulty}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground">Confirmación</p>
                  <p className="font-medium text-foreground">{airway.confirmedBy}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Hora</p>
                  <p className="font-medium text-foreground">{airway.time}</p>
                </div>

                {(airway.difficultAirway || airway.difficultVentilation) && (
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {airway.difficultAirway && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Vía Aérea Difícil</Badge>}
                    {airway.difficultVentilation && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Dificultad en Ventilación</Badge>}
                  </div>
                )}

                {(airway.videoLaryngoscope || airway.fiberopticBronchoscopy) && (
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {airway.videoLaryngoscope && <Badge variant="secondary" className="gap-1"><Video className="h-3 w-3" />Videolaringoscopio</Badge>}
                    {airway.fiberopticBronchoscopy && <Badge variant="secondary" className="gap-1"><Eye className="h-3 w-3" />Fibrobroncoscopía</Badge>}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Solapa Ventilación ── */}
          <TabsContent value="ventilation" className="mt-0 space-y-4">
            {!ventilation ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">Sin datos de ventilación registrados.</p>
                <Button size="sm" variant="outline" onClick={initVentilation}>Configurar Ventilación</Button>
              </div>
            ) : editingVent ? (
              /* ── Modo edición ── */
              <div className="space-y-4">
                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant={ventilation.type === 'mecanica' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('type', 'mecanica')}>Mecánica</Button>
                    <Button size="sm" variant={ventilation.type === 'asistida' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('type', 'asistida')}>Asistida</Button>
                  </div>
                </div>

                {ventilation.type === 'mecanica' && (
                  <>
                    {/* Modo ventilatorio */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Modo Ventilatorio</Label>
                      <div className="flex gap-2">
                        <Button size="sm" variant={ventilation.mode === 'volumen' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('mode', 'volumen')}>Control por Volumen</Button>
                        <Button size="sm" variant={ventilation.mode === 'presion' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('mode', 'presion')}>Control por Presión</Button>
                      </div>
                    </div>

                    {/* Parámetros numéricos */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Fr. Respiratoria (rpm)</Label>
                        <Input type="number" className="h-8 text-xs" value={ventilation.frequency ?? ''} onChange={(e) => setVent('frequency', parseFloat(e.target.value) || undefined)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Volumen Corriente (mL)</Label>
                        <Input type="number" className="h-8 text-xs" value={ventilation.tidalVolume ?? ''} onChange={(e) => setVent('tidalVolume', parseFloat(e.target.value) || undefined)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Volumen Minuto (L/min)</Label>
                        <Input type="number" step="0.1" className="h-8 text-xs" value={ventilation.minuteVolume ?? ''} onChange={(e) => setVent('minuteVolume', parseFloat(e.target.value) || undefined)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">PEEP (cmH₂O)</Label>
                        <Input type="number" className="h-8 text-xs" value={ventilation.peep ?? ''} onChange={(e) => setVent('peep', parseFloat(e.target.value) || undefined)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Presión Pico (cmH₂O)</Label>
                        <Input type="number" className="h-8 text-xs" value={ventilation.peakPressure ?? ''} onChange={(e) => setVent('peakPressure', parseFloat(e.target.value) || undefined)} />
                      </div>
                    </div>
                  </>
                )}

                {ventilation.type === 'asistida' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tipo de Circuito</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant={ventilation.circuit === 'cerrado' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('circuit', 'cerrado')}>Cerrado</Button>
                      <Button size="sm" variant={ventilation.circuit === 'abierto' ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setVent('circuit', 'abierto')}>Abierto</Button>
                    </div>
                  </div>
                )}

                <Button size="sm" className="w-full h-8 text-xs" onClick={() => setEditingVent(false)}>Listo</Button>
              </div>
            ) : (
              /* ── Vista de solo lectura ── */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Tipo</p>
                    <Badge variant="secondary" className="mt-1">
                      {ventilation.type === 'mecanica' ? 'Ventilación Mecánica' : 'Ventilación Asistida'}
                    </Badge>
                  </div>

                  {ventilation.type === 'mecanica' && (
                    <>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Modo</p>
                        <Badge variant="outline" className="mt-1">
                          {ventilation.mode === 'presion' ? 'Control por Presión' : 'Control por Volumen'}
                        </Badge>
                      </div>
                      {ventilation.frequency != null && <div><p className="text-muted-foreground">Fr. Respiratoria</p><p className="font-medium">{ventilation.frequency} rpm</p></div>}
                      {ventilation.tidalVolume != null && <div><p className="text-muted-foreground">Vol. Corriente</p><p className="font-medium">{ventilation.tidalVolume} mL</p></div>}
                      {ventilation.minuteVolume != null && <div><p className="text-muted-foreground">Vol. Minuto</p><p className="font-medium">{ventilation.minuteVolume} L/min</p></div>}
                      {ventilation.peep != null && <div><p className="text-muted-foreground">PEEP</p><p className="font-medium">{ventilation.peep} cmH₂O</p></div>}
                      {ventilation.peakPressure != null && <div><p className="text-muted-foreground">Presión Pico</p><p className="font-medium">{ventilation.peakPressure} cmH₂O</p></div>}
                    </>
                  )}

                  {ventilation.type === 'asistida' && ventilation.circuit && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Circuito</p>
                      <Badge variant="outline" className="mt-1">
                        {ventilation.circuit === 'abierto' ? 'Circuito Abierto' : 'Circuito Cerrado'}
                      </Badge>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => setEditingVent(true)}>Editar parámetros</Button>
              </div>
            )}
          </TabsContent>

          {/* ── Solapa Comentarios ── */}
          <TabsContent value="comments" className="mt-0">
            <Textarea
              placeholder="Comentarios sobre el manejo de vía aérea y ventilación..."
              className="min-h-[120px] text-sm resize-none"
              value={airway.comments || ''}
              onChange={(e) => onChange?.({ ...airway, comments: e.target.value })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
