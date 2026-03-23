export interface Patient {
  id: string
  name: string
  lastName: string
  dni: string
  medicalRecordNumber: string
  healthInsurance?: string
  affiliateNumber?: string
  dateOfBirth: string
  gender: string
  weight: number
  height: number
  allergies: string[]
  medicalHistory: string[]
  asa: number
  cormackLehane?: 1 | 2 | 3 | 4
  lastOralIntake?: string
}

export interface VitalSign {
  time: string
  timestamp: number
  hr: number       // Heart Rate (lpm)
  sbp: number      // Systolic BP (mmHg)
  dbp: number      // Diastolic BP (mmHg)
  map: number      // Mean Arterial Pressure (mmHg)
  spo2: number     // Oxygen Saturation (%)
  etco2: number    // End-tidal CO2 (mmHg)
  temp: number     // Temperature (°C)
  rr: number       // Respiratory Rate (rpm)
  // Neuromonitoring
  bis?: number     // Bispectral Index (0–100)
  nirsL?: number   // NIRS left hemisphere (%)
  nirsR?: number   // NIRS right hemisphere (%)
  // Invasive pressures
  abpSys?: number  // Arterial line systolic (mmHg)
  abpDia?: number  // Arterial line diastolic (mmHg)
  abpMean?: number // Arterial line mean (mmHg)
  cvp?: number     // Central venous pressure (mmHg)
}

export type TherapeuticGroup =
  | 'opioide'
  | 'opiaceo_postop'
  | 'aine'
  | 'protector_gastrico'
  | 'corticoide'
  | 'broncodilatador'
  | 'benzodiacepina'
  | 'anticolinergico'
  | 'vasopresor'
  | 'antibiotico'
  | 'antihemetico'
  | 'otro'

export interface Medication {
  id: string
  name: string
  dose: string
  route: string
  time: string
  administeredBy: string
  therapeuticGroup?: TherapeuticGroup
  isInfusion?: boolean
  infusionRate?: number
  infusionRateUnit?: string
}

export type FluidCategory = 'cristaloide' | 'coloide' | 'hemoderivado' | 'otro'

export interface FluidRecord {
  id: string
  type: string
  category: FluidCategory
  volume: number
  startTime: string
  endTime?: string
  rate?: number
}

export interface VentilationSettings {
  type: 'mecanica' | 'asistida'
  // Para ventilación mecánica
  mode?: 'presion' | 'volumen'
  frequency?: number // rpm
  tidalVolume?: number // mL
  minuteVolume?: number // L/min
  peep?: number // cmH2O
  peakPressure?: number // cmH2O
  // Para ventilación asistida
  circuit?: 'abierto' | 'cerrado'
}

export type AirwayDeviceType = 'tubo_endotraqueal' | 'mascaraLaringea' | 'igel'

export interface AirwayManagement {
  method: string
  deviceType?: AirwayDeviceType
  hasBalloon?: boolean // Solo aplica a tubo endotraqueal
  size: string
  fixationCm?: number // Fijación a nivel de comisura bucal en cm
  attempts: number
  difficulty: string
  confirmedBy: string
  time: string
  difficultAirway?: boolean
  difficultVentilation?: boolean
  videoLaryngoscope?: boolean
  fiberopticBronchoscopy?: boolean
  comments?: string
  ventilation?: VentilationSettings
}

export type EventCategory =
  | 'normal'
  | 'hemorragia'
  | 'broncoespasmo'
  | 'anafilaxia'
  | 'paro_cardiaco'
  | 'inicio_rcp'
  | 'complicacion_otro'

export interface CardiacArrestDrug {
  name: string
  dose: string
  unit: string
}

export interface Defibrillation {
  joules: number
  time: string
}

export interface ProcedureEvent {
  id: string
  time: string
  event: string
  notes?: string
  category?: EventCategory
  cardiacArrestData?: {
    drugs: CardiacArrestDrug[]
    defibrillations: Defibrillation[]
  }
}

export type AnesthesiaTypeCategory = 'regional' | 'sedacion' | 'general'
export type GeneralAnesthesiaType = 'inhalatoria' | 'endovenosa' | 'balanceada'
export type EndovenousMethod = 'TIVA' | 'manual'
export type TivaSubMethod = 'manual' | 'TCI' | 'bolo'
export type DrugCategory = 'analgesicos' | 'hipnoticos' | 'bloqueadores' | 'miscelaneos'
export type RegionalType = 'troncular' | 'neuroaxial'
export type NeuroaxialType = 'peridural' | 'subaracnoideo' | 'cateter_peridural'

export type InfusionRateUnit = 'mcg/ml' | 'mcg/kg/min' | 'ug/ml/h' | 'ng/h' | 'ug/kg/min' | 'ml/h'
export type BolusDoseUnit = 'ug' | 'mg' | 'mcg'
export type TotalDoseUnit = 'mg' | 'ug' | 'g' | 'mcg' | 'ng' | 'UI'

