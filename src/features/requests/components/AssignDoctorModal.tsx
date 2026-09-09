import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Star } from 'lucide-react'
import { doctorsApi } from '@/core/api/doctors.api'
import { requestsApi } from '@/core/api/requests.api'
import type { Doctor, MedRequest } from '@/core/api/types'
import { Avatar } from '@/components/ui/Avatar'
import { DoctorStatusDot } from '@/components/ui/DoctorStatusDot'

interface AssignDoctorModalProps {
  open: boolean
  requestId: string
  onClose: () => void
  onAssigned: (updated: MedRequest) => void
}

export function AssignDoctorModal({ open, requestId, onClose, onAssigned }: AssignDoctorModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    doctorsApi.getAll()
      .then(setDoctors)
      .finally(() => setLoading(false))
  }, [open])

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase()
    return !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
  })

  const handleAssign = async (doctor: Doctor) => {
    if (assigning) return
    setAssigning(doctor.id)
    try {
      const updated = await requestsApi.assignDoctor(requestId, doctor.id)
      onAssigned(updated)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al asignar médico'
      // re-throw so caller can show toast if desired
      throw new Error(msg)
    } finally {
      setAssigning(null)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Asignar médico</h2>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o especialidad..."
              className="w-full pl-8 pr-3 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              Sin resultados
            </div>
          ) : (
            filtered.map(doc => {
              const available = doc.status === 'available'
              return (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <Avatar name={doc.name} size={36} status={doc.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <DoctorStatusDot status={doc.status} />
                      <span className="text-[10px] text-zinc-400">{doc.specialty}</span>
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                        <Star size={9} className="text-amber-400 fill-amber-400" />{doc.rating}
                      </span>
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-400">{doc.casesToday} casos hoy</span>
                    </div>
                  </div>
                  <button
                    disabled={!available || assigning === doc.id}
                    onClick={() => handleAssign(doc)}
                    className="shrink-0 h-7 px-3 rounded text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5"
                    style={{ backgroundColor: available ? 'var(--accent)' : '#a1a1aa' }}
                  >
                    {assigning === doc.id
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : available ? 'Asignar' : 'No disponible'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
