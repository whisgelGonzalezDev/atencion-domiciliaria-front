import { useEffect, useState, useCallback } from 'react'
import { UserPlus, Pencil, Trash2 } from 'lucide-react'
import { usersApi } from '@/core/api/users.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { UserAccount, Doctor } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserModal } from './components/UserModal'
import { toast } from 'sonner'

const ROLE_LABEL: Record<UserAccount['role'], string> = {
  admin: 'Administrador',
  operativo: 'Operativo',
  doctor: 'Doctor',
}

const ROLE_COLOR: Record<UserAccount['role'], string> = {
  admin: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400',
  operativo: 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400',
  doctor: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
}

export function UsersView() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserAccount | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([usersApi.getAll(), doctorsApi.getAll()])
      .then(([u, d]) => { setUsers(u); setDoctors(d) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const doctorName = (doctorId?: string) => doctors.find(d => d.id === doctorId)?.name ?? '—'

  const handleAdd = () => { setEditing(null); setModalOpen(true) }
  const handleEdit = (u: UserAccount) => { setEditing(u); setModalOpen(true) }

  const handleDelete = async (u: UserAccount) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.name}?`)) return
    try {
      await usersApi.delete(u.id)
      toast.success(`${u.name} eliminado`)
      setUsers(prev => prev.filter(x => x.id !== u.id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el usuario'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{users.length} cuentas con acceso al panel</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          <UserPlus size={13} /> Añadir usuario
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['Nombre', 'Correo', 'Rol', 'Médico vinculado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-900 dark:text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', ROLE_COLOR[u.role]].join(' ')}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    {u.role === 'doctor' ? doctorName(u.doctorId) : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(u)}
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={u.id === currentUser?.id}
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
                        aria-label="Eliminar"
                        title={u.id === currentUser?.id ? 'No puedes eliminar tu propia cuenta' : undefined}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Sin usuarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        open={modalOpen}
        user={editing}
        existingUsers={users}
        onClose={() => setModalOpen(false)}
        onSaved={saved => {
          setUsers(prev => {
            const exists = prev.some(u => u.id === saved.id)
            return exists ? prev.map(u => u.id === saved.id ? saved : u) : [saved, ...prev]
          })
        }}
      />
    </div>
  )
}
