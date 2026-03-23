'use client'

import { useRef, useEffect, useState } from 'react'
import { PenTool, Trash2, Check, Upload, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type SignatureMode = 'draw' | 'upload'

interface SignaturePadProps {
  label: string
  onSignatureChange?: (signature: string | null) => void
}

export function SignaturePad({ label, onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [mode, setMode] = useState<SignatureMode>('draw')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSigned) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSigned) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      e.preventDefault()
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
    } else {
      setUploadedImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    setHasSignature(false)
    setIsSigned(false)
    onSignatureChange?.(null)
  }

  const confirmSignature = () => {
    if (!hasSignature) return

    if (mode === 'draw') {
      const canvas = canvasRef.current
      if (!canvas) return
      const signature = canvas.toDataURL('image/png')
      setIsSigned(true)
      onSignatureChange?.(signature)
    } else if (uploadedImage) {
      setIsSigned(true)
      onSignatureChange?.(uploadedImage)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setUploadedImage(result)
      setHasSignature(true)
    }
    reader.readAsDataURL(file)
  }

  const handleModeChange = (newMode: string) => {
    if (isSigned) return
    setMode(newMode as SignatureMode)
    // Limpiar al cambiar de modo
    if (newMode === 'draw') {
      setUploadedImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
    setHasSignature(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <PenTool className="h-4 w-4" />
            {label}
          </CardTitle>
          {isSigned && (
            <Badge className="bg-success text-success-foreground">
              <Check className="mr-1 h-3 w-3" />
              Firmado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="mb-3 grid w-full grid-cols-2">
            <TabsTrigger value="draw" disabled={isSigned} className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Dibujar
            </TabsTrigger>
            <TabsTrigger value="upload" disabled={isSigned} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Imagen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-0">
            <div className="space-y-3">
              <div
                className={`relative rounded-lg border-2 border-dashed ${
                  isSigned ? 'border-success bg-success/5' : 'border-border bg-muted/30'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  className={`w-full touch-none ${isSigned ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && !isSigned && (
                  <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Firme aquí
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isSigned}
              />
              
              {uploadedImage ? (
                <div
                  className={`relative flex h-[120px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed ${
                    isSigned ? 'border-success bg-success/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <img
                    src={uploadedImage}
                    alt="Firma subida"
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSigned}
                  className="flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Haga clic para seleccionar una imagen
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG o GIF
                  </span>
                </button>
              )}
            </div>
          </TabsContent>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
              className="flex-1"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={confirmSignature}
              disabled={!hasSignature || isSigned}
              className="flex-1"
            >
              <Check className="mr-1 h-4 w-4" />
              Confirmar
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
