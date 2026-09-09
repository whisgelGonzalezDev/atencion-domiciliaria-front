import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin } from 'lucide-react'
import { type PriorityId } from '@/data/medData'
import { requestsApi } from '@/core/api/requests.api'
import { zonesApi } from '@/core/api/zones.api'
import type { Zone } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

interface NewRequestModalProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

interface FormErrors {
  name?: string
  age?: string
  phone?: string
  address?: string
  zone?: string
  symptoms?: string
}

export function NewRequestModal({ open, onClose, onCreated }: NewRequestModalProps) {
  const { user } = useAuth()
  const [zones, setZones] = useState<Zone[]>([])

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [blood, setBlood] = useState('')
  const [address, setAddress] = useState('')
  const [zone, setZone] = useState('')
  const [refs, setRefs] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<PriorityId>('mid')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    zonesApi.getAll().then(setZones).catch(() => {})
  }, [])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'El nombre es requerido'
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 120) e.age = 'Edad inválida (0–120)'
    if (!phone.trim()) e.phone = 'El teléfono es requerido'
    if (!address.trim()) e.address = 'La dirección es requerida'
    if (!zone) e.zone = 'Selecciona una zona'
    if (symptoms.trim().length < 10) e.symptoms = 'Describe los síntomas (mínimo 10 caracteres)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await requestsApi.create({
        priority,
        patientName: name.trim(),
        patientAge: Number(age),
        patientPhone: phone.trim(),
        ...(blood ? { bloodType: blood } : {}),
        address: address.trim(),
        ...(refs.trim() ? { referencesText: refs.trim() } : {}),
        symptoms: symptoms.trim(),
        ...(notes.trim() ? { additionalNotes: notes.trim() } : {}),
        zoneId: zone,
      })
      toast.success('Solicitud creada · pendiente de asignación')
      onCreated?.()
      handleClose()
    } catch (err) {
      if (err instanceof Error) {
        // Backend may return JSON array of validation errors as the message
        try {
          const parsed = JSON.parse(err.message)
          if (Array.isArray(parsed)) {
            const msg = parsed.map((e: { field: string; errors: string[] }) => `${e.field}: ${e.errors[0]}`).join(' · ')
            toast.error(msg)
            return
          }
        } catch { /* not JSON, fall through */ }
        toast.error(err.message)
      } else {
        toast.error('Error al crear la solicitud')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName(''); setAge(''); setPhone(''); setBlood(''); setAddress('')
    setZone(''); setRefs(''); setSymptoms(''); setNotes('')
    setPriority('mid'); setErrors({}); setLoading(false)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nueva solicitud médica</h2>
          <button onClick={handleClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">

            {/* Section 1 — Datos del paciente */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>1</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Datos del paciente</p>
              </div>
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-4 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre completo *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" className={inputCls(!!errors.name)} />
                  {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Edad *</label>
                  <input value={age} onChange={e => setAge(e.target.value)} placeholder="Ej. 45" type="number" min="0" max="120" className={inputCls(!!errors.age)} />
                  {errors.age && <p className="text-[10px] text-red-500">{errors.age}</p>}
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Teléfono *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+57 300 000 0000" className={inputCls(!!errors.phone)} />
                  {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Tipo sanguíneo</label>
                  <select value={blood} onChange={e => setBlood(e.target.value)} className={inputCls(false)}>
                    <option value="">Seleccionar...</option>
                    {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2 — Ubicación */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>2</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Ubicación</p>
              </div>
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-4 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Dirección *</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle y número" className={[inputCls(!!errors.address), 'pl-8'].join(' ')} />
                  </div>
                  {errors.address && <p className="text-[10px] text-red-500">{errors.address}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Zona *</label>
                  <select value={zone} onChange={e => setZone(e.target.value)} className={inputCls(!!errors.zone)}>
                    <option value="">Seleccionar...</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                  {errors.zone && <p className="text-[10px] text-red-500">{errors.zone}</p>}
                </div>
                <div className="col-span-6 space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Referencias</label>
                  <textarea value={refs} onChange={e => setRefs(e.target.value)} placeholder="Edificio, apto, referencia adicional..." rows={2} className={[inputCls(false), 'resize-none'].join(' ')} />
                </div>
              </div>
            </section>

            {/* Section 3 — Motivo */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>3</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Motivo de la consulta</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Síntomas / Motivo *</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe los síntomas del paciente..." rows={3} className={[inputCls(!!errors.symptoms), 'resize-none'].join(' ')} />
                  {errors.symptoms && <p className="text-[10px] text-red-500">{errors.symptoms}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notas adicionales</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Información adicional relevante..." rows={2} className={[inputCls(false), 'resize-none'].join(' ')} />
                </div>
              </div>
            </section>

            {/* Section 4 — Prioridad */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>4</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Nivel de prioridad</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { id: 'low' as PriorityId, label: 'Baja', desc: 'Consulta general, no urgente', base: 'border-zinc-200 dark:border-zinc-700', active: 'border-zinc-500 bg-zinc-50 dark:bg-zinc-800' },
                  { id: 'mid' as PriorityId, label: 'Media', desc: 'Atención prioritaria en horas', base: 'border-zinc-200 dark:border-zinc-700', active: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40' },
                  { id: 'emergency' as PriorityId, label: 'Emergencia', desc: 'Atención inmediata', base: 'border-zinc-200 dark:border-zinc-700', active: 'border-red-400 bg-red-50 dark:bg-red-950/40' },
                ]).map(p => (
                  <button
                    type="button" key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={['rounded-lg border-2 px-4 py-3 text-left transition-colors', priority === p.id ? p.active : p.base].join(' ')}
                  >
                    <p className={['text-sm font-semibold', priority === p.id && p.id === 'emergency' ? 'text-red-700 dark:text-red-400' : priority === p.id && p.id === 'mid' ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-900 dark:text-white'].join(' ')}>{p.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 shrink-0 bg-white dark:bg-zinc-900">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">La solicitud quedará en estado <span className="font-medium text-zinc-600 dark:text-zinc-300">Pendiente</span> hasta asignar médico.</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleClose} className="h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button
                type="submit" disabled={loading}
                className="h-9 px-5 rounded text-xs font-medium text-white flex items-center gap-2 disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {loading ? 'Creando...' : 'Crear solicitud'}
              </button>
            </div>
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
