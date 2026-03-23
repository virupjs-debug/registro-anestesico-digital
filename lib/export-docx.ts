import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx'
import type { AnesthesiaRecord } from './types'

type HLevel = (typeof HeadingLevel)[keyof typeof HeadingLevel]

// ─── helpers ──────────────────────────────────────────────────────────────────

function heading(text: string, level: HLevel = HeadingLevel.HEADING_2) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 60 },
  })
}

function row(cells: string[], isHeader = false): TableRow {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (text) =>
        new TableCell({
          shading: isHeader
            ? { type: ShadingType.SOLID, color: '1E40AF', fill: '1E40AF' }
            : undefined,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: isHeader,
                  color: isHeader ? 'FFFFFF' : '111827',
                  size: 20,
                }),
              ],
            }),
          ],
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
        }),
    ),
  })
}

function simpleTable(headers: string[], dataRows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
    },
    rows: [
      row(headers, true),
      ...dataRows.map((r) => row(r)),
    ],
  })
}

function kv(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20 }),
      new TextRun({ text: value || '—', size: 20 }),
    ],
    spacing: { after: 40 },
  })
}

function empty(): Paragraph {
  return new Paragraph({ text: '' })
}

function calcAge(dateOfBirth: string): string {
  if (!dateOfBirth) return '—'
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return '—'
  const ageDiff = Date.now() - dob.getTime()
  const years = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25))
  return `${years} años`
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function exportToDocx(record: AnesthesiaRecord): Promise<void> {
  const p = record.patient
  const fullName = `${p.name} ${p.lastName}`.trim() || '—'
  const bmi = p.weight && p.height ? (p.weight / Math.pow(p.height / 100, 2)).toFixed(1) : '—'
  const idealWeight = p.height ? (0.9 * (p.height - 100)).toFixed(1) : '—'

  // ── Medications ──────────────────────────────────────────────────────────────
  const medRows: string[][] =
    record.medications.length > 0
      ? record.medications.map((m) => [
          m.time,
          m.name,
          m.isInfusion ? `${m.infusionRate} ${m.infusionRateUnit}` : m.dose,
          m.route,
          m.therapeuticGroup ?? '—',
        ])
      : [['—', '—', '—', '—', '—']]

  // ── Fluids ──────────────────────────────────────────────────────────────────
  const fluidRows: string[][] =
    record.fluids.length > 0
      ? record.fluids.map((f) => [
          f.type,
          f.category,
          `${f.volume} ml`,
          f.startTime,
          f.endTime ?? '—',
        ])
      : [['—', '—', '—', '—', '—']]

  const totalFluids = record.fluids.reduce((s, f) => s + f.volume, 0)

  // ── Events ──────────────────────────────────────────────────────────────────
  const eventRows: string[][] =
    record.events.length > 0
      ? record.events.map((e) => [e.time, e.event, e.category ?? '—', e.notes ?? '—'])
      : [['—', '—', '—', '—']]

  // ── Vitals ──────────────────────────────────────────────────────────────────
  const vitalRows: string[][] =
    record.vitals.length > 0
      ? record.vitals.map((v) => [
          v.time,
          String(v.hr),
          String(v.sbp),
          String(v.dbp),
          `${v.spo2}%`,
          String(v.etco2),
          `${v.temp}°C`,
        ])
      : [['—', '—', '—', '—', '—', '—', '—']]

  // ── Anesthesia type label ────────────────────────────────────────────────────
  const typeInfo = record.anesthesiaTypeInfo
  const categoryLabel: Record<string, string> = {
    general: 'General', regional: 'Regional', sedacion: 'Sedación',
  }
  const anesthesiaLabel = typeInfo
    ? (typeInfo.categories ?? [typeInfo.category]).map((c) => categoryLabel[c] ?? c).join(' + ')
    : record.anesthesiaType || '—'

  // ── Airway ───────────────────────────────────────────────────────────────────
  const aw = record.airway

  // ── Post-op ──────────────────────────────────────────────────────────────────
  const po = record.postOpInfo
  const destLabel: Record<string, string> = {
    urpa: 'URPA', uti: 'UTI', uci: 'UCI', sala: 'Sala', domicilio: 'Domicilio', otro: 'Otro',
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20 },
        },
      },
    },
    sections: [
      {
        children: [
          // ── TITLE ────────────────────────────────────────────────────────────
          new Paragraph({
            children: [new TextRun({ text: 'REGISTRO ANESTÉSICO DIGITAL', bold: true, size: 32, color: '1E40AF' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: record.id, size: 22, color: '6B7280' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Fecha: ${record.date}`, size: 20, color: '6B7280' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),

          // ── DATOS DEL PACIENTE ────────────────────────────────────────────────
          heading('1. Datos del Paciente', HeadingLevel.HEADING_1),
          kv('Nombre y Apellido', fullName),
          kv('DNI', p.dni || '—'),
          kv('Nº Historia Clínica', p.medicalRecordNumber || '—'),
          kv('Fecha de Nacimiento', p.dateOfBirth || '—'),
          kv('Edad', calcAge(p.dateOfBirth)),
          kv('Sexo / Género', p.gender || '—'),
          kv('Peso', p.weight ? `${p.weight} kg` : '—'),
          kv('Talla', p.height ? `${p.height} cm` : '—'),
          kv('IMC', bmi),
          kv('Peso Ideal', idealWeight ? `${idealWeight} kg` : '—'),
          kv('ASA', p.asa ? `ASA ${p.asa}` : '—'),
          kv('Alergias', p.allergies?.length ? p.allergies.join(', ') : 'Sin alergias conocidas'),
          kv('Antecedentes', Array.isArray(p.medicalHistory) ? (p.medicalHistory.join(', ') || '—') : (p.medicalHistory || '—')),
          empty(),

          // ── DATOS OPERATORIOS ─────────────────────────────────────────────────
          heading('2. Datos Operatorios', HeadingLevel.HEADING_1),
          kv('Procedimiento', record.procedure || '—'),
          kv('Cirujano', record.surgeon || '—'),
          kv('Cirujano Asistente', record.assistantSurgeon || '—'),
          kv('Anestesiólogo', record.anesthesiologist || '—'),
          kv('Hora de inicio', record.startTime || '—'),
          kv('Hora de fin', record.endTime || '—'),
          empty(),

          // ── TIPO DE ANESTESIA ─────────────────────────────────────────────────
          heading('3. Tipo de Anestesia', HeadingLevel.HEADING_1),
          kv('Modalidad', anesthesiaLabel),
          ...(typeInfo?.generalType ? [kv('Subtipo General', typeInfo.generalType)] : []),
          ...(typeInfo?.regionalType ? [kv('Tipo Regional', typeInfo.regionalType)] : []),
          ...(typeInfo?.neuroaxialType ? [kv('Neuroaxial', typeInfo.neuroaxialType)] : []),
          ...(typeInfo?.blockDescription ? [kv('Bloqueo', typeInfo.blockDescription)] : []),
          ...(typeInfo?.localAnesthetic?.drug
            ? [kv('Anestésico Local', `${typeInfo.localAnesthetic.drug} ${typeInfo.localAnesthetic.concentration ?? ''} — ${typeInfo.localAnesthetic.doseInMg ?? ''}mg / ${typeInfo.localAnesthetic.volumeInMl ?? ''}ml`)]
            : []),
          empty(),

          // ── VÍA AÉREA ─────────────────────────────────────────────────────────
          heading('4. Manejo de Vía Aérea', HeadingLevel.HEADING_1),
          kv('Método', aw.method || '—'),
          kv('Dispositivo', aw.deviceType?.replace('_', ' ') || '—'),
          kv('Tamaño', aw.size || '—'),
          kv('Fijación', aw.fixationCm ? `${aw.fixationCm} cm` : '—'),
          kv('Intentos', String(aw.attempts || '—')),
          kv('Dificultad', aw.difficulty || '—'),
          kv('Confirmación', aw.confirmedBy || '—'),
          kv('Hora', aw.time || '—'),
          kv('Vía aérea difícil', aw.difficultAirway ? 'Sí' : 'No'),
          kv('Ventilación difícil', aw.difficultVentilation ? 'Sí' : 'No'),
          kv('Videolaringoscopio', aw.videoLaryngoscope ? 'Sí' : 'No'),
          kv('Fibrobroncoscopio', aw.fiberopticBronchoscopy ? 'Sí' : 'No'),
          ...(aw.comments ? [kv('Comentarios', aw.comments)] : []),
          empty(),

          // ── SIGNOS VITALES ────────────────────────────────────────────────────
          heading('5. Signos Vitales', HeadingLevel.HEADING_1),
          simpleTable(
            ['Hora', 'FC (lpm)', 'PAS (mmHg)', 'PAD (mmHg)', 'SpO₂', 'EtCO₂', 'Temp.'],
            vitalRows,
          ),
          empty(),

          // ── MEDICAMENTOS ──────────────────────────────────────────────────────
          heading('6. Medicamentos', HeadingLevel.HEADING_1),
          simpleTable(
            ['Hora', 'Medicamento', 'Dosis / Vel.', 'Vía', 'Grupo'],
            medRows,
          ),
          empty(),

          // ── LÍQUIDOS ──────────────────────────────────────────────────────────
          heading('7. Líquidos', HeadingLevel.HEADING_1),
          simpleTable(
            ['Tipo', 'Categoría', 'Volumen', 'Inicio', 'Fin'],
            fluidRows,
          ),
          kv('Total administrado', `${totalFluids} ml`),
          empty(),

          // ── EVENTOS ───────────────────────────────────────────────────────────
          heading('8. Línea de Eventos', HeadingLevel.HEADING_1),
          simpleTable(
            ['Hora', 'Evento', 'Categoría', 'Notas'],
            eventRows,
          ),
          empty(),

          // ── NOTAS ─────────────────────────────────────────────────────────────
          heading('9. Notas', HeadingLevel.HEADING_1),
          new Paragraph({
            children: [new TextRun({ text: record.notes || '—', size: 20 })],
            spacing: { after: 120 },
          }),
          empty(),

          // ── EGRESO DEL QUIRÓFANO ──────────────────────────────────────────────
          ...(po
            ? [
                heading('10. Egreso del Quirófano', HeadingLevel.HEADING_1),
                kv('Destino', po.destination ? (destLabel[po.destination] ?? po.destination) : '—'),
                ...(po.destinationOther ? [kv('Destino (otro)', po.destinationOther)] : []),
                kv('Condiciones', po.conditions?.length ? po.conditions.join(', ') : '—'),
                kv('Comentarios', po.comments || '—'),
                empty(),
              ]
            : []),

          // ── FIRMA ─────────────────────────────────────────────────────────────
          heading('Firma del Anestesiólogo', HeadingLevel.HEADING_1),
          new Paragraph({
            children: [new TextRun({ text: '________________________________________', size: 24 })],
            spacing: { before: 480, after: 60 },
          }),
          kv('Nombre', record.anesthesiologist || '—'),
          kv('Fecha y hora de firma', new Date().toLocaleString('es-ES')),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${record.id}-registro-anestesico.docx`
  a.click()
  URL.revokeObjectURL(url)
}
