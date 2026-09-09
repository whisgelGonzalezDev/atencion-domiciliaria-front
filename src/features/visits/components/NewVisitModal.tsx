import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Repeat } from 'lucide-react'
import { visitsApi, type RecurrenceInput } from '@/core/api/visits.api'
import { patientsApi } from '@/core/api/patients.api'
import { zonesApi } from '@/core/api/zones.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Patient, Zone, Doctor } from '@/core/api/types'
import { toast } from 'sonner'

interface NewVisitModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const RECURRENCE_OPTIONS: { id: RecurrenceInput['frequency']; label: string }[] = [
  { id: 'weekly',   label: 'Semanal' },
  { id: 'biweekly', label: 'Quincenal' },
  { id: 'monthly',  label: 'Mensual' },
]

interface FormErrors {
  patient?: string
  zone?: string
  scheduledAt?: string
  until?: string
}

export function NewVisitModal({ open, onClose, onCreated }: NewVisitModalProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)

  const [zone, setZone] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('60')
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurrenceInput['frequency']>('weekly')
  const [until, setUntil] = useState('')

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    zonesApi.getAll().then(setZones).catch(() => {})
    doctorsApi.getAll().then(setDoctors).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open || !patientSearch.trim()) { setPatientResults([]); return }
    const t = setTimeout(() => {
      patientsApi.getAll({ search: patientSearch, limit: 5 }).then(res => setPatientResults(res.data)).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [open, patientSearch])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!patient) e.patient = 'Selecciona un paciente'
    if (!zone) e.zone = 'Selecciona una zona'
    if (!scheduledAt) e.scheduledAt = 'Selecciona fecha y hora'
    if (recurring && !until) e.until = 'Selecciona la fecha límite'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !patient) return
    setLoading(true)
    try {
      const result = await visitsApi.create({
        patientId: patient.id,
        zoneId: zone,
        ...(doctorId ? { doctorId } : {}),
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(duration) || 60,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(recurring ? { recurrence: { frequency, until: new Date(until).toISOString() } } : {}),
      })
      toast.success(`${result.visits.length} visita${result.visits.length !== 1 ? 's' : ''} programada${result.visits.length !== 1 ? 's' : ''}`)
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => toast.warning(w))
      }
      onCreated()
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al programar la visita'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPatientSearch(''); setPatientResults([]); setPatient(null)
    setZone(''); setDoctorId(''); setScheduledAt(''); setDuration('60'); setNotes('')
    setRecurring(false); setFrequency('weekly'); setUntil('')
    setErrors({}); setLoading(false)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Programar visita</h2>
          <button onClick={handleClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Paciente */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Paciente *</label>
            {patient ? (
              <div className="flex items-center justify-between rounded border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                <span className="text-sm text-zinc-900 dark:text-white">{patient.name}</span>
                <button type="button" onClick={() => { setPatient(null); setPatientSearch('') }} className="text-xs text-zinc-400 hover:text-zinc-600">Cambiar</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Buscar paciente por nombre o teléfono..."
                    className={[inputCls(!!errors.patient), 'pl-8'].join(' ')}
                  />
                </div>
                {patientResults.length > 0 && (
                  <div className="mt-1 rounded border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {patientResults.map(p => (
                      <button
                        type="button" key={p.id}
                        onClick={() => { setPatient(p); setPatientResults([]) }}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-zinc-900 dark:text-white">{p.name}</span>
                        <span className="text-xs text-zinc-400">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {errors.patient && <p className="text-[10px] text-red-500">{errors.patient}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Zona *</label>
              <select value={zone} onChange={e => setZone(e.target.value)} className={inputCls(!!errors.zone)}>
                <option value="">Seleccionar...</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              {errors.zone && <p className="text-[10px] text-red-500">{errors.zone}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Médico</label>
              <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className={inputCls(false)}>
                <option value="">Sin asignar</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Fecha y hora *</label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={inputCls(!!errors.scheduledAt)} />
              {errors.scheduledAt && <p className="text-[10px] text-red-500">{errors.scheduledAt}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Duración (min)</label>
              <input type="number" min="15" max="480" value={duration} onChange={e => setDuration(e.target.value)} className={inputCls(false)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={[inputCls(false), 'resize-none'].join(' ')} />
          </div>

          {/* Recurrencia */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 space-y-3">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="rounded" />
              <Repeat size={12} /> Visita recurrente
            </label>
            {recurring && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Frecuencia</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value as RecurrenceInput['frequency'])} className={inputCls(false)}>
                    {RECURRENCE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Hasta *</label>
                  <input type="date" value={until} onChange={e => setUntil(e.target.value)} className={inputCls(!!errors.until)} />
                  {errors.until && <p className="text-[10px] text-red-500">{errors.until}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className="h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="h-9 px-5 rounded text-xs font-medium text-white flex items-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Programando...' : 'Programar visita'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded border px-3 py-2 text-sm',
    'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400',
    'focus:outline-none focus:ring-1 transition-shadow',
    hasError
      ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900'
      : 'border-zinc-200 dark:border-zinc-700 focus:ring-sky-200 dark:focus:ring-sky-900',
  ].join(' ')
}
