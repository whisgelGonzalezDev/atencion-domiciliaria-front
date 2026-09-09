import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle } from 'lucide-react'
import { requestsApi } from '@/core/api/requests.api'
import type { Doctor, MedRequest } from '@/core/api/types'
import { StateBadge } from '@/components/ui/StateBadge'
import { PriorityPill } from '@/components/ui/PriorityPill'
import { type StateId } from '@/data/medData'
import { toast } from 'sonner'

interface AssignRequestModalProps {
  open: boolean
  doctor: Doctor | null
  onClose: () => void
  onAssigned: () => void
}

export function AssignRequestModal({ open, doctor, onClose, onAssigned }: AssignRequestModalProps) {
  const [requests, setRequests] = useState<MedRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    requestsApi.getAll({ state: 'pending', limit: 20 })
      .then(r => setRequests(r.data))
      .finally(() => setLoading(false))
  }, [open])

  const handleAssign = async (req: MedRequest) => {
    if (!doctor || assigning) return
    setAssigning(req.id)
    try {
      await requestsApi.assignDoctor(req.id, doctor.id)
      toast.success(`Solicitud asignada a ${doctor.name}`)
      onAssigned()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al asignar'
      toast.error(msg)
    } finally {
      setAssigning(null)
    }
  }

  if (!open || !doctor) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Asignar solicitud</h2>
            <p className="text-xs text-zinc-400 mt-0.5">a {doctor.name}</p>
          </div>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No hay solicitudes pendientes sin médico
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <AlertTriangle
                  size={14}
                  className={['mt-0.5 shrink-0', req.priority === 'emergency' ? 'text-red-500' : 'text-amber-500'].join(' ')}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{req.patient.name}</p>
                    <PriorityPill priority={req.priority} withIcon={false} />
                    <StateBadge state={req.state as StateId} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{req.symptoms}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono text-[10px] text-zinc-400">{req.id}</span>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="text-[10px] text-zinc-400">{req.zone.name}</span>
                  </div>
                </div>
                <button
                  disabled={assigning === req.id}
                  onClick={() => handleAssign(req)}
                  className="shrink-0 h-7 px-3 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {assigning === req.id
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : 'Asignar'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
