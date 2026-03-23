'use client'

import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface NotesSectionProps {
  notes: string
  onNotesChange: (notes: string) => void
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Notas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Escriba notas adicionales sobre el procedimiento..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </CardContent>
    </Card>
  )
}
