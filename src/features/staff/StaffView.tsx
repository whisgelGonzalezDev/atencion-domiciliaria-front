import { useEffect, useState } from 'react'
import { Search, UserPlus, Star } from 'lucide-react'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Doctor } from '@/core/api/types'
import { Avatar } from '@/components/ui/Avatar'
import { DoctorStatusDot } from '@/components/ui/DoctorStatusDot'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AddDoctorModal } from './components/AddDoctorModal'
import { AssignRequestModal } from './components/AssignRequestModal'

type StatusFilter = 'all' | 'available' | 'busy' | 'offshift'

function DoctorCard({ doc, canManage, onAssignRequest }: { doc: Doctor; canManage: boolean; onAssignRequest: (doc: Doctor) => void }) {
  const canAssign = doc.status === 'available'
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={doc.name} size={44} status={doc.status} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{doc.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{doc.specialty}</p>
        </div>
      </div>
      <DoctorStatusDot status={doc.status} />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{doc.casesToday}</p>
          <p className="text-[10px] text-zinc-400">Casos</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{doc.shift}</p>
          <p className="text-[10px] text-zinc-400">Turno</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-0.5">
            <Star size={10} className="text-amber-400 fill-amber-400" />{doc.rating}
          </p>
          <p className="text-[10px] text-zinc-400">Rating</p>
        </div>
      </div>
      {canManage && (
        <button
          disabled={!canAssign}
          onClick={() => canAssign && onAssignRequest(doc)}
          className="w-full h-8 rounded text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: canAssign ? 'var(--accent)' : undefined }}
          onMouseEnter={e => canAssign && (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
          onMouseLeave={e => canAssign && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          {canAssign ? 'Asignar solicitud manual' : 'No disponible'}
        </button>
      )}
    </div>
  )
}

export function StaffView() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [assignDoc, setAssignDoc] = useState<Doctor | null>(null)

  useEffect(() => {
    doctorsApi.getAll()
      .then(setDoctors)
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.specialty.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const available = doctors.filter(d => d.status === 'available').length
  const busy      = doctors.filter(d => d.status === 'busy').length
  const offshift  = doctors.filter(d => d.status === 'offshift').length

  const TABS: { id: StatusFilter; label: string; count: number; dot?: string }[] = [
    { id: 'all',       label: 'Todos',         count: doctors.length },
    { id: 'available', label: 'Disponibles',   count: available, dot: 'bg-emerald-500' },
    { id: 'busy',      label: 'En ruta',       count: busy,      dot: 'bg-sky-500' },
    { id: 'offshift',  label: 'Fuera de turno',count: offshift,  dot: 'bg-zinc-300 dark:bg-zinc-600' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Personal médico</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{doctors.length} médicos · {available} disponibles</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              <UserPlus size={13} /> Añadir médico
            </button>
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                filter === t.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700',
              ].join(' ')}
            >
              {t.dot && <span className={['h-2 w-2 rounded-full', t.dot].join(' ')} />}
              {t.label}
              <span className={['rounded-full px-1.5 py-0.5 text-[10px] font-semibold', filter === t.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'].join(' ')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar médico..."
            className="pl-8 pr-3 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => (
            <DoctorCard key={d.id} doc={d} canManage={isAdmin} onAssignRequest={setAssignDoc} />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-sm text-zinc-400">
          Sin resultados
        </div>
      )}

      <AddDoctorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={doctor => setDoctors(prev => [doctor, ...prev])}
      />

      <AssignRequestModal
        open={!!assignDoc}
        doctor={assignDoc}
        onClose={() => setAssignDoc(null)}
        onAssigned={() => setAssignDoc(null)}
      />
    </div>
  )
}
