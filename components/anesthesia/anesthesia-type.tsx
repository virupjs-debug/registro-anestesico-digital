'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Syringe, Wind, Activity, Clock, Plus, XIcon } from 'lucide-react'
import type { 
  AnesthesiaTypeInfo, 
  AnesthesiaTypeCategory, 
  GeneralAnesthesiaType, 
  EndovenousMethod, 
  RegionalType, 
  NeuroaxialType,
  TivaSubMethod,
  DrugCategory,
  DrugModel,
  InfusionRateUnit,
  BolusDoseUnit,
  TotalDoseUnit,
  ManualDrugConfig,
  ManualDoseUnit,
  InhalatoryGasConfig,
  LocalAnestheticConfig,
  RegionalAdjuvant,
  AdjuvantDoseUnit,
  SedationDrugConfig,
  SedationDoseUnit,
  CatheterInfusionRateUnit,
  RescueBolusUnit
} from '@/lib/types'

interface AnesthesiaTypeProps {
  anesthesiaTypeInfo?: AnesthesiaTypeInfo
  onChange?: (info: AnesthesiaTypeInfo) => void
}

// Modelos de fármacos por categoría
const drugModelsByCategory: Record<DrugCategory, string[]> = {
  analgesicos: [
    'Remifentanilo (Minto)',
    'Remifentanilo (Minto/Janmhasatian)',
    'Remifentanilo (Eleveld)',
    'Remifentanilo (Kim)',
    'Fentanilo',
    'Sufentanilo',
    'Alfentanilo',
  ],
  hipnoticos: [
    'Propofol (Marsh)',
    'Propofol (Schnider)',
    'Propofol (Eleveld)',
    'Propofol (Paedfusor)',
    'Propofol (Kataria)',
    'Ketamina (Domino)',
    'Midazolam (Greenblatt)',
    'Etomidato',
  ],
  bloqueadores: [
    'Rocuronio',
    'Cisatracurio',
    'Vecuronio',
    'Atracurio',
    'Succinilcolina',
    'Mivacurio',
    'Pancuronio',
  ],
  miscelaneos: [
    'Dexmedetomidina (Hannivoort)',
    'Dexmedetomidina (Dyck)',
    'Lidocaína',
    'Ketamina',
    'Magnesio',
    'Neostigmina',
    'Sugammadex',
    'Otro',
  ],
}

const drugCategoryLabels: Record<DrugCategory, string> = {
  analgesicos: 'Analgésicos',
  hipnoticos: 'Hipnóticos',
  bloqueadores: 'Bloqueadores Musculares',
  miscelaneos: 'Misceláneos',
}

const infusionRateUnits: InfusionRateUnit[] = ['mcg/ml', 'mcg/kg/min', 'ug/ml/h', 'ng/h', 'ug/kg/min', 'ml/h']
const tciDoseUnits = ['ng/ml', 'mcg/ml', 'ug/ml', 'ng/kg/min', 'mcg/kg/min']
const bolusDoseUnits: BolusDoseUnit[] = ['ug', 'mg', 'mcg']
const totalDoseUnits: TotalDoseUnit[] = ['mg', 'ug', 'g', 'mcg', 'ng', 'UI']

// Fármacos para método manual
const manualAnalgesicos = ['Fentanilo', 'Remifentanilo', 'Sufentanilo', 'Alfentanilo', 'Morfina']
const manualHipnoticos = ['Propofol', 'Ketamina', 'Midazolam', 'Etomidato', 'Tiopental']
const manualDoseUnits: ManualDoseUnit[] = ['ug', 'mg', 'ml']

// Gases anestésicos
const anestheticGases = ['Sevoflurano', 'Desflurano', 'Isoflurano', 'Halotano', 'Óxido Nitroso']

// Anestésicos locales
const localAnesthetics = ['Bupivacaína', 'Levobupivacaína', 'Ropivacaína', 'Lidocaína', 'Mepivacaína', 'Prilocaína']
const localAnestheticConcentrations = ['0.125%', '0.25%', '0.5%', '0.75%', '1%', '2%']

// Adyuvantes para anestesia regional
const regionalAdjuvants = ['Fentanilo', 'Morfina', 'Clonidina', 'Dexmedetomidina', 'Epinefrina', 'Sulfato de Magnesio', 'Dexametasona']
const adjuvantDoseUnits: AdjuvantDoseUnit[] = ['ug', 'mg']

// Fármacos para sedación
const sedationDrugs = ['Propofol', 'Midazolam', 'Ketamina', 'Dexmedetomidina', 'Fentanilo', 'Remifentanilo']
const sedationDoseUnits: SedationDoseUnit[] = ['ug', 'mg', 'mcg']

// Unidades de infusión para catéter peridural
const catheterInfusionRateUnits: CatheterInfusionRateUnit[] = ['ml/h', 'ml/kg/min']
const rescueBolusUnits: RescueBolusUnit[] = ['ml', 'mg']

