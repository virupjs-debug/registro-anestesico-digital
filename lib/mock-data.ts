import type { AnesthesiaRecord, TherapeuticGroup, FluidCategory } from './types'

export const mockRecord: AnesthesiaRecord = {
  id: 'AR-2026-000001',
  patient: {
    id: 'PAC-000001',
    name: '',
    lastName: '',
    dni: '',
    medicalRecordNumber: '',
    healthInsurance: '',
    affiliateNumber: '',
    dateOfBirth: '',
    gender: 'Femenino',
    weight: 0,
    height: 0,
    allergies: [],
    medicalHistory: [],
    asa: 1,
  },
  date: '',
  procedure: '',
  surgeon: '',
  assistantSurgeon: '',
  anesthesiologist: '',
  anesthesiaType: '',
  startTime: '',
  endTime: '',
  preOpStatus: {
    npo: '',
    labs: [],
    consent: false,
  },
  airway: {
    method: 'Tubo Endotraqueal',
    deviceType: 'tubo_endotraqueal',
    hasBalloon: true,
    size: '7.5',
    attempts: 1,
    difficulty: 'Fácil',
    confirmedBy: '',
    time: '',
  },
  vitals: [],
  medications: [],
  fluids: [],
  events: [],
  notes: '',
  postOpInfo: {
    conditions: [],
    comments: '',
  },
}

export type CommonMedication = {
  name: string
  doses: string[]
  group: TherapeuticGroup
  supportsInfusion?: boolean
  infusionUnits?: string[]
}

