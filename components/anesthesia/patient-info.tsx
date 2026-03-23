'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, CheckCircle2, FileText, Paperclip, X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Patient } from '@/lib/types'

interface OperativeFields {
  surgeon: string
  assistantSurgeon?: string
  anesthesiologist: string
  anesthesiaType: string
}

interface PatientInfoProps {
  patient: Patient
  surgeon: string
  assistantSurgeon?: string
  anesthesiologist: string
  anesthesiaType: string
  preOpStatus: {
    npo: string
    labs: string[]
    labFiles?: { name: string; url: string }[]
    consent: boolean
    consentFile?: { name: string; url: string }
  }
  onChange?: (patient: Patient) => void
  onChangeOperative?: (fields: OperativeFields) => void
  onChangePreOp?: (preOp: { npo: string; labs: string[]; labFiles?: { name: string; url: string }[]; consent: boolean; consentFile?: { name: string; url: string } }) => void
}

export function PatientInfo({ patient, surgeon, assistantSurgeon, anesthesiologist, anesthesiaType, preOpStatus, onChange, onChangeOperative, onChangePreOp }: PatientInfoProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Patient>(patient)
  const [draftOp, setDraftOp] = useState<OperativeFields>({ surgeon, assistantSurgeon, anesthesiologist, anesthesiaType })
  const [draftPreOp, setDraftPreOp] = useState({ ...preOpStatus })
  const [newLab, setNewLab] = useState('')
  const consentFileRef = useRef<HTMLInputElement>(null)
  const labFileRef = useRef<HTMLInputElement>(null)

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
  const bmi = (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)

  const isMale = patient.gender?.toLowerCase().includes('masc')
  const ibwBase = isMale ? 50 : 45.5
  const ibw = Math.max(ibwBase + 0.91 * (patient.height - 152.4), 30)
  const ibwDisplay = ibw.toFixed(1)
  const abw = patient.weight > ibw ? ibw + 0.4 * (patient.weight - ibw) : null
  const abwDisplay = abw ? abw.toFixed(1) : null

  const draftAge = new Date().getFullYear() - new Date(draft.dateOfBirth).getFullYear()
  const draftBmi = draft.height > 0 ? (draft.weight / Math.pow(draft.height / 100, 2)).toFixed(1) : '—'
  const draftIsMale = draft.gender?.toLowerCase().includes('masc')
  const draftIbwBase = draftIsMale ? 50 : 45.5
  const draftIbw = Math.max(draftIbwBase + 0.91 * (draft.height - 152.4), 30)
  const draftAbw = draft.weight > draftIbw ? draftIbw + 0.4 * (draft.weight - draftIbw) : null

  const handleSave = () => {
    onChange?.(draft)
    onChangeOperative?.(draftOp)
    onChangePreOp?.(draftPreOp)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(patient)
    setDraftOp({ surgeon, assistantSurgeon, anesthesiologist, anesthesiaType })
    setDraftPreOp({ ...preOpStatus })
    setNewLab('')
    setEditing(false)
  }

  const setOp = <K extends keyof OperativeFields>(field: K, value: OperativeFields[K]) => {
    setDraftOp((prev) => ({ ...prev, [field]: value }))
  }

  const setPreOp = <K extends keyof typeof draftPreOp>(field: K, value: (typeof draftPreOp)[K]) => {
    setDraftPreOp((prev) => ({ ...prev, [field]: value }))
  }

  const handleConsentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreOp('consentFile', { name: file.name, url })
  }

  const handleLabFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))
    setDraftPreOp((prev) => ({
      ...prev,
      labFiles: [...(prev.labFiles || []), ...newFiles],
    }))
  }

  const removeLabFile = (index: number) => {
    setDraftPreOp((prev) => ({
      ...prev,
      labFiles: prev.labFiles?.filter((_, i) => i !== index),
    }))
  }

  const addLab = () => {
    const trimmed = newLab.trim()
    if (!trimmed) return
    setPreOp('labs', [...draftPreOp.labs, trimmed])
    setNewLab('')
  }

  const removeLab = (index: number) => {
    setPreOp('labs', draftPreOp.labs.filter((_, i) => i !== index))
  }

  const set = <K extends keyof Patient>(field: K, value: Patient[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          Datos del Paciente
          {!editing ? (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>
              Editar
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSave}>
                Guardar
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Datos de identificación */}
        {editing ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identificación</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <Input className="h-8 text-xs" value={draft.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Apellido</Label>
                <Input className="h-8 text-xs" value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">DNI</Label>
                <Input className="h-8 text-xs" value={draft.dni} onChange={(e) => set('dni', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">N° Historia Clínica</Label>
                <Input className="h-8 text-xs" value={draft.medicalRecordNumber} onChange={(e) => set('medicalRecordNumber', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Obra Social</Label>
                <Input className="h-8 text-xs" value={draft.healthInsurance || ''} onChange={(e) => set('healthInsurance', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">N° Afiliado</Label>
                <Input className="h-8 text-xs" value={draft.affiliateNumber || ''} onChange={(e) => set('affiliateNumber', e.target.value)} />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Clínico</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label>
                <Input type="date" className="h-8 text-xs" value={draft.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Edad (calculada)</Label>
                <Input className="h-8 text-xs bg-muted" value={`${draftAge} años`} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Sexo</Label>
                <Select value={draft.gender} onValueChange={(v) => set('gender', v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Peso real (kg)</Label>
                <Input type="number" step="0.1" className="h-8 text-xs" value={draft.weight} onChange={(e) => set('weight', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Talla (cm)</Label>
                <Input type="number" step="1" className="h-8 text-xs" value={draft.height} onChange={(e) => set('height', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IMC (calculado)</Label>
                <Input className="h-8 text-xs bg-muted" value={draftBmi} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Peso Ideal (kg)</Label>
                <Input className="h-8 text-xs bg-muted" value={draftIbw.toFixed(1)} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Peso Ajustado (kg)</Label>
                <Input className="h-8 text-xs bg-muted" value={draftAbw ? draftAbw.toFixed(1) : '—'} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">ASA</Label>
                <Select value={String(draft.asa)} onValueChange={(v) => set('asa', parseInt(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>ASA {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cormack-Lehane</Label>
                <Select
                  value={draft.cormackLehane ? String(draft.cormackLehane) : 'none'}
                  onValueChange={(v) => set('cormackLehane', v === 'none' ? undefined : parseInt(v) as 1 | 2 | 3 | 4)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No evaluado —</SelectItem>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>Grado {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Última Ingesta Oral</Label>
                <Input className="h-8 text-xs" value={draft.lastOralIntake || ''} onChange={(e) => set('lastOralIntake', e.target.value)} />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Equipo Quirúrgico</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Cirujano</Label>
                <Input className="h-8 text-xs" value={draftOp.surgeon} onChange={(e) => setOp('surgeon', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Ayudante / 2° Cirujano</Label>
                <Input className="h-8 text-xs" placeholder="Opcional" value={draftOp.assistantSurgeon || ''} onChange={(e) => setOp('assistantSurgeon', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Anestesiólogo</Label>
                <Input className="h-8 text-xs" value={draftOp.anesthesiologist} onChange={(e) => setOp('anesthesiologist', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Tipo de Anestesia</Label>
                <Input className="h-8 text-xs" value={draftOp.anesthesiaType} onChange={(e) => setOp('anesthesiaType', e.target.value)} />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Alergias</p>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Separadas por coma</Label>
              <Textarea
                className="text-xs min-h-[60px]"
                value={draft.allergies.join(', ')}
                onChange={(e) => set('allergies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Antecedentes</p>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Separados por coma</Label>
              <Textarea
                className="text-xs min-h-[60px]"
                value={draft.medicalHistory.join(', ')}
                onChange={(e) => set('medicalHistory', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Estado Preoperatorio</p>

            {/* Ayuno */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ayuno (NPO)</Label>
              <Input className="h-8 text-xs" value={draftPreOp.npo} onChange={(e) => setPreOp('npo', e.target.value)} />
            </div>

            {/* Consentimiento */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Consentimiento</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={draftPreOp.consent ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setPreOp('consent', !draftPreOp.consent)}
                >
                  {draftPreOp.consent ? 'Firmado' : 'Pendiente'}
                </Button>
                <input
                  ref={consentFileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleConsentFileUpload}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => consentFileRef.current?.click()}
                >
                  <Paperclip className="mr-1 h-3 w-3" />
                  {draftPreOp.consentFile ? 'Cambiar PDF' : 'Adjuntar PDF'}
                </Button>
                {draftPreOp.consentFile && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 text-primary" />
                    <span className="truncate max-w-[100px]">{draftPreOp.consentFile.name}</span>
                    <button
                      type="button"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => setPreOp('consentFile', undefined)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Laboratorios */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Laboratorios</Label>
              <div className="flex flex-wrap gap-1">
                {draftPreOp.labs.map((lab, i) => (
                  <Badge key={i} variant="outline" className="text-xs gap-1">
                    {lab}
                    <button type="button" onClick={() => removeLab(i)}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  className="h-7 text-xs"
                  placeholder="Ej: Hemograma"
                  value={newLab}
                  onChange={(e) => setNewLab(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLab() } }}
                />
                <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={addLab}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Archivos de laboratorio */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    ref={labFileRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleLabFileUpload}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => labFileRef.current?.click()}
                  >
                    <Paperclip className="mr-1 h-3 w-3" />
                    Adjuntar PDF(s)
                  </Button>
                </div>
                {(draftPreOp.labFiles || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 text-primary" />
                    <span className="truncate max-w-[160px]">{f.name}</span>
                    <button type="button" className="text-destructive hover:text-destructive/80" onClick={() => removeLabFile(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Vista solo lectura */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground">Nombre y Apellido</p>
                <p className="font-medium text-foreground">{patient.name} {patient.lastName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">DNI</p>
                <p className="font-medium text-foreground">{patient.dni}</p>
              </div>
              <div>
                <p className="text-muted-foreground">N° Historia Clínica</p>
                <p className="font-medium text-foreground">{patient.medicalRecordNumber}</p>
              </div>
              {patient.healthInsurance && (
                <div>
                  <p className="text-muted-foreground">Obra Social</p>
                  <p className="font-medium text-foreground">{patient.healthInsurance}</p>
                </div>
              )}
              {patient.affiliateNumber && (
                <div>
                  <p className="text-muted-foreground">N° Afiliado</p>
                  <p className="font-medium text-foreground">{patient.affiliateNumber}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-medium text-foreground">Información Clínica</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Edad</p>
                  <p className="font-medium text-foreground">{age} años</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sexo</p>
                  <p className="font-medium text-foreground">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-medium text-foreground">{patient.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Talla</p>
                  <p className="font-medium text-foreground">{patient.height} cm</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IMC</p>
                  <p className="font-medium text-foreground">{bmi}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Peso Ideal</p>
                  <p className="font-medium text-foreground">{ibwDisplay} kg</p>
                </div>
                {abwDisplay && (
                  <div>
                    <p className="text-muted-foreground">Peso Ajustado</p>
                    <p className="font-medium text-foreground">{abwDisplay} kg</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">ASA</p>
                  <Badge variant="outline" className="mt-0.5">ASA {patient.asa}</Badge>
                </div>
                {patient.cormackLehane && (
                  <div>
                    <p className="text-muted-foreground">Cormack-Lehane</p>
                    <Badge variant="outline" className="mt-0.5">Grado {patient.cormackLehane}</Badge>
                  </div>
                )}
                {patient.lastOralIntake && (
                  <div>
                    <p className="text-muted-foreground">Última Ingesta Oral</p>
                    <p className="font-medium text-foreground">{patient.lastOralIntake}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-foreground">Alergias</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">Sin alergias conocidas</Badge>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-foreground">Antecedentes</p>
              <div className="flex flex-wrap gap-2">
                {patient.medicalHistory.map((item) => (
                  <Badge key={item} variant="secondary">{item}</Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cirujano</span>
            <span className="font-medium text-foreground">{surgeon}</span>
          </div>
          {assistantSurgeon && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ayudante</span>
              <span className="font-medium text-foreground">{assistantSurgeon}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Anestesiólogo</span>
            <span className="font-medium text-foreground">{anesthesiologist}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo Anestesia</span>
            <span className="font-medium text-foreground">{anesthesiaType}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-foreground">Estado Preoperatorio</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ayuno</span>
              <span className="font-medium text-foreground">{preOpStatus.npo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Consentimiento</span>
              <div className="flex items-center gap-1">
                {preOpStatus.consent ? (
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Firmado
                  </Badge>
                ) : (
                  <Badge variant="destructive">Pendiente</Badge>
                )}
                {preOpStatus.consentFile && (
                  <a
                    href={preOpStatus.consentFile.url}
                    target="_blank"
                    rel="noreferrer"
                    title={preOpStatus.consentFile.name}
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Laboratorios</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {preOpStatus.labs.map((lab) => (
                  <Badge key={lab} variant="outline" className="text-xs">{lab}</Badge>
                ))}
              </div>
              {(preOpStatus.labFiles || []).length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {(preOpStatus.labFiles || []).map((f, i) => (
                    <a
                      key={i}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                    >
                      <FileText className="h-3 w-3" />
                      {f.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