export function AnesthesiaType({ anesthesiaTypeInfo, onChange }: AnesthesiaTypeProps) {
  const [info, setInfo] = useState<AnesthesiaTypeInfo>(
    anesthesiaTypeInfo || { 
      category: 'general',
      categories: ['general'],
      generalType: 'endovenosa', 
      endovenousMethod: 'TIVA',
      tivaConfig: { subMethod: 'TCI', drugModels: [] }
    }
  )

  useEffect(() => {
    if (anesthesiaTypeInfo) {
      setInfo(anesthesiaTypeInfo)
    }
  }, [anesthesiaTypeInfo])

  const handleCategoryToggle = (category: AnesthesiaTypeCategory, checked: boolean) => {
    const currentCategories = info.categories || [info.category]
    let newCategories: AnesthesiaTypeCategory[]
    
    if (checked) {
      newCategories = [...currentCategories, category]
    } else {
      newCategories = currentCategories.filter(c => c !== category)
      // Asegurar que al menos una categoría esté seleccionada
      if (newCategories.length === 0) {
        return
      }
    }
    
    let newInfo: AnesthesiaTypeInfo = { 
      ...info,
      category: newCategories[0], // Mantener compatibilidad
      categories: newCategories
    }
    
    // Inicializar configuraciones según las categorías seleccionadas
    if (newCategories.includes('general') && !info.generalType) {
      newInfo.generalType = 'endovenosa'
      newInfo.endovenousMethod = 'TIVA'
      newInfo.tivaConfig = { subMethod: 'TCI', drugModels: [] }
    }
    if (newCategories.includes('regional') && !info.regionalType) {
      newInfo.regionalType = 'neuroaxial'
      newInfo.neuroaxialType = 'peridural'
      newInfo.localAnesthetic = {}
    }
    if (newCategories.includes('sedacion') && !info.sedationConfig) {
      newInfo.sedationConfig = { inductionDrug: {}, maintenanceDrug: {} }
    }
    
    // Limpiar configuraciones de categorías no seleccionadas
    if (!newCategories.includes('general')) {
      newInfo.generalType = undefined
      newInfo.endovenousMethod = undefined
      newInfo.tivaConfig = undefined
      newInfo.manualConfig = undefined
      newInfo.inhalatoryConfig = undefined
    }
    if (!newCategories.includes('regional')) {
      newInfo.regionalType = undefined
      newInfo.neuroaxialType = undefined
      newInfo.blockDescription = undefined
      newInfo.localAnesthetic = undefined
      newInfo.adjuvants = undefined
      newInfo.catheterInfusion = undefined
    }
    if (!newCategories.includes('sedacion')) {
      newInfo.sedationConfig = undefined
    }
    
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const isCategorySelected = (category: AnesthesiaTypeCategory): boolean => {
    return (info.categories || [info.category]).includes(category)
  }

  const handleGeneralTypeChange = (generalType: GeneralAnesthesiaType) => {
    const needsEndovenous = generalType === 'endovenosa' || generalType === 'balanceada'
    const needsInhalatory = generalType === 'inhalatoria' || generalType === 'balanceada'
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      generalType,
      endovenousMethod: needsEndovenous ? (info.endovenousMethod || 'TIVA') : undefined,
      tivaConfig: needsEndovenous ? (info.tivaConfig || { subMethod: 'TCI', drugModels: [] }) : undefined,
      manualConfig: needsEndovenous && info.endovenousMethod === 'manual' ? info.manualConfig : (needsEndovenous ? undefined : undefined),
      inhalatoryConfig: needsInhalatory ? (info.inhalatoryConfig || {}) : undefined,
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleInhalatoryConfigChange = (field: keyof InhalatoryGasConfig, value: string | number | undefined) => {
    const currentConfig = info.inhalatoryConfig || {}
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      inhalatoryConfig: { ...currentConfig, [field]: value }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleEndovenousMethodChange = (endovenousMethod: EndovenousMethod) => {
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      endovenousMethod,
      tivaConfig: endovenousMethod === 'TIVA' ? { subMethod: 'TCI', drugModels: [] } : undefined,
      manualConfig: endovenousMethod === 'manual' ? { analgesico: {}, hipnotico: {} } : undefined
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleManualDrugChange = (
    drugType: 'analgesico' | 'hipnotico', 
    field: keyof ManualDrugConfig, 
    value: string | number | undefined
  ) => {
    const currentConfig = info.manualConfig || { analgesico: {}, hipnotico: {} }
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      manualConfig: {
        ...currentConfig,
        [drugType]: { ...currentConfig[drugType], [field]: value }
      }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleTivaSubMethodChange = (subMethod: TivaSubMethod) => {
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      tivaConfig: { ...info.tivaConfig, subMethod, drugModels: info.tivaConfig?.drugModels || [] }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleDrugModelChange = (category: DrugCategory, model: string) => {
    const currentModels = info.tivaConfig?.drugModels || []
    const existingIndex = currentModels.findIndex(dm => dm.category === category)
    
    let newModels: DrugModel[]
    if (model === 'none') {
      newModels = currentModels.filter(dm => dm.category !== category)
    } else if (existingIndex >= 0) {
      newModels = currentModels.map((dm, i) => i === existingIndex ? { ...dm, category, model } : dm)
    } else {
      newModels = [...currentModels, { category, model }]
    }
    
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      tivaConfig: { 
        subMethod: info.tivaConfig?.subMethod || 'TCI', 
        drugModels: newModels 
      }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleDrugInfusionChange = (category: DrugCategory, field: 'infusionRate' | 'infusionRateUnit' | 'startTime' | 'maintenanceTime' | 'bolusDose' | 'bolusDoseUnit' | 'totalDose' | 'totalDoseUnit' | 'customName' | 'inductionDose' | 'inductionDoseUnit' | 'maintenanceDose' | 'maintenanceDoseUnit', value: string | number) => {
    const currentModels = info.tivaConfig?.drugModels || []
    const newModels = currentModels.map(dm => {
      if (dm.category === category) {
        return { ...dm, [field]: value }
      }
      return dm
    })
    
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      tivaConfig: { 
        subMethod: info.tivaConfig?.subMethod || 'TCI', 
        drugModels: newModels 
      }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  // ── Maintenance doses (analgesicos TCI) ──────────────────────────────────
  const handleAddMaintenanceDose = (category: DrugCategory, defaultUnit = 'ng/ml') => {
    const models = info.tivaConfig?.drugModels || []
    const newModels = models.map(dm => {
      if (dm.category !== category) return dm
      const existing = dm.maintenanceDoses || []
      return { ...dm, maintenanceDoses: [...existing, { dose: 0, doseUnit: defaultUnit, time: '' }] }
    })
    const newInfo = { ...info, tivaConfig: { subMethod: info.tivaConfig?.subMethod || 'TCI', drugModels: newModels } }
    setInfo(newInfo); onChange?.(newInfo)
  }

  const handleUpdateMaintenanceDose = (category: DrugCategory, idx: number, field: 'dose' | 'doseUnit' | 'time', value: string | number) => {
    const models = info.tivaConfig?.drugModels || []
    const newModels = models.map(dm => {
      if (dm.category !== category) return dm
      const doses = (dm.maintenanceDoses || []).map((d, i) => i === idx ? { ...d, [field]: value } : d)
      return { ...dm, maintenanceDoses: doses }
    })
    const newInfo = { ...info, tivaConfig: { subMethod: info.tivaConfig?.subMethod || 'TCI', drugModels: newModels } }
    setInfo(newInfo); onChange?.(newInfo)
  }

  const handleRemoveMaintenanceDose = (category: DrugCategory, idx: number) => {
    const models = info.tivaConfig?.drugModels || []
    const newModels = models.map(dm => {
      if (dm.category !== category) return dm
      return { ...dm, maintenanceDoses: (dm.maintenanceDoses || []).filter((_, i) => i !== idx) }
    })
    const newInfo = { ...info, tivaConfig: { subMethod: info.tivaConfig?.subMethod || 'TCI', drugModels: newModels } }
    setInfo(newInfo); onChange?.(newInfo)
  }

  const handleRegionalTypeChange = (regionalType: RegionalType) => {
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      regionalType,
      neuroaxialType: regionalType === 'neuroaxial' ? 'peridural' : undefined,
      blockDescription: regionalType === 'troncular' ? '' : undefined,
      localAnesthetic: {}
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleLocalAnestheticChange = (field: keyof LocalAnestheticConfig, value: string | number | undefined) => {
    const currentConfig = info.localAnesthetic || {}
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      localAnesthetic: { ...currentConfig, [field]: value }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleAddAdjuvant = () => {
    const currentAdjuvants = info.adjuvants || []
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      adjuvants: [...currentAdjuvants, { drug: undefined, dose: undefined, doseUnit: 'ug' }]
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleRemoveAdjuvant = (index: number) => {
    const currentAdjuvants = info.adjuvants || []
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      adjuvants: currentAdjuvants.filter((_, i) => i !== index)
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleAdjuvantChange = (index: number, field: keyof RegionalAdjuvant, value: string | number | undefined) => {
    const currentAdjuvants = [...(info.adjuvants || [])]
    currentAdjuvants[index] = { ...currentAdjuvants[index], [field]: value }
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      adjuvants: currentAdjuvants
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleSedationDrugChange = (
    drugType: 'inductionDrug' | 'maintenanceDrug', 
    field: keyof SedationDrugConfig, 
    value: string | number | undefined
  ) => {
    const currentConfig = info.sedationConfig || { inductionDrug: {}, maintenanceDrug: {} }
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      sedationConfig: {
        ...currentConfig,
        [drugType]: { ...currentConfig[drugType], [field]: value }
      }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleNeuroaxialTypeChange = (neuroaxialType: NeuroaxialType) => {
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      neuroaxialType,
      catheterInfusion: neuroaxialType === 'cateter_peridural' ? {} : undefined
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleCatheterInfusionChange = (field: 'infusionRate' | 'infusionRateUnit' | 'rescueBolusAmount' | 'rescueBolusUnit', value: number | string | undefined) => {
    const currentConfig = info.catheterInfusion || {}
    const newInfo: AnesthesiaTypeInfo = { 
      ...info, 
      catheterInfusion: { ...currentConfig, [field]: value }
    }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const handleBlockDescriptionChange = (blockDescription: string) => {
    const newInfo: AnesthesiaTypeInfo = { ...info, blockDescription }
    setInfo(newInfo)
    onChange?.(newInfo)
  }

  const getCategoryIcon = (category: AnesthesiaTypeCategory) => {
    switch (category) {
      case 'general':
        return <Wind className="h-4 w-4" />
      case 'regional':
        return <Syringe className="h-4 w-4" />
      case 'sedacion':
        return <Activity className="h-4 w-4" />
    }
  }

  const getDrugModel = (category: DrugCategory): DrugModel | undefined => {
    return info.tivaConfig?.drugModels?.find(dm => dm.category === category)
  }

  const getDrugModelValue = (category: DrugCategory): string => {
    const model = getDrugModel(category)
    return model?.model || 'none'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Syringe className="h-4 w-4 text-primary" />
          Tipo de Anestesia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categoría Principal - Selección Múltiple */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Seleccionar tipo (combinable)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'general'  as AnesthesiaTypeCategory, label: 'General',  active: 'bg-blue-600 text-white border-blue-600 shadow-sm',   inactive: 'border-blue-200 text-blue-700 hover:bg-blue-50' },
              { value: 'regional' as AnesthesiaTypeCategory, label: 'Regional', active: 'bg-green-600 text-white border-green-600 shadow-sm', inactive: 'border-green-200 text-green-700 hover:bg-green-50' },
              { value: 'sedacion' as AnesthesiaTypeCategory, label: 'Sedación', active: 'bg-violet-600 text-white border-violet-600 shadow-sm', inactive: 'border-violet-200 text-violet-700 hover:bg-violet-50' },
            ] as const).map((option) => {
              const selected = isCategorySelected(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleCategoryToggle(option.value, !selected)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${selected ? option.active : option.inactive}`}
                >
                  {getCategoryIcon(option.value)}
                  {option.label}
                  {selected && <span className="ml-auto text-xs opacity-80">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Opciones para Anestesia General */}
        {isCategorySelected('general') && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <RadioGroup
                value={info.generalType || 'endovenosa'}
                onValueChange={(value) => handleGeneralTypeChange(value as GeneralAnesthesiaType)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inhalatoria" id="general-inhalatoria" />
                  <Label htmlFor="general-inhalatoria" className="cursor-pointer text-sm">
                    Inhalatoria
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="endovenosa" id="general-endovenosa" />
                  <Label htmlFor="general-endovenosa" className="cursor-pointer text-sm">
                    Endovenosa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanceada" id="general-balanceada" />
                  <Label htmlFor="general-balanceada" className="cursor-pointer text-sm">
                    Balanceada
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Opciones para Inhalatoria / Balanceada */}
            {(info.generalType === 'inhalatoria' || info.generalType === 'balanceada') && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Label className="text-sm font-medium">
                  {info.generalType === 'balanceada' ? 'Gases Anestésicos (componente inhalatorio)' : 'Gases Anestésicos'}
                </Label>
                
                {/* Gas de Inducción */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <Label className="text-xs font-medium text-muted-foreground">Inducción</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Gas</Label>
                      <Select
                        value={info.inhalatoryConfig?.inductionGas || 'none'}
                        onValueChange={(value) => handleInhalatoryConfigChange('inductionGas', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Ninguno --</SelectItem>
                          {anestheticGases.map((gas) => (
                            <SelectItem key={gas} value={gas}>{gas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">CAM %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.inhalatoryConfig?.inductionCAM || ''}
                        onChange={(e) => handleInhalatoryConfigChange('inductionCAM', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Gas de Mantenimiento */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <Label className="text-xs font-medium text-muted-foreground">Mantenimiento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Gas</Label>
                      <Select
                        value={info.inhalatoryConfig?.maintenanceGas || 'none'}
                        onValueChange={(value) => handleInhalatoryConfigChange('maintenanceGas', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Ninguno --</SelectItem>
                          {anestheticGases.map((gas) => (
                            <SelectItem key={gas} value={gas}>{gas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">CAM %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.inhalatoryConfig?.maintenanceCAM || ''}
                        onChange={(e) => handleInhalatoryConfigChange('maintenanceCAM', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Flujos de Gases */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <Label className="text-xs font-medium text-muted-foreground">Flujos (L/min)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">O2</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.inhalatoryConfig?.o2Flow || ''}
                        onChange={(e) => handleInhalatoryConfigChange('o2Flow', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Aire</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.inhalatoryConfig?.airFlow || ''}
                        onChange={(e) => handleInhalatoryConfigChange('airFlow', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">N2O</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.inhalatoryConfig?.n2oFlow || ''}
                        onChange={(e) => handleInhalatoryConfigChange('n2oFlow', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opciones para Endovenosa / Balanceada */}
            {(info.generalType === 'endovenosa' || info.generalType === 'balanceada') && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {info.generalType === 'balanceada' ? 'Método Endovenoso (componente endovenoso)' : 'Método'}
                  </Label>
                  <RadioGroup
                    value={info.endovenousMethod || 'TIVA'}
                    onValueChange={(value) => handleEndovenousMethodChange(value as EndovenousMethod)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="TIVA" id="endovenous-TIVA" />
                      <Label htmlFor="endovenous-TIVA" className="cursor-pointer text-sm">
                        TIVA
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="endovenous-manual" />
                      <Label htmlFor="endovenous-manual" className="cursor-pointer text-sm">
                        Manual
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Configuración Manual */}
                {info.endovenousMethod === 'manual' && (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Label className="text-sm font-medium">Configuración Manual</Label>
                    
                    {/* Analgésico */}
                    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                      <Label className="text-xs font-medium text-muted-foreground">Analgésico Endovenoso</Label>
                      <Select
                        value={info.manualConfig?.analgesico?.drug || 'none'}
                        onValueChange={(value) => handleManualDrugChange('analgesico', 'drug', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Ninguno --</SelectItem>
                          {manualAnalgesicos.map((drug) => (
                            <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {info.manualConfig?.analgesico?.drug && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Dosis Bolo</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={info.manualConfig?.analgesico?.bolusDose || ''}
                              onChange={(e) => handleManualDrugChange('analgesico', 'bolusDose', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Unidad</Label>
                            <Select
                              value={info.manualConfig?.analgesico?.bolusDoseUnit || 'mg'}
                              onValueChange={(value) => handleManualDrugChange('analgesico', 'bolusDoseUnit', value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {manualDoseUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Mant.</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={info.manualConfig?.analgesico?.maintenanceRate || ''}
                              onChange={(e) => handleManualDrugChange('analgesico', 'maintenanceRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Unidad</Label>
                            <Select
                              value={info.manualConfig?.analgesico?.maintenanceRateUnit || 'mg'}
                              onValueChange={(value) => handleManualDrugChange('analgesico', 'maintenanceRateUnit', value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {manualDoseUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hipnótico */}
                    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                      <Label className="text-xs font-medium text-muted-foreground">Hipnótico Endovenoso</Label>
                      <Select
                        value={info.manualConfig?.hipnotico?.drug || 'none'}
                        onValueChange={(value) => handleManualDrugChange('hipnotico', 'drug', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Ninguno --</SelectItem>
                          {manualHipnoticos.map((drug) => (
                            <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {info.manualConfig?.hipnotico?.drug && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Dosis Bolo</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={info.manualConfig?.hipnotico?.bolusDose || ''}
                              onChange={(e) => handleManualDrugChange('hipnotico', 'bolusDose', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Unidad</Label>
                            <Select
                              value={info.manualConfig?.hipnotico?.bolusDoseUnit || 'mg'}
                              onValueChange={(value) => handleManualDrugChange('hipnotico', 'bolusDoseUnit', value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {manualDoseUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Mant.</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={info.manualConfig?.hipnotico?.maintenanceRate || ''}
                              onChange={(e) => handleManualDrugChange('hipnotico', 'maintenanceRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Unidad</Label>
                            <Select
                              value={info.manualConfig?.hipnotico?.maintenanceRateUnit || 'mg'}
                              onValueChange={(value) => handleManualDrugChange('hipnotico', 'maintenanceRateUnit', value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {manualDoseUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuración TIVA */}
                {info.endovenousMethod === 'TIVA' && (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Submétodo TIVA</Label>
                      <RadioGroup
                        value={info.tivaConfig?.subMethod || 'TCI'}
                        onValueChange={(value) => handleTivaSubMethodChange(value as TivaSubMethod)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="tiva-manual" />
                          <Label htmlFor="tiva-manual" className="cursor-pointer text-sm">
                            Manual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="TCI" id="tiva-TCI" />
                          <Label htmlFor="tiva-TCI" className="cursor-pointer text-sm">
                            TCI
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bolo" id="tiva-bolo" />
                          <Label htmlFor="tiva-bolo" className="cursor-pointer text-sm">
                            Bolo
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Modelos de fármacos */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Modelos de Fármacos</Label>
                      {(Object.keys(drugModelsByCategory) as DrugCategory[]).map((category) => {
                        const drugModel = getDrugModel(category)
                        const isSelected = drugModel?.model && drugModel.model !== 'none'
                        
                        return (
                          <div key={category} className="space-y-2 rounded-lg border border-border bg-background p-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {drugCategoryLabels[category]}
                              </Label>
                            </div>
                            
                            <Select
                              value={getDrugModelValue(category)}
                              onValueChange={(value) => handleDrugModelChange(category, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Seleccionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Ninguno --</SelectItem>
                                {drugModelsByCategory[category].map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Campo libre para medicación personalizada en Misceláneos */}
                            {category === 'miscelaneos' && drugModel?.model === 'Otro' && (
                              <Input
                                placeholder="Escribir medicación..."
                                value={drugModel?.customName || ''}
                                onChange={(e) =>
                                  handleDrugInfusionChange(category, 'customName', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            )}

                            {/* Campos según submétodo (solo si hay modelo seleccionado) */}
                            {isSelected && info.tivaConfig?.subMethod === 'bolo' && (
                              <div className="mt-2 space-y-2 rounded border border-dashed border-primary/30 bg-primary/5 p-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Dosis Bolo</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={drugModel?.bolusDose || ''}
                                      onChange={(e) => handleDrugInfusionChange(category, 'bolusDose', parseFloat(e.target.value) || 0)}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Unidad</Label>
                                    <Select
                                      value={drugModel?.bolusDoseUnit || 'mg'}
                                      onValueChange={(value) => handleDrugInfusionChange(category, 'bolusDoseUnit', value)}
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {bolusDoseUnits.map((unit) => (
                                          <SelectItem key={unit} value={unit}>
                                            {unit}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Dosis Total Infundida — misceláneos y bloqueadores */}
                            {isSelected && (category === 'miscelaneos' || category === 'bloqueadores') && (
                              <div className="mt-2 rounded border border-dashed border-amber-400/40 bg-amber-50/40 dark:bg-amber-900/10 p-2">
                                <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                                  Dosis Total Infundida
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Cantidad</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={drugModel?.totalDose || ''}
                                      onChange={(e) =>
                                        handleDrugInfusionChange(category, 'totalDose', parseFloat(e.target.value) || 0)
                                      }
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Unidad</Label>
                                    <Select
                                      value={drugModel?.totalDoseUnit || 'mg'}
                                      onValueChange={(value) =>
                                        handleDrugInfusionChange(category, 'totalDoseUnit', value)
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {totalDoseUnits.map((unit) => (
                                          <SelectItem key={unit} value={unit}>
                                            {unit}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {isSelected && info.tivaConfig?.subMethod !== 'bolo' && (
                              <div className="mt-2 space-y-2">
                                {category === 'analgesicos' ? (
                                  <>
                                    {/* Dosis de Inducción */}
                                    <div className="rounded border border-dashed border-blue-400/50 bg-blue-50/40 dark:bg-blue-900/10 p-2">
                                      <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                                        Dosis de Inducción
                                      </Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">Concentración</Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={drugModel?.inductionDose || ''}
                                            onChange={(e) => handleDrugInfusionChange(category, 'inductionDose', parseFloat(e.target.value) || 0)}
                                            className="h-7 text-xs"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">Unidad</Label>
                                          <Select
                                            value={drugModel?.inductionDoseUnit || 'ng/ml'}
                                            onValueChange={(value) => handleDrugInfusionChange(category, 'inductionDoseUnit', value)}
                                          >
                                            <SelectTrigger className="h-7 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {tciDoseUnits.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Dosis de Mantenimiento — lista múltiple */}
                                    <div className="rounded border border-dashed border-green-400/50 bg-green-50/40 dark:bg-green-900/10 p-2 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                          Dosis de Mantenimiento
                                        </Label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddMaintenanceDose(category)}
                                          className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900/40 transition-colors"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Agregar dosis
                                        </button>
                                      </div>

                                      {/* Lista de dosis */}
                                      {(drugModel?.maintenanceDoses || []).length === 0 && (
                                        <p className="text-[10px] text-muted-foreground italic">
                                          Sin dosis de mantenimiento registradas. Haga clic en "Agregar dosis".
                                        </p>
                                      )}
                                      {(drugModel?.maintenanceDoses || []).map((md, idx) => (
                                        <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-1.5 items-end">
                                          <div className="space-y-0.5">
                                            {idx === 0 && <Label className="text-[10px] text-muted-foreground">Concentración</Label>}
                                            <Input
                                              type="number"
                                              step="0.01"
                                              placeholder="0.00"
                                              value={md.dose || ''}
                                              onChange={(e) => handleUpdateMaintenanceDose(category, idx, 'dose', parseFloat(e.target.value) || 0)}
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            {idx === 0 && <Label className="text-[10px] text-muted-foreground">Unidad</Label>}
                                            <Select
                                              value={md.doseUnit || 'ng/ml'}
                                              onValueChange={(v) => handleUpdateMaintenanceDose(category, idx, 'doseUnit', v)}
                                            >
                                              <SelectTrigger className="h-7 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {tciDoseUnits.map((unit) => (
                                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-0.5">
                                            {idx === 0 && <Label className="text-[10px] text-muted-foreground">Hora</Label>}
                                            <Input
                                              type="time"
                                              value={md.time || ''}
                                              onChange={(e) => handleUpdateMaintenanceDose(category, idx, 'time', e.target.value)}
                                              className="h-7 text-xs w-24"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveMaintenanceDose(category, idx)}
                                            className={`flex items-center justify-center h-7 w-7 rounded text-destructive hover:bg-destructive/10 transition-colors ${idx === 0 ? 'mt-4' : ''}`}
                                          >
                                            <XIcon className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="rounded border border-dashed border-primary/30 bg-primary/5 p-2 space-y-2">
                                    {/* Ritmo de Infusión inicial */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Ritmo de Infusión</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={drugModel?.infusionRate || ''}
                                          onChange={(e) => handleDrugInfusionChange(category, 'infusionRate', parseFloat(e.target.value) || 0)}
                                          className="h-7 text-xs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Unidad</Label>
                                        <Select
                                          value={drugModel?.infusionRateUnit || 'mcg/kg/min'}
                                          onValueChange={(value) => handleDrugInfusionChange(category, 'infusionRateUnit', value)}
                                        >
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {infusionRateUnits.map((unit) => (
                                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    {/* Ajustes de mantenimiento (solo hipnoticos) */}
                                    {category === 'hipnoticos' && (
                                      <div className="rounded border border-dashed border-violet-400/50 bg-violet-50/40 dark:bg-violet-900/10 p-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-xs font-medium text-muted-foreground">
                                            Dosis de Mantenimiento
                                          </Label>
                                          <button
                                            type="button"
                                            onClick={() => handleAddMaintenanceDose(category, drugModel?.infusionRateUnit || 'mcg/kg/min')}
                                            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 dark:text-violet-300 dark:bg-violet-900/40 transition-colors"
                                          >
                                            <Plus className="h-3 w-3" />
                                            Agregar dosis
                                          </button>
                                        </div>

                                        {(drugModel?.maintenanceDoses || []).length === 0 && (
                                          <p className="text-[10px] text-muted-foreground italic">
                                            Sin ajustes registrados. Haga clic en "Agregar dosis".
                                          </p>
                                        )}
                                        {(drugModel?.maintenanceDoses || []).map((md, idx) => (
                                          <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-1.5 items-end">
                                            <div className="space-y-0.5">
                                              {idx === 0 && <Label className="text-[10px] text-muted-foreground">Ritmo</Label>}
                                              <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={md.dose || ''}
                                                onChange={(e) => handleUpdateMaintenanceDose(category, idx, 'dose', parseFloat(e.target.value) || 0)}
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                            <div className="space-y-0.5">
                                              {idx === 0 && <Label className="text-[10px] text-muted-foreground">Unidad</Label>}
                                              <Select
                                                value={md.doseUnit || 'mcg/kg/min'}
                                                onValueChange={(v) => handleUpdateMaintenanceDose(category, idx, 'doseUnit', v)}
                                              >
                                                <SelectTrigger className="h-7 text-xs">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {infusionRateUnits.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-0.5">
                                              {idx === 0 && <Label className="text-[10px] text-muted-foreground">Hora</Label>}
                                              <Input
                                                type="time"
                                                value={md.time || ''}
                                                onChange={(e) => handleUpdateMaintenanceDose(category, idx, 'time', e.target.value)}
                                                className="h-7 text-xs w-24"
                                              />
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveMaintenanceDose(category, idx)}
                                              className={`flex items-center justify-center h-7 w-7 rounded text-destructive hover:bg-destructive/10 transition-colors ${idx === 0 ? 'mt-4' : ''}`}
                                            >
                                              <XIcon className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Hora Inicio (+ Hora Mantenimiento solo para no-analgesicos) */}
                                <div className={`grid ${(category === 'analgesicos' || category === 'hipnoticos') ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                                  <div className="space-y-1">
                                    <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      Hora Inicio
                                    </Label>
                                    <Input
                                      type="time"
                                      value={drugModel?.startTime || ''}
                                      onChange={(e) => handleDrugInfusionChange(category, 'startTime', e.target.value)}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  {category !== 'analgesicos' && category !== 'hipnoticos' && (
                                    <div className="space-y-1">
                                      <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Hora Mantenimiento
                                      </Label>
                                      <Input
                                        type="time"
                                        value={drugModel?.maintenanceTime || ''}
                                        onChange={(e) => handleDrugInfusionChange(category, 'maintenanceTime', e.target.value)}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Opciones para Anestesia Regional */}
        {isCategorySelected('regional') && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <RadioGroup
                value={info.regionalType || 'neuroaxial'}
                onValueChange={(value) => handleRegionalTypeChange(value as RegionalType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="troncular" id="regional-troncular" />
                  <Label htmlFor="regional-troncular" className="cursor-pointer text-sm">
                    Troncular (Bloqueo de Plexo)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neuroaxial" id="regional-neuroaxial" />
                  <Label htmlFor="regional-neuroaxial" className="cursor-pointer text-sm">
                    Neuroaxial
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Descripción del Bloqueo de Plexo */}
            {info.regionalType === 'troncular' && (
              <div className="space-y-2">
                <Label htmlFor="block-description" className="text-sm font-medium">
                  Descripción del Bloqueo
                </Label>
                <Input
                  id="block-description"
                  placeholder="Ej: Bloqueo interescalénico, Bloqueo axilar..."
                  value={info.blockDescription || ''}
                  onChange={(e) => handleBlockDescriptionChange(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}

            {/* Opciones para Neuroaxial */}
            {info.regionalType === 'neuroaxial' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Técnica</Label>
                <RadioGroup
                  value={info.neuroaxialType || 'peridural'}
                  onValueChange={(value) => handleNeuroaxialTypeChange(value as NeuroaxialType)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="peridural" id="neuroaxial-peridural" />
                    <Label htmlFor="neuroaxial-peridural" className="cursor-pointer text-sm">
                      Peridural
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subaracnoideo" id="neuroaxial-subaracnoideo" />
                    <Label htmlFor="neuroaxial-subaracnoideo" className="cursor-pointer text-sm">
                      Subaracnoideo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cateter_peridural" id="neuroaxial-cateter" />
                    <Label htmlFor="neuroaxial-cateter" className="cursor-pointer text-sm">
                      Catéter Peridural
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Campos de infusión para Catéter Peridural */}
            {info.neuroaxialType === 'cateter_peridural' && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Label className="text-sm font-medium">Tasa de Infusión</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Velocidad</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={info.catheterInfusion?.infusionRate || ''}
                      onChange={(e) => handleCatheterInfusionChange('infusionRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Unidad</Label>
                    <Select
                      value={info.catheterInfusion?.infusionRateUnit || 'ml/h'}
                      onValueChange={(value) => handleCatheterInfusionChange('infusionRateUnit', value as CatheterInfusionRateUnit)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catheterInfusionRateUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bolos de Rescate */}
                <div className="mt-3 space-y-2 rounded-lg border border-border bg-background p-3">
                  <Label className="text-xs font-medium text-muted-foreground">Bolos de Rescate</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Dosis</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={info.catheterInfusion?.rescueBolusAmount || ''}
                        onChange={(e) => handleCatheterInfusionChange('rescueBolusAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unidad</Label>
                      <Select
                        value={info.catheterInfusion?.rescueBolusUnit || 'ml'}
                        onValueChange={(value) => handleCatheterInfusionChange('rescueBolusUnit', value as RescueBolusUnit)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rescueBolusUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anestésico Local */}
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label className="text-sm font-medium">Anestésico Local</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fármaco</Label>
                  <Select
                    value={info.localAnesthetic?.drug || 'none'}
                    onValueChange={(value) => handleLocalAnestheticChange('drug', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Ninguno --</SelectItem>
                      {localAnesthetics.map((drug) => (
                        <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Concentración</Label>
                  <Select
                    value={info.localAnesthetic?.concentration || 'none'}
                    onValueChange={(value) => handleLocalAnestheticChange('concentration', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Ninguna --</SelectItem>
                      {localAnestheticConcentrations.map((conc) => (
                        <SelectItem key={conc} value={conc}>{conc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dosis (mg)</Label>
                  <Input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={info.localAnesthetic?.doseInMg || ''}
                    onChange={(e) => handleLocalAnestheticChange('doseInMg', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Volumen (ml)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={info.localAnesthetic?.volumeInMl || ''}
                    onChange={(e) => handleLocalAnestheticChange('volumeInMl', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Adyuvantes / Coadyuvantes */}
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Analgésicos / Coadyuvantes</Label>
                <button
                  type="button"
                  onClick={handleAddAdjuvant}
                  className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  + Agregar
                </button>
              </div>
              
              {(info.adjuvants || []).map((adjuvant, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Adyuvante {index + 1}</Label>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdjuvant(index)}
                      className="rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Fármaco</Label>
                      <Select
                        value={adjuvant.drug || 'none'}
                        onValueChange={(value) => handleAdjuvantChange(index, 'drug', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Ninguno --</SelectItem>
                          {regionalAdjuvants.map((drug) => (
                            <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Dosis</Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        value={adjuvant.dose || ''}
                        onChange={(e) => handleAdjuvantChange(index, 'dose', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unidad</Label>
                      <Select
                        value={adjuvant.doseUnit || 'ug'}
                        onValueChange={(value) => handleAdjuvantChange(index, 'doseUnit', value as AdjuvantDoseUnit)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {adjuvantDoseUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!info.adjuvants || info.adjuvants.length === 0) && (
                <p className="text-xs text-muted-foreground italic">No hay adyuvantes agregados</p>
              )}
            </div>
          </div>
        )}

        {/* Opciones para Sedación */}
        {isCategorySelected('sedacion') && (
          <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Label className="text-sm font-medium">Sedación Endovenosa</Label>
            
            {/* Fármaco de Inducción */}
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <Label className="text-xs font-medium text-muted-foreground">Inducción</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fármaco</Label>
                  <Select
                    value={info.sedationConfig?.inductionDrug?.drug || 'none'}
                    onValueChange={(value) => handleSedationDrugChange('inductionDrug', 'drug', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Ninguno --</SelectItem>
                      {sedationDrugs.map((drug) => (
                        <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dosis</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={info.sedationConfig?.inductionDrug?.dose || ''}
                    onChange={(e) => handleSedationDrugChange('inductionDrug', 'dose', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Unidad</Label>
                  <Select
                    value={info.sedationConfig?.inductionDrug?.doseUnit || 'mg'}
                    onValueChange={(value) => handleSedationDrugChange('inductionDrug', 'doseUnit', value as SedationDoseUnit)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sedationDoseUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fármaco de Mantenimiento */}
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <Label className="text-xs font-medium text-muted-foreground">Mantenimiento</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fármaco</Label>
                  <Select
                    value={info.sedationConfig?.maintenanceDrug?.drug || 'none'}
                    onValueChange={(value) => handleSedationDrugChange('maintenanceDrug', 'drug', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Ninguno --</SelectItem>
                      {sedationDrugs.map((drug) => (
                        <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dosis</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={info.sedationConfig?.maintenanceDrug?.dose || ''}
                    onChange={(e) => handleSedationDrugChange('maintenanceDrug', 'dose', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Unidad</Label>
                  <Select
                    value={info.sedationConfig?.maintenanceDrug?.doseUnit || 'mg'}
                    onValueChange={(value) => handleSedationDrugChange('maintenanceDrug', 'doseUnit', value as SedationDoseUnit)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sedationDoseUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen detallado */}
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">Resumen</p>

          {/* ── GENERAL ── */}
          {isCategorySelected('general') && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <Wind className="h-3 w-3" /> General
                <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 font-medium capitalize">
                  {info.generalType || 'Endovenosa'}
                </span>
                {info.endovenousMethod && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium">
                    {info.endovenousMethod === 'TIVA'
                      ? `TIVA — ${info.tivaConfig?.subMethod || 'TCI'}`
                      : info.endovenousMethod}
                  </span>
                )}
              </p>

              {/* TIVA TCI — modelos */}
              {info.endovenousMethod === 'TIVA' && info.tivaConfig?.drugModels && info.tivaConfig.drugModels.length > 0 && (
                <div className="space-y-1">
                  {info.tivaConfig.drugModels.map((dm) => (
                    <div key={dm.category} className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">{drugCategoryLabels[dm.category]}:</span>
                      <span>{dm.model}</span>
                      {dm.inductionDose && (
                        <span className="text-blue-600">· Ind {dm.inductionDose} {dm.inductionDoseUnit || 'ng/ml'}</span>
                      )}
                      {(dm.maintenanceDoses && dm.maintenanceDoses.length > 0)
                        ? dm.maintenanceDoses.map((md, i) => (
                          <span key={i} className="text-blue-600">
                            · Mant{md.time ? ` ${md.time}` : ''} {md.dose} {md.doseUnit}
                          </span>
                        ))
                        : dm.maintenanceDose
                          ? <span className="text-blue-600">· Mant {dm.maintenanceDose} {dm.maintenanceDoseUnit || 'ng/ml'}</span>
                          : null
                      }
                      {dm.infusionRate && (
                        <span className="text-blue-600">· {dm.infusionRate} {dm.infusionRateUnit || 'mcg/kg/min'}</span>
                      )}
                      {dm.category === 'hipnoticos' && dm.maintenanceDoses && dm.maintenanceDoses.length > 0 && (
                        dm.maintenanceDoses.map((md, i) => (
                          <span key={i} className="text-blue-600">
                            · Mant{md.time ? ` ${md.time}` : ''} {md.dose} {md.doseUnit}
                          </span>
                        ))
                      )}
                      {dm.bolusDose && (
                        <span className="text-blue-600">· Bolo {dm.bolusDose} {dm.bolusDoseUnit || 'ug'}</span>
                      )}
                      {dm.startTime && <span className="text-blue-500">· Inicio {dm.startTime}</span>}
                      {dm.maintenanceTime && <span className="text-blue-500">· Mant {dm.maintenanceTime}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Manual */}
              {info.endovenousMethod === 'manual' && (
                <div className="space-y-1">
                  {info.manualConfig?.analgesico?.drug && (
                    <div className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">Analgésico:</span>
                      <span>{info.manualConfig.analgesico.drug}</span>
                      {info.manualConfig.analgesico.bolusDose && (
                        <span className="text-blue-600">· Bolo {info.manualConfig.analgesico.bolusDose} {info.manualConfig.analgesico.bolusDoseUnit || 'mg'}</span>
                      )}
                      {info.manualConfig.analgesico.maintenanceRate && (
                        <span className="text-blue-600">· Mant {info.manualConfig.analgesico.maintenanceRate} {info.manualConfig.analgesico.maintenanceRateUnit || 'mg'}</span>
                      )}
                    </div>
                  )}
                  {info.manualConfig?.hipnotico?.drug && (
                    <div className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">Hipnótico:</span>
                      <span>{info.manualConfig.hipnotico.drug}</span>
                      {info.manualConfig.hipnotico.bolusDose && (
                        <span className="text-blue-600">· Bolo {info.manualConfig.hipnotico.bolusDose} {info.manualConfig.hipnotico.bolusDoseUnit || 'mg'}</span>
                      )}
                      {info.manualConfig.hipnotico.maintenanceRate && (
                        <span className="text-blue-600">· Mant {info.manualConfig.hipnotico.maintenanceRate} {info.manualConfig.hipnotico.maintenanceRateUnit || 'mg'}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Gases inhalatorios */}
              {info.inhalatoryConfig && (
                <div className="space-y-1">
                  {info.inhalatoryConfig.inductionGas && (
                    <div className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">Gas inducc.:</span>
                      <span>{info.inhalatoryConfig.inductionGas}</span>
                      {info.inhalatoryConfig.inductionCAM && <span className="text-blue-600">· {info.inhalatoryConfig.inductionCAM} CAM%</span>}
                    </div>
                  )}
                  {info.inhalatoryConfig.maintenanceGas && (
                    <div className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">Gas mant.:</span>
                      <span>{info.inhalatoryConfig.maintenanceGas}</span>
                      {info.inhalatoryConfig.maintenanceCAM && <span className="text-blue-600">· {info.inhalatoryConfig.maintenanceCAM} CAM%</span>}
                    </div>
                  )}
                  {(info.inhalatoryConfig.o2Flow || info.inhalatoryConfig.airFlow || info.inhalatoryConfig.n2oFlow) && (
                    <div className="text-xs text-blue-800 flex flex-wrap gap-x-2">
                      <span className="font-medium">Flujos:</span>
                      {info.inhalatoryConfig.o2Flow && <span>O₂ {info.inhalatoryConfig.o2Flow} L/min</span>}
                      {info.inhalatoryConfig.airFlow && <span>· Aire {info.inhalatoryConfig.airFlow} L/min</span>}
                      {info.inhalatoryConfig.n2oFlow && <span>· N₂O {info.inhalatoryConfig.n2oFlow} L/min</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── REGIONAL ── */}
          {isCategorySelected('regional') && (
            <div className="rounded-md border border-green-200 bg-green-50 p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                <Syringe className="h-3 w-3" /> Regional
                {info.regionalType && (
                  <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 font-medium capitalize">
                    {info.regionalType === 'neuroaxial' ? 'Neuroaxial' : 'Troncular / Periférico'}
                  </span>
                )}
                {info.neuroaxialType && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium capitalize">
                    {({ peridural: 'Peridural', subaracnoideo: 'Subaracnoideo', cateter_peridural: 'Catéter Peridural' } as Record<string,string>)[info.neuroaxialType] || info.neuroaxialType}
                  </span>
                )}
                {info.blockDescription && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium">{info.blockDescription}</span>
                )}
              </p>

              {info.localAnesthetic?.drug && (
                <div className="text-xs text-green-800 flex flex-wrap gap-x-2">
                  <span className="font-medium">Anestésico local:</span>
                  <span>{info.localAnesthetic.drug}</span>
                  {info.localAnesthetic.concentration && <span className="text-green-600">· {info.localAnesthetic.concentration}</span>}
                  {info.localAnesthetic.doseInMg && <span className="text-green-600">· {info.localAnesthetic.doseInMg} mg</span>}
                  {info.localAnesthetic.volumeInMl && <span className="text-green-600">· {info.localAnesthetic.volumeInMl} mL</span>}
                </div>
              )}

              {info.adjuvants && info.adjuvants.filter(a => a.drug).length > 0 && (
                <div className="text-xs text-green-800 flex flex-wrap gap-x-2">
                  <span className="font-medium">Adyuvantes:</span>
                  {info.adjuvants.filter(a => a.drug).map((adj, i) => (
                    <span key={i}>
                      {i > 0 && '· '}{adj.drug}{adj.dose ? ` ${adj.dose} ${adj.doseUnit || 'ug'}` : ''}
                    </span>
                  ))}
                </div>
              )}

              {info.neuroaxialType === 'cateter_peridural' && (info.catheterInfusion?.infusionRate || info.catheterInfusion?.rescueBolusAmount) && (
                <div className="space-y-0.5">
                  {info.catheterInfusion?.infusionRate && (
                    <div className="text-xs text-green-800 flex gap-x-2">
                      <span className="font-medium">Infusión catéter:</span>
                      <span>{info.catheterInfusion.infusionRate} {info.catheterInfusion.infusionRateUnit || 'ml/h'}</span>
                    </div>
                  )}
                  {info.catheterInfusion?.rescueBolusAmount && (
                    <div className="text-xs text-green-800 flex gap-x-2">
                      <span className="font-medium">Bolo rescate:</span>
                      <span>{info.catheterInfusion.rescueBolusAmount} {info.catheterInfusion.rescueBolusUnit || 'ml'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SEDACIÓN ── */}
          {isCategorySelected('sedacion') && (
            <div className="rounded-md border border-violet-200 bg-violet-50 p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-violet-700 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Sedación
              </p>
              {info.sedationConfig?.inductionDrug?.drug && (
                <div className="text-xs text-violet-800 flex flex-wrap gap-x-2">
                  <span className="font-medium">Inducción:</span>
                  <span>{info.sedationConfig.inductionDrug.drug}</span>
                  {info.sedationConfig.inductionDrug.dose && (
                    <span className="text-violet-600">· {info.sedationConfig.inductionDrug.dose} {info.sedationConfig.inductionDrug.doseUnit || 'mg'}</span>
                  )}
                </div>
              )}
              {info.sedationConfig?.maintenanceDrug?.drug && (
                <div className="text-xs text-violet-800 flex flex-wrap gap-x-2">
                  <span className="font-medium">Mantenimiento:</span>
                  <span>{info.sedationConfig.maintenanceDrug.drug}</span>
                  {info.sedationConfig.maintenanceDrug.dose && (
                    <span className="text-violet-600">· {info.sedationConfig.maintenanceDrug.dose} {info.sedationConfig.maintenanceDrug.doseUnit || 'mg'}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getAnesthesiaTypeSummary(info: AnesthesiaTypeInfo): string {
  const categories = info.categories || [info.category]
  const summaries: string[] = []

  // Resumen de General
  if (categories.includes('general')) {
    if (info.generalType === 'inhalatoria') {
      summaries.push('General Inhalatoria')
    } else if (info.generalType === 'endovenosa') {
      if (info.endovenousMethod === 'manual') {
        const drugs: string[] = []
        if (info.manualConfig?.analgesico?.drug) {
          drugs.push(info.manualConfig.analgesico.drug)
        }
        if (info.manualConfig?.hipnotico?.drug) {
          drugs.push(info.manualConfig.hipnotico.drug)
        }
        const drugsSummary = drugs.length > 0 ? ` (${drugs.join(', ')})` : ''
        summaries.push(`General Endovenosa - Manual${drugsSummary}`)
      } else if (info.endovenousMethod === 'TIVA') {
        const subMethod = info.tivaConfig?.subMethod || 'TCI'
        const models = info.tivaConfig?.drugModels || []
        const modelSummary = models.length > 0 
          ? ` (${models.map(m => m.model.split(' ')[0]).join(', ')})`
          : ''
        summaries.push(`General TIVA - ${subMethod}${modelSummary}`)
      } else {
        summaries.push('General Endovenosa')
      }
    } else {
      summaries.push('General')
    }
  }

  // Resumen de Regional
  if (categories.includes('regional')) {
    const localAnestheticSummary = info.localAnesthetic?.drug 
      ? ` - ${info.localAnesthetic.drug}${info.localAnesthetic.concentration ? ` ${info.localAnesthetic.concentration}` : ''}`
      : ''
    if (info.regionalType === 'troncular') {
      summaries.push(`Regional - Bloqueo${info.blockDescription ? `: ${info.blockDescription}` : ''}${localAnestheticSummary}`)
    } else if (info.regionalType === 'neuroaxial') {
      const techniqueMap: Record<string, string> = {
        'peridural': 'Peridural',
        'subaracnoideo': 'Subaracnoideo',
        'cateter_peridural': 'Catéter Peridural'
      }
      const technique = techniqueMap[info.neuroaxialType || 'peridural'] || 'Peridural'
      summaries.push(`Regional Neuroaxial - ${technique}${localAnestheticSummary}`)
    } else {
      summaries.push('Regional')
    }
  }

  // Resumen de Sedación
  if (categories.includes('sedacion')) {
    const drugs: string[] = []
    if (info.sedationConfig?.inductionDrug?.drug) {
      drugs.push(info.sedationConfig.inductionDrug.drug)
    }
    if (info.sedationConfig?.maintenanceDrug?.drug && info.sedationConfig.maintenanceDrug.drug !== info.sedationConfig?.inductionDrug?.drug) {
      drugs.push(info.sedationConfig.maintenanceDrug.drug)
    }
    const drugsSummary = drugs.length > 0 ? ` (${drugs.join(', ')})` : ''
    summaries.push(`Sedación${drugsSummary}`)
  }

  if (summaries.length === 0) {
    return 'No especificado'
  }

  return summaries.join(' + ')
}
