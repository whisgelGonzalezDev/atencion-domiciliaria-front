import { Check, CloudOff, Loader2, TriangleAlert } from 'lucide-react'
import type { SaveStatus } from '../useMedicalHistoryDraft'

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null

  const config: Record<Exclude<SaveStatus, 'idle'>, { icon: React.ElementType; label: string; className: string }> = {
    saving: { icon: Loader2, label: 'Guardando...', className: 'text-zinc-400 dark:text-zinc-500' },
    saved: { icon: Check, label: 'Guardado', className: 'text-emerald-600 dark:text-emerald-400' },
    offline: { icon: CloudOff, label: 'Sin conexión · guardado en este dispositivo', className: 'text-amber-600 dark:text-amber-400' },
    error: { icon: TriangleAlert, label: 'No se pudo guardar', className: 'text-red-500' },
  }
  const { icon: Icon, label, className } = config[status]

  return (
    <span className={['inline-flex items-center gap-1.5 text-xs font-medium', className].join(' ')}>
      <Icon size={12} className={status === 'saving' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}
