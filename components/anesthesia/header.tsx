'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, User, Pencil, Check, X, LogIn, LogOut, Download, Printer, FileDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  recordId: string
  patientName: string
  procedure: string
  startTime: string
  endTime?: string
  isActive: boolean
  onChangePatientName?: (name: string) => void
  onChangeProcedure?: (procedure: string) => void
  onChangeStartTime?: (time: string) => void
  onChangeEndTime?: (time: string) => void
  onSave?: () => void
  onExportDocx?: () => void
}

// ── Inline text editable ──────────────────────────────────────────
function InlineEditable({
  value, onSave, icon: Icon, placeholder, className = '',
}: {
  value: string; onSave: (v: string) => void
  icon: React.ElementType; placeholder?: string; className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) { setDraft(value); setTimeout(() => inputRef.current?.focus(), 0) }
  }, [editing, value])

  const confirm = () => { const t = draft.trim(); if (t) onSave(t); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey} placeholder={placeholder}
          className={`h-7 py-0 text-sm border-primary ${className}`} />
        <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700" onClick={confirm}><Check className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={cancel}><X className="h-3.5 w-3.5" /></Button>
      </div>
    )
  }
  return (
    <button type="button"
      className="group flex items-center gap-2 rounded px-1 -mx-1 hover:bg-muted/60 transition-colors"
      onClick={() => setEditing(true)} title="Haga clic para editar">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className={className}>{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ── Inline time editable ──────────────────────────────────────────
function InlineTime({
  label, value, onSave, icon: Icon,
}: {
  label: string; value: string; onSave: (v: string) => void
  icon: React.ElementType
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) { setDraft(value); setTimeout(() => inputRef.current?.focus(), 0) }
  }, [editing, value])

  const confirm = () => { if (draft) onSave(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">{label}:</span>
        <Input
          ref={inputRef} type="time" value={draft}
          onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
          className="h-6 w-24 border-primary py-0 text-xs px-1"
        />
        <Button size="icon" variant="ghost" className="h-5 w-5 text-green-600 hover:text-green-700" onClick={confirm}><Check className="h-3 w-3" /></Button>
        <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={cancel}><X className="h-3 w-3" /></Button>
      </div>
    )
  }

  return (
    <button type="button"
      className="group flex items-center gap-2 rounded-lg bg-muted px-3 py-2 hover:bg-muted/70 transition-colors"
      onClick={() => setEditing(true)} title="Haga clic para editar">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-foreground">
        {value || <span className="text-muted-foreground italic text-xs">--:--</span>}
      </span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ── Main header ───────────────────────────────────────────────────
export function AnesthesiaHeader({
  recordId, patientName, procedure,
  startTime, endTime, isActive,
  onChangePatientName, onChangeProcedure,
  onChangeStartTime, onChangeEndTime, onSave, onExportDocx,
}: HeaderProps) {
  const handleFinalize = () => {
    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    onChangeEndTime?.(now)
  }

  const handleReopen = () => {
    onChangeEndTime?.('')
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">

        {/* Left: brand + patient + procedure */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src="/Logo_1774145758656.png"
              alt="Asociación Austral de Anestesia, Analgesia y Reanimación"
              className="h-24 w-auto shrink-0 object-contain"
            />
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Registro Anestésico Digital</h1>
              <p className="text-sm text-muted-foreground">{recordId}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden sm:block" />

          <InlineEditable
            value={patientName} onSave={(v) => onChangePatientName?.(v)}
            icon={User} placeholder="Nombre del paciente"
            className="font-semibold text-foreground min-w-[140px]"
          />

          <InlineEditable
            value={procedure} onSave={(v) => onChangeProcedure?.(v)}
            icon={FileText} placeholder="Procedimiento quirúrgico"
            className="text-muted-foreground min-w-[160px]"
          />
        </div>

        {/* Right: times + badge + save */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Inicio (editable) */}
          <InlineTime
            label="Inicio" value={startTime} icon={LogIn}
            onSave={(v) => onChangeStartTime?.(v)}
          />

          {/* Fin: editable if set, button if not */}
          {endTime ? (
            <div className="flex items-center gap-1">
              <InlineTime
                label="Fin" value={endTime} icon={LogOut}
                onSave={(v) => onChangeEndTime?.(v)}
              />
              <Button
                size="sm" variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive print:hidden"
                onClick={handleReopen}
                title="Reabrir registro"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm" variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive print:hidden"
              onClick={handleFinalize}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Finalizar cirugía
            </Button>
          )}

          {/* Status badge */}
          {isActive ? (
            <Badge className="bg-success text-success-foreground">
              <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-success-foreground" />
              En Curso
            </Badge>
          ) : (
            <Badge variant="secondary">Finalizado</Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="print:hidden">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Guardar / Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onSave}>
                <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                Imprimir / Guardar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDocx}>
                <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                Exportar Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