export interface DrugModel {
  category: DrugCategory
  model: string
  infusionRate?: number
  infusionRateUnit?: InfusionRateUnit
  startTime?: string
  maintenanceTime?: string
  // Para bolo
  bolusDose?: number
  bolusDoseUnit?: BolusDoseUnit
  // Para dosis total infundida (misceláneos)
  totalDose?: number
  totalDoseUnit?: TotalDoseUnit
  // Para medicación personalizada (misceláneos - Otro)
  customName?: string
  // Para TCI analgésicos: dosis de inducción y mantenimiento
  inductionDose?: number
  inductionDoseUnit?: string
  maintenanceDose?: number
  maintenanceDoseUnit?: string
  // Múltiples dosis de mantenimiento (cada ajuste durante el procedimiento)
  maintenanceDoses?: Array<{ dose: number; doseUnit: string; time?: string }>
}

export interface TivaConfiguration {
  subMethod: TivaSubMethod
  drugModels?: DrugModel[]
}

export type ManualDoseUnit = 'ug' | 'mg' | 'ml'

export interface ManualDrugConfig {
  drug?: string
  bolusDose?: number
  bolusDoseUnit?: ManualDoseUnit
  maintenanceRate?: number
  maintenanceRateUnit?: ManualDoseUnit
}

export interface ManualEndovenousConfig {
  analgesico?: ManualDrugConfig
  hipnotico?: ManualDrugConfig
}

export interface InhalatoryGasConfig {
  inductionGas?: string
  inductionCAM?: number // CAM %
  maintenanceGas?: string
  maintenanceCAM?: number // CAM %
  o2Flow?: number // L/min
  airFlow?: number // L/min
  n2oFlow?: number // L/min
}

export interface LocalAnestheticConfig {
  drug?: string
  concentration?: string // porcentaje
  doseInMg?: number
  volumeInMl?: number
}

export type CatheterInfusionRateUnit = 'ml/h' | 'ml/kg/min'
export type RescueBolusUnit = 'ml' | 'mg'

export interface CatheterInfusionConfig {
  infusionRate?: number
  infusionRateUnit?: CatheterInfusionRateUnit
  rescueBolusEnabled?: boolean
  rescueBolusAmount?: number
  rescueBolusUnit?: RescueBolusUnit
}

export type AdjuvantDoseUnit = 'ug' | 'mg'

export interface RegionalAdjuvant {
  drug?: string
  dose?: number
  doseUnit?: AdjuvantDoseUnit
}

export type SedationDoseUnit = 'ug' | 'mg' | 'mcg'

export interface SedationDrugConfig {
  drug?: string
  dose?: number
  doseUnit?: SedationDoseUnit
}

export interface SedationConfig {
  inductionDrug?: SedationDrugConfig
  maintenanceDrug?: SedationDrugConfig
}

export interface AnesthesiaTypeInfo {
  category: AnesthesiaTypeCategory
  categories?: AnesthesiaTypeCategory[] // Para combinaciones
  // Para anestesia general
  generalType?: GeneralAnesthesiaType
  endovenousMethod?: EndovenousMethod
  tivaConfig?: TivaConfiguration
  manualConfig?: ManualEndovenousConfig
  inhalatoryConfig?: InhalatoryGasConfig
  // Para anestesia regional
  regionalType?: RegionalType
  neuroaxialType?: NeuroaxialType
  blockDescription?: string // Descripción del bloqueo de plexo
  localAnesthetic?: LocalAnestheticConfig
  adjuvants?: RegionalAdjuvant[]
  catheterInfusion?: CatheterInfusionConfig
  // Para sedación
  sedationConfig?: SedationConfig
}

export type PostOpDestination =
  | 'urpa'
  | 'uti'
  | 'uci'
  | 'sala'
  | 'domicilio'
  | 'otro'

export interface PostOpInfo {
  destination?: PostOpDestination
  destinationOther?: string
  conditions: string[]
  comments: string
}

export interface AnesthesiaRecord {
  id: string
  patient: Patient
  date: string
  procedure: string
  surgeon: string
  assistantSurgeon?: string
  anesthesiologist: string
  anesthesiaType: string
  anesthesiaTypeInfo?: AnesthesiaTypeInfo
  startTime: string
  endTime?: string
  preOpStatus: {
    npo: string
    labs: string[]
    labFiles?: { name: string; url: string }[]
    consent: boolean
    consentFile?: { name: string; url: string }
  }
  airway: AirwayManagement
  vitals: VitalSign[]
  medications: Medication[]
  fluids: FluidRecord[]
  events: ProcedureEvent[]
  notes: string
  postOpInfo?: PostOpInfo
}