export const commonMedications: CommonMedication[] = [
  // Opioides intraoperatorios — Azul
  { name: 'Fentanilo', doses: ['25 mcg', '50 mcg', '100 mcg', '150 mcg', '200 mcg'], group: 'opioide', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'mcg/kg/hs', 'mcg/hs', 'ng/ml', 'ng/kg/min', 'ml/hs'] },
  { name: 'Remifentanilo', doses: ['0.05 mcg/kg/min', '0.1 mcg/kg/min', '0.2 mcg/kg/min', '0.5 mcg/kg/min'], group: 'opioide', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'ng/ml', 'ng/kg/min', 'µg/kg/min', 'ml/hs'] },
  { name: 'Sufentanilo', doses: ['5 mcg', '10 mcg', '15 mcg', '25 mcg'], group: 'opioide', supportsInfusion: true, infusionUnits: ['mcg/kg/hs', 'mcg/hs', 'ng/ml', 'ng/kg/min', 'ml/hs'] },
  { name: 'Alfentanilo', doses: ['250 mcg', '500 mcg', '1000 mcg'], group: 'opioide', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'ng/ml', 'ng/kg/min', 'ml/hs'] },
  // Opiáceos para dolor postoperatorio — Índigo
  { name: 'Morfina', doses: ['2 mg', '4 mg', '6 mg', '8 mg', '10 mg'], group: 'opiaceo_postop', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Tramadol', doses: ['50 mg', '100 mg'], group: 'opiaceo_postop', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Oxicodona', doses: ['5 mg', '10 mg', '20 mg'], group: 'opiaceo_postop' },
  { name: 'Hidromorfona', doses: ['0.5 mg', '1 mg', '2 mg', '4 mg'], group: 'opiaceo_postop', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Buprenorfina', doses: ['0.15 mg', '0.3 mg', '0.6 mg'], group: 'opiaceo_postop' },
  { name: 'Codeína', doses: ['30 mg', '60 mg'], group: 'opiaceo_postop' },
  { name: 'Metadona', doses: ['5 mg', '10 mg'], group: 'opiaceo_postop' },
  // AINEs y Analgésicos — Cyan
  { name: 'Ketorolaco', doses: ['15 mg', '30 mg', '60 mg'], group: 'aine' },
  { name: 'Ibuprofeno', doses: ['400 mg', '600 mg', '800 mg'], group: 'aine', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Diclofenac', doses: ['75 mg', '150 mg'], group: 'aine' },
  { name: 'Meloxicam', doses: ['7.5 mg', '15 mg'], group: 'aine' },
  { name: 'Parecoxib', doses: ['20 mg', '40 mg'], group: 'aine' },
  { name: 'Celecoxib', doses: ['100 mg', '200 mg'], group: 'aine' },
  { name: 'Dipirona', doses: ['1 g', '2 g', '2.5 g'], group: 'aine', supportsInfusion: true, infusionUnits: ['g/hs', 'ml/hs'] },
  { name: 'Paracetamol', doses: ['500 mg', '1 g'], group: 'aine', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  // Corticoides — Ámbar
  { name: 'Dexametasona', doses: ['4 mg', '8 mg', '12 mg', '16 mg'], group: 'corticoide' },
  { name: 'Hidrocortisona', doses: ['100 mg', '200 mg', '500 mg'], group: 'corticoide', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Metilprednisolona', doses: ['40 mg', '80 mg', '125 mg', '500 mg', '1 g'], group: 'corticoide', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Betametasona', doses: ['4 mg', '8 mg'], group: 'corticoide' },
  { name: 'Prednisona', doses: ['20 mg', '40 mg', '60 mg'], group: 'corticoide' },
  // Broncodilatadores — Celeste
  { name: 'Salbutamol', doses: ['2.5 mg', '5 mg'], group: 'broncodilatador', supportsInfusion: true, infusionUnits: ['mcg/min', 'mcg/kg/min', 'ml/hs'] },
  { name: 'Ipratropio', doses: ['0.25 mg', '0.5 mg'], group: 'broncodilatador' },
  { name: 'Fenoterol', doses: ['0.25 mg', '0.5 mg'], group: 'broncodilatador' },
  { name: 'Terbutalina', doses: ['0.25 mg', '0.5 mg'], group: 'broncodilatador', supportsInfusion: true, infusionUnits: ['mcg/min', 'ml/hs'] },
  { name: 'Aminofilina', doses: ['100 mg', '250 mg', '500 mg'], group: 'broncodilatador', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Salmeterol', doses: ['25 mcg', '50 mcg'], group: 'broncodilatador' },
  { name: 'Formoterol', doses: ['6 mcg', '12 mcg'], group: 'broncodilatador' },
  // Benzodiacepinas — Naranja
  { name: 'Midazolam', doses: ['1 mg', '2 mg', '3 mg', '5 mg'], group: 'benzodiacepina', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Diazepam', doses: ['5 mg', '10 mg'], group: 'benzodiacepina' },
  { name: 'Lorazepam', doses: ['1 mg', '2 mg', '4 mg'], group: 'benzodiacepina' },
  // Anticolinérgicos — Verde
  { name: 'Atropina', doses: ['0.5 mg', '1 mg'], group: 'anticolinergico' },
  { name: 'Glicopirrolato', doses: ['0.1 mg', '0.2 mg', '0.4 mg'], group: 'anticolinergico' },
  { name: 'Neostigmina', doses: ['2.5 mg', '5 mg'], group: 'anticolinergico' },
  { name: 'Sugammadex', doses: ['100 mg', '200 mg', '400 mg'], group: 'anticolinergico' },
  // Vasopresores — Violeta
  { name: 'Noradrenalina', doses: ['Infusión continua'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'mcg/min', 'ml/hs'] },
  { name: 'Adrenalina', doses: ['Infusión continua'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'mcg/min', 'ml/hs'] },
  { name: 'Dopamina', doses: ['Infusión continua'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'ml/hs'] },
  { name: 'Dobutamina', doses: ['Infusión continua'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'ml/hs'] },
  { name: 'Vasopresina', doses: ['Infusión continua'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['UI/min', 'ml/hs'] },
  { name: 'Fenilefrina', doses: ['50 mcg', '100 mcg', '200 mcg'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'mcg/min', 'ml/hs'] },
  { name: 'Efedrina', doses: ['5 mg', '10 mg', '15 mg', '20 mg'], group: 'vasopresor' },
  { name: 'Metaraminol', doses: ['0.5 mg', '1 mg', '2 mg'], group: 'vasopresor', supportsInfusion: true, infusionUnits: ['mcg/kg/min', 'ml/hs'] },
  // Antibióticos
  { name: 'Cefazolina', doses: ['1 g', '2 g', '3 g'], group: 'antibiotico' },
  { name: 'Ceftriaxona', doses: ['1 g', '2 g'], group: 'antibiotico' },
  { name: 'Ampicilina/Sulbactam', doses: ['1.5 g', '3 g'], group: 'antibiotico' },
  { name: 'Amoxicilina/Clavulánico', doses: ['1.2 g', '2.4 g'], group: 'antibiotico' },
  { name: 'Ciprofloxacina', doses: ['200 mg', '400 mg'], group: 'antibiotico', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Metronidazol', doses: ['500 mg', '1 g'], group: 'antibiotico', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Vancomicina', doses: ['500 mg', '1 g', '1.5 g'], group: 'antibiotico', supportsInfusion: true, infusionUnits: ['mg/hs', 'ml/hs'] },
  { name: 'Clindamicina', doses: ['300 mg', '600 mg', '900 mg'], group: 'antibiotico' },
  { name: 'Gentamicina', doses: ['80 mg', '160 mg', '240 mg'], group: 'antibiotico' },
  { name: 'Piperacilina/Tazobactam', doses: ['2.25 g', '4.5 g'], group: 'antibiotico', supportsInfusion: true, infusionUnits: ['g/hs', 'ml/hs'] },
  { name: 'Meropenem', doses: ['500 mg', '1 g', '2 g'], group: 'antibiotico', supportsInfusion: true, infusionUnits: ['g/hs', 'ml/hs'] },
  // Antieméticos — Rosa
  { name: 'Ondansetrón', doses: ['4 mg', '8 mg'], group: 'antihemetico' },
  { name: 'Metoclopramida', doses: ['5 mg', '10 mg'], group: 'antihemetico' },
  { name: 'Droperidol', doses: ['0.625 mg', '1.25 mg', '2.5 mg'], group: 'antihemetico' },
  { name: 'Dimenhidrinato', doses: ['25 mg', '50 mg'], group: 'antihemetico' },
  // Protectores gástricos
  { name: 'Omeprazol', doses: ['20 mg', '40 mg'], group: 'protector_gastrico' },
  { name: 'Ranitidina', doses: ['50 mg', '150 mg', '300 mg'], group: 'protector_gastrico' },
  { name: 'Pantoprazol', doses: ['20 mg', '40 mg'], group: 'protector_gastrico' },
  { name: 'Esomeprazol', doses: ['20 mg', '40 mg'], group: 'protector_gastrico' },
  { name: 'Lansoprazol', doses: ['15 mg', '30 mg'], group: 'protector_gastrico' },
  // Otros
]

export const fluidTypes = [
  'Solución Hartmann',
  'Solución Salina 0.9%',
  'Dextrosa 5%',
  'Coloides',
  'Albúmina 5%',
  'Concentrado Eritrocitario',
  'Plasma Fresco Congelado',
  'Plaquetas',
]

export const FLUID_CATEGORIES: {
  label: string
  value: FluidCategory
  types: string[]
}[] = [
  {
    label: 'Cristaloides',
    value: 'cristaloide',
    types: [
      'Solución Hartmann',
      'Solución Salina 0.9%',
      'Solución Salina 0.45%',
      'Dextrosa 5%',
      'Dextrosa 5% + SF',
      'Ringer Lactato',
      'Solución Glucosalina',
    ],
  },
  {
    label: 'Coloides',
    value: 'coloide',
    types: [
      'Albúmina 5%',
      'Albúmina 20%',
      'Gelatinas (Gelofusine)',
      'Almidones (HES)',
    ],
  },
  {
    label: 'Hemoderivados',
    value: 'hemoderivado',
    types: [
      'Concentrado Eritrocitario',
      'Plasma Fresco Congelado',
      'Plaquetas',
      'Crioprecipitados',
      'Sangre Entera',
      'Fibrinógeno',
      'Complejo Protrombínico',
    ],
  },
  {
    label: 'Otro',
    value: 'otro',
    types: [
      'Manitol 20%',
      'Bicarbonato de Sodio 8.4%',
      'Cloruro de Potasio',
      'Nutrición Parenteral',
    ],
  },
]
