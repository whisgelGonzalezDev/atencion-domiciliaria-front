import { useEffect, useRef, useState } from 'react'
import { Check, Eraser, PenLine } from 'lucide-react'

interface SignaturePadProps {
  label: string
  signedAt: string | null
  dataUrl: string | null
  onSign: (dataUrl: string, signedAt: string) => void
  onClear: () => void
}

export function SignaturePad({ label, signedAt, dataUrl, onSign, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasStrokeRef = useRef(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#18181b'
    hasStrokeRef.current = false
  }, [open])

  const posFromEvent = (canvas: HTMLCanvasElement, e: React.PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawingRef.current = true
    const ctx = canvas.getContext('2d')
    const { x, y } = posFromEvent(canvas, e)
    ctx?.beginPath()
    ctx?.moveTo(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = posFromEvent(canvas, e)
    ctx?.lineTo(x, y)
    ctx?.stroke()
    hasStrokeRef.current = true
  }

  const handlePointerUp = () => { drawingRef.current = false }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasStrokeRef.current = false
  }

  const confirmSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasStrokeRef.current) return
    onSign(canvas.toDataURL('image/png'), new Date().toISOString())
    setOpen(false)
  }

  if (signedAt) {
    return (
      <div className="rounded-lg border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check size={14} />
            {label} firmada
          </div>
          <button
            type="button"
            onClick={() => { onClear(); setOpen(false) }}
            className="text-xs font-medium text-zinc-500 hover:underline"
          >
            Rehacer
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-1">
          {new Date(signedAt).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        {dataUrl && <img src={dataUrl} alt={`Firma ${label}`} className="mt-2 h-16 object-contain" />}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
      >
        <PenLine size={14} />
        {label}
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 space-y-2">
      <canvas
        ref={canvasRef}
        width={300}
        height={120}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded bg-zinc-50 dark:bg-zinc-800"
      />
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={clearCanvas} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:underline">
          <Eraser size={12} /> Limpiar
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:underline">Cancelar</button>
          <button
            type="button"
            onClick={confirmSignature}
            className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Check size={12} /> Confirmar firma
          </button>
        </div>
      </div>
    </div>
  )
}
