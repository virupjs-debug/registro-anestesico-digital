'use client'

import { useState } from 'react'
import { AnesthesiaHeader } from '@/components/anesthesia/header'
import { PatientInfo } from '@/components/anesthesia/patient-info'
import { VitalsChart } from '@/components/anesthesia/vitals-chart'
import { MedicationsTable } from '@/components/anesthesia/medications-table'
import { FluidsTable } from '@/components/anesthesia/fluids-table'
import { EventsTimeline } from '@/components/anesthesia/events-timeline'
import { AirwayInfo } from '@/components/anesthesia/airway-info'
import { AnesthesiaType } from '@/components/anesthesia/anesthesia-type'
import { NotesSection } from '@/components/anesthesia/notes-section'
import { PostOpComments } from '@/components/anesthesia/post-op-comments'
import { SignaturePad } from '@/components/anesthesia/signature-pad'
import { mockRecord } from '@/lib/mock-data'
import type { AnesthesiaRecord, Medication, FluidRecord, ProcedureEvent, AnesthesiaTypeInfo, AirwayManagement, Patient, VitalSign, PostOpInfo } from '@/lib/types'
import { exportToDocx } from '@/lib/export-docx'

export default function AnesthesiaRecordPage() {
  const [record, setRecord] = useState<AnesthesiaRecord>(mockRecord)

  const handleSave = () => {
    window.print()
  }

  const handleExportDocx = () => {
    exportToDocx(record)
  }

  const handleAddMedication = (medication: Medication) => {
    setRecord((prev) => ({
      ...prev,
      medications: [...prev.medications, medication],
    }))
  }

  const handleDeleteMedication = (id: string) => {
    setRecord((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }))
  }

  const handleUpdateMedication = (updated: Medication) => {
    setRecord((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.id === updated.id ? updated : m)),
    }))
  }

  const handleAddVital = (vital: VitalSign) => {
    setRecord((prev) => ({
      ...prev,
      vitals: [...prev.vitals, vital].sort((a, b) => a.timestamp - b.timestamp),
    }))
  }

  const handleUpdateVital = (updated: VitalSign) => {
    setRecord((prev) => ({
      ...prev,
      vitals: prev.vitals.map((v) => (v.timestamp === updated.timestamp ? updated : v)),
    }))
  }

  const handleDeleteVital = (timestamp: number) => {
    setRecord((prev) => ({
      ...prev,
      vitals: prev.vitals.filter((v) => v.timestamp !== timestamp),
    }))
  }

  const handleAddFluid = (fluid: FluidRecord) => {
    setRecord((prev) => ({
      ...prev,
      fluids: [...prev.fluids, fluid],
    }))
  }

  const handleAddEvent = (event: ProcedureEvent) => {
    setRecord((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }))
  }

  const handleNotesChange = (notes: string) => {
    setRecord((prev) => ({
      ...prev,
      notes,
    }))
  }

  const handlePostOpChange = (postOpInfo: PostOpInfo) => {
    setRecord((prev) => ({ ...prev, postOpInfo }))
  }

  const handleAnesthesiaTypeChange = (anesthesiaTypeInfo: AnesthesiaTypeInfo) => {
    setRecord((prev) => ({
      ...prev,
      anesthesiaTypeInfo,
    }))
  }

  const handleAirwayChange = (airway: AirwayManagement) => {
    setRecord((prev) => ({ ...prev, airway }))
  }

  const handlePatientChange = (patient: Patient) => {
    setRecord((prev) => ({ ...prev, patient }))
  }

  const handleOperativeChange = (fields: { surgeon: string; assistantSurgeon?: string; anesthesiologist: string; anesthesiaType: string }) => {
    setRecord((prev) => ({ ...prev, ...fields }))
  }

  const handlePreOpChange = (preOpStatus: typeof record.preOpStatus) => {
    setRecord((prev) => ({ ...prev, preOpStatus }))
  }

  const handleChangePatientName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/)
    const name = parts[0] ?? ''
    const lastName = parts.slice(1).join(' ')
    setRecord((prev) => ({
      ...prev,
      patient: { ...prev.patient, name, lastName },
    }))
  }

  const handleChangeProcedure = (procedure: string) => {
    setRecord((prev) => ({ ...prev, procedure }))
  }

  const handleChangeStartTime = (startTime: string) => {
    setRecord((prev) => ({ ...prev, startTime }))
  }

  const handleChangeEndTime = (endTime: string) => {
    setRecord((prev) => ({ ...prev, endTime }))
  }

  return (
    <div className="min-h-screen bg-background" id="anesthesia-record-content">
      <AnesthesiaHeader
        recordId={record.id}
        patientName={`${record.patient.name} ${record.patient.lastName}`.trim()}
        procedure={record.procedure}
        startTime={record.startTime}
        endTime={record.endTime}
        isActive={!record.endTime}
        onChangePatientName={handleChangePatientName}
        onChangeProcedure={handleChangeProcedure}
        onChangeStartTime={handleChangeStartTime}
        onChangeEndTime={handleChangeEndTime}
        onSave={handleSave}
        onExportDocx={handleExportDocx}
      />

      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Patient Info — encima del gráfico */}
          <div id="print-patient-section">
            <PatientInfo
              patient={record.patient}
              surgeon={record.surgeon}
              assistantSurgeon={record.assistantSurgeon}
              anesthesiologist={record.anesthesiologist}
              anesthesiaType={record.anesthesiaType}
              preOpStatus={record.preOpStatus}
              onChange={handlePatientChange}
              onChangeOperative={handleOperativeChange}
              onChangePreOp={handlePreOpChange}
            />
          </div>

          {/* Vitals Chart */}
          <div id="print-vitals-section">
            <VitalsChart
              vitals={record.vitals}
              events={record.events}
              onAddVital={handleAddVital}
              onUpdateVital={handleUpdateVital}
              onDeleteVital={handleDeleteVital}
            />
          </div>

          {/* Firma — solo visible al imprimir */}
          <div className="print-only-signature hidden">
            <SignaturePad label="Firma del Anestesiólogo" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4" id="print-grid">
            {/* Left Column: Timeline + Notes + Medications + Fluids */}
            <div className="space-y-6" id="print-col-left">
              <EventsTimeline events={record.events} onAddEvent={handleAddEvent} />
              <NotesSection notes={record.notes} onNotesChange={handleNotesChange} />
              <MedicationsTable
                medications={record.medications}
                onAddMedication={handleAddMedication}
                onDeleteMedication={handleDeleteMedication}
                onUpdateMedication={handleUpdateMedication}
              />
              <FluidsTable fluids={record.fluids} onAddFluid={handleAddFluid} />
            </div>

            {/* Middle Columns: Anesthesia Type */}
            <div className="space-y-6 lg:col-span-2" id="print-col-mid">
              <AnesthesiaType 
                anesthesiaTypeInfo={record.anesthesiaTypeInfo} 
                onChange={handleAnesthesiaTypeChange} 
              />
            </div>

            {/* Right Column: Airway, PostOp and Signatures */}
            <div className="space-y-6" id="print-col-right">
              <AirwayInfo airway={record.airway} onChange={handleAirwayChange} />
              <PostOpComments
                postOpInfo={record.postOpInfo ?? { conditions: [], comments: '' }}
                onChange={handlePostOpChange}
              />
              <SignaturePad label="Firma del Anestesiólogo" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
