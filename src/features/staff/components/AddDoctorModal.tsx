import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Doctor } from '@/core/api/types'
import { toast } from 'sonner'

interface AddDoctorModalProps {
  open: boolean
  onClose: () => void
  onCreated: (doctor: Doctor) => void
}

const SPECIALTIES = [
  'Medicina General', 'Cardiología', 'Pediatría', 'Medicina Interna',
  'Geriatría', 'Neumología', 'Endocrinología', 'Neurología',
  'Traumatología', 'Dermatología',
]

const SHIFTS = ['Diurno', 'Nocturno', 'Rotativo']

interface FormErrors {
  name?: string
  specialty?: string
  shift?: string
}

export function AddDoctorModal({ open, onClose, onCreated }: AddDoctorModalProps) {
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [shift, setShift] = useState('')
  const [status, setStatus] = useState<'available' | 'busy' | 'offshift'>('available')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'El nombre es requerido'
    if (!specialty) e.specialty = 'Selecciona una especialidad'
    if (!shift) e.shift = 'Selecciona un turno'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const doctor = await doctorsApi.create({
        name: name.trim(),
        specialty,
        shift,
        status,
      })
      toast.success(`Dr. ${doctor.name} agregado al equipo`)
      onCreated(doctor)
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear el médico'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName(''); setSpecialty(''); setShift(''); setStatus('available')
    setErrors({}); setLoading(false)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Añadir médico</h2>
          <button onClick={handleClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre completo *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Dr. Nombre Apellido"
              className={inputCls(!!errors.name)}
            />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
          </div>

          {/* Especialidad */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Especialidad *</label>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className={inputCls(!!errors.specialty)}>
              <option value="">Seleccionar...</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialty && <p className="text-[10px] text-red-500">{errors.specialty}</p>}
          </div>

          {/* Turno + Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Turno *</label>
              <select value={shift} onChange={e => setShift(e.target.value)} className={inputCls(!!errors.shift)}>
                <option value="">Seleccionar...</option>
                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.shift && <p className="text-[10px] text-red-500">{errors.shift}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Estado inicial</label>
              <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className={inputCls(false)}>
                <option value="available">Disponible</option>
                <option value="busy">En ruta</option>
                <option value="offshift">Fuera de turno</option>
              </select>
            </div>
          </div>

          {/* Footer */}
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
              {loading ? 'Guardando...' : 'Agregar médico'}
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
