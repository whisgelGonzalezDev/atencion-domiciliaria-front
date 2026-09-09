import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, XCircle, Ban, Repeat } from 'lucide-react'
import { visitsApi } from '@/core/api/visits.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Visit, Doctor } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

interface VisitActionsModalProps {
  open: boolean
  visit: Visit | null
  onClose: () => void
  onUpdated: (visit: Visit) => void
  onCancelledSeries: (seriesId: string) => void
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function VisitActionsModal({ open, visit, onClose, onUpdated, onCancelledSeries }: VisitActionsModalProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('60')
  const [doctorId, setDoctorId] = useState('')
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [savingDoctor, setSavingDoctor] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!open || !visit) return
    doctorsApi.getAll().then(setDoctors).catch(() => {})
    setScheduledAt(toLocalInputValue(visit.scheduledAt))
    setDuration(String(visit.durationMinutes))
    setDoctorId(visit.doctorId ?? '')
  }, [open, visit])

  if (!open || !visit) return null

  const isTerminal = visit.status === 'done' || visit.status === 'missed' || visit.status === 'cancelled'

  const handleReschedule = async () => {
    if (savingSchedule) return
    setSavingSchedule(true)
    try {
      const updated = await visitsApi.reschedule(visit.id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(duration) || 60,
      })
      onUpdated(updated)
      toast.success('Visita reprogramada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al reprogramar')
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleAssignDoctor = async () => {
    if (savingDoctor) return
    setSavingDoctor(true)
    try {
      const updated = await visitsApi.assignDoctor(visit.id, doctorId || undefined)
      onUpdated(updated)
      toast.success(doctorId ? 'Médico asignado' : 'Médico desasignado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar médico')
    } finally {
      setSavingDoctor(false)
    }
  }

  const handleStatus = async (status: 'confirmed' | 'done' | 'missed') => {
    if (changingStatus) return
    setChangingStatus(true)
    try {
      const updated = await visitsApi.updateStatus(visit.id, status)
      onUpdated(updated)
      toast.success('Estado actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar el estado')
    } finally {
      setChangingStatus(false)
    }
  }

  const handleCancel = async () => {
    if (cancelling || !window.confirm('¿Cancelar esta visita?')) return
    setCancelling(true)
    try {
      const updated = await visitsApi.cancel(visit.id)
      onUpdated(updated)
      toast.success('Visita cancelada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar la visita')
    } finally {
      setCancelling(false)
    }
  }

  const handleCancelSeries = async () => {
    if (!visit.seriesId || cancelling || !window.confirm('¿Cancelar todas las visitas futuras de esta serie recurrente?')) return
    setCancelling(true)
    try {
      await visitsApi.cancelSeries(visit.seriesId)
      onCancelledSeries(visit.seriesId)
      toast.success('Serie recurrente cancelada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar la serie')
    } finally {
      setCancelling(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Gestionar visita</h2>
            <p className="text-xs text-zinc-400">{visit.patientName}</p>
          </div>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {isTerminal ? (
            <p className="text-sm text-zinc-400 italic">
              Esta visita está en estado <span className="font-medium capitalize">{visit.status}</span> y no admite más cambios.
            </p>
          ) : !isAdmin ? (
            <p className="text-sm text-zinc-400 italic">Solo un administrador puede modificar esta visita.</p>
          ) : (
            <>
              {/* Reprogramar */}
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Reprogramar</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={inputCls()} />
                  <input type="number" min="15" max="480" value={duration} onChange={e => setDuration(e.target.value)} className={inputCls()} />
                </div>
                <button
                  onClick={handleReschedule} disabled={savingSchedule}
                  className="h-8 px-3 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  {savingSchedule ? 'Guardando...' : 'Guardar horario'}
                </button>
              </section>

              {/* Médico */}
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Médico asignado</p>
                <div className="flex gap-2">
                  <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className={[inputCls(), 'flex-1'].join(' ')}>
                    <option value="">Sin asignar</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button
                    onClick={handleAssignDoctor} disabled={savingDoctor}
                    className="h-8 px-3 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {savingDoctor ? '...' : 'Asignar'}
                  </button>
                </div>
              </section>

              {/* Estado */}
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {visit.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatus('confirmed')} disabled={changingStatus}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Check size={12} /> Confirmar
                    </button>
                  )}
                  {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => handleStatus('done')} disabled={changingStatus}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 disabled:opacity-40 transition-opacity"
                      >
                        <Check size={12} /> Completada
                      </button>
                      <button
                        onClick={() => handleStatus('missed')} disabled={changingStatus}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 disabled:opacity-40 transition-opacity"
                      >
                        <XCircle size={12} /> No asistió
                      </button>
                    </>
                  )}
                </div>
              </section>

              {/* Cancelar */}
              <section className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
                <button
                  onClick={handleCancel} disabled={cancelling}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 disabled:opacity-40 transition-colors"
                >
                  <Ban size={12} /> Cancelar visita
                </button>
                {visit.seriesId && (
                  <button
                    onClick={handleCancelSeries} disabled={cancelling}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 disabled:opacity-40 transition-colors"
                  >
                    <Repeat size={12} /> Cancelar serie
                  </button>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function inputCls() {
  return 'h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 px-2 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 transition-shadow'
}
