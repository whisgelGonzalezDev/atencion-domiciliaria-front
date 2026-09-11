import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { usersApi } from '@/core/api/users.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { UserAccount, Doctor } from '@/core/api/types'
import { toast } from 'sonner'

interface UserModalProps {
  open: boolean
  user: UserAccount | null
  existingUsers: UserAccount[]
  onClose: () => void
  onSaved: (user: UserAccount) => void
}

const ROLES: { value: UserAccount['role']; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'operativo', label: 'Operativo' },
  { value: 'doctor', label: 'Doctor' },
]

interface FormErrors {
  name?: string
  email?: string
  password?: string
  doctorId?: string
}

export function UserModal({ open, user, existingUsers, onClose, onSaved }: UserModalProps) {
  const isEdit = !!user
  const takenDoctorIds = new Set(
    existingUsers.filter(u => u.role === 'doctor' && u.doctorId && u.id !== user?.id).map(u => u.doctorId),
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserAccount['role']>('operativo')
  const [doctorId, setDoctorId] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setPassword('')
    setRole(user?.role ?? 'operativo')
    setDoctorId(user?.doctorId ?? '')
    setErrors({})
    doctorsApi.getAll().then(setDoctors).catch(() => setDoctors([]))
  }, [open, user])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'El nombre es requerido'
    if (!email.trim()) e.email = 'El correo es requerido'
    if (!isEdit && password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (isEdit && password && password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (role === 'doctor' && !doctorId) e.doctorId = 'Selecciona el médico vinculado'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const saved = isEdit
        ? await usersApi.update(user!.id, {
            name: name.trim(),
            email: email.trim(),
            role,
            doctorId: role === 'doctor' ? doctorId : undefined,
            ...(password ? { password } : {}),
          })
        : await usersApi.create({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            doctorId: role === 'doctor' ? doctorId : undefined,
          })
      toast.success(isEdit ? `${saved.name} actualizado` : `${saved.name} agregado`)
      onSaved(saved)
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el usuario'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setLoading(false)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{isEdit ? 'Editar usuario' : 'Añadir usuario'}</h2>
          <button onClick={handleClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre completo *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre Apellido" className={inputCls(!!errors.name)} />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Correo electrónico *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@atencion.med" className={inputCls(!!errors.email)} />
            {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={isEdit ? 'Dejar en blanco para no cambiarla' : '••••••••'}
              className={inputCls(!!errors.password)}
            />
            {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Rol *</label>
              <select value={role} onChange={e => setRole(e.target.value as UserAccount['role'])} className={inputCls(false)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {role === 'doctor' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Médico vinculado *</label>
                <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className={inputCls(!!errors.doctorId)}>
                  <option value="">Seleccionar...</option>
                  {doctors.filter(d => !takenDoctorIds.has(d.id)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <p className="text-[10px] text-zinc-400">Los médicos que ya tienen una cuenta vinculada no aparecen en la lista.</p>
                {errors.doctorId && <p className="text-[10px] text-red-500">{errors.doctorId}</p>}
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
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Añadir usuario'}
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
