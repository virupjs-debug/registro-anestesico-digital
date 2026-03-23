'use client'

import { useState } from 'react'
import { Droplets, Plus } from 'lucide-react'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FluidRecord, FluidCategory } from '@/lib/types'
import { FLUID_CATEGORIES } from '@/lib/mock-data'

interface FluidsTableProps {
  fluids: FluidRecord[]
  onAddFluid: (fluid: FluidRecord) => void
}

const CATEGORY_CONFIG: Record<FluidCategory, { label: string; color: string; dot: string; badge: string }> = {
  cristaloide: {
    label: 'Cristaloide',
    color: 'border-l-blue-500',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  coloide: {
    label: 'Coloide',
    color: 'border-l-yellow-500',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  hemoderivado: {
    label: 'Hemoderivado',
    color: 'border-l-red-500',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  otro: {
    label: 'Otro',
    color: 'border-l-gray-400',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
  },
}

function getCategoryFromType(type: string): FluidCategory {
  for (const cat of FLUID_CATEGORIES) {
    if (cat.types.includes(type)) return cat.value
  }
  return 'otro'
}

export function FluidsTable({ fluids, onAddFluid }: FluidsTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('')
  const [volume, setVolume] = useState('')
  const [rate, setRate] = useState('')

  const totalVolume = fluids.reduce((acc, f) => acc + f.volume, 0)

  const handleAddFluid = () => {
    if (!type || !volume) return

    const category = getCategoryFromType(type)

    const newFluid: FluidRecord = {
      id: Date.now().toString(),
      type,
      category,
      volume: parseInt(volume),
      startTime: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      rate: rate ? parseInt(rate) : undefined,
    }

    onAddFluid(newFluid)
    setIsOpen(false)
    setType('')
    setVolume('')
    setRate('')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-4 w-4" />
              Líquidos
            </CardTitle>
            <Badge variant="secondary">Total: {totalVolume} mL</Badge>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Líquido</DialogTitle>
                <DialogDescription>
                  Ingrese el tipo de líquido, volumen y velocidad de infusión
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo de Líquido</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLUID_CATEGORIES.map((cat) => (
                        <SelectGroup key={cat.value}>
                          <SelectLabel className="flex items-center gap-2 py-1">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${CATEGORY_CONFIG[cat.value].dot}`}
                            />
                            {cat.label}
                          </SelectLabel>
                          {cat.types.map((t) => (
                            <SelectItem key={t} value={t} className="pl-6">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Volumen (mL)</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Velocidad (mL/h) — Opcional</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddFluid} className="w-full">
                  Agregar Líquido
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leyenda de colores */}
        <div className="flex flex-wrap gap-3 pt-1">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {fluids.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Sin líquidos registrados
            </p>
          )}
          {fluids.map((fluid) => {
            const cat = CATEGORY_CONFIG[fluid.category ?? getCategoryFromType(fluid.type)]
            return (
              <div
                key={fluid.id}
                className={`flex items-center justify-between rounded-lg border-l-4 bg-muted/50 px-3 py-2 ${cat.color}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{fluid.type}</p>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-xs font-medium ${cat.badge}`}
                    >
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inicio: {fluid.startTime}
                    {fluid.rate && ` • ${fluid.rate} mL/h`}
                  </p>
                </div>
                <Badge>{fluid.volume} mL</Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
