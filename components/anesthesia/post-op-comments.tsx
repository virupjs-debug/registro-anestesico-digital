'use client'

import { LogOut, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { PostOpInfo, PostOpDestination } from '@/lib/types'

const DESTINATIONS: { value: PostOpDestination; label: string }[] = [
  { value: 'urpa',      label: 'URPA — Sala de Recuperación Postanestésica' },
  { value: 'uti',       label: 'UTI — Unidad de Terapia Intensiva' },
  { value: 'uci',       label: 'UCI — Unidad de Cuidados Intensivos' },
  { value: 'sala',      label: 'Sala / Piso' },
  { value: 'domicilio', label: 'Domicilio' },
  { value: 'otro',      label: 'Otro' },
]

const CONDITION_OPTIONS = [
  'Extubado',
  'Intubado',
  'Ventilación mecánica',
  'Estable',
  'Inestable',
  'Crítico',
  'Sedoanalgesiado',
  'Con oxígeno suplementario',
  'Sin analgesia pendiente',
  'Con analgesia pendiente',
]

interface PostOpCommentsProps {
  postOpInfo: PostOpInfo
  onChange: (info: PostOpInfo) => void
}

export function PostOpComments({ postOpInfo, onChange }: PostOpCommentsProps) {
  const update = (patch: Partial<PostOpInfo>) =>
    onChange({ ...postOpInfo, ...patch })

  const toggleCondition = (cond: string) => {
    const current = postOpInfo.conditions
    const next = current.includes(cond)
      ? current.filter((c) => c !== cond)
      : [...current, cond]
    update({ conditions: next })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LogOut className="h-4 w-4" />
          Egreso del Quirófano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Destino */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            Destino del paciente
          </Label>
          <Select
            value={postOpInfo.destination ?? ''}
            onValueChange={(v) => update({ destination: v as PostOpDestination })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar destino…" />
            </SelectTrigger>
            <SelectContent>
              {DESTINATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {postOpInfo.destination === 'otro' && (
            <Input
              placeholder="Especificar destino…"
              value={postOpInfo.destinationOther ?? ''}
              onChange={(e) => update({ destinationOther: e.target.value })}
              className="mt-1"
            />
          )}
        </div>

        {/* Condición del paciente */}
        <div className="space-y-2">
          <Label className="text-sm">Condición al egreso</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {CONDITION_OPTIONS.map((cond) => (
              <div key={cond} className="flex items-center gap-2">
                <Checkbox
                  id={`cond-${cond}`}
                  checked={postOpInfo.conditions.includes(cond)}
                  onCheckedChange={() => toggleCondition(cond)}
                />
                <label
                  htmlFor={`cond-${cond}`}
                  className="text-sm leading-none cursor-pointer select-none"
                >
                  {cond}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Comentarios libres */}
        <div className="space-y-2">
          <Label className="text-sm">Comentarios adicionales</Label>
          <Textarea
            placeholder="Observaciones al momento del egreso, indicaciones especiales, estado hemodinámico, dolor…"
            value={postOpInfo.comments}
            onChange={(e) => update({ comments: e.target.value })}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

      </CardContent>
    </Card>
  )
}
