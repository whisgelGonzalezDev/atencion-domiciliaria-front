import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplet, Phone, Calendar, History, Save } from 'lucide-react'
import { patientsApi } from '@/core/api/patients.api'
import { requestsApi } from '@/core/api/requests.api'
import { visitsApi } from '@/core/api/visits.api'
import type { Patient, MedRequest, Visit } from '@/core/api/types'
import { Card } from '@/core/components'
import { StateBadge } from '@/components/ui/StateBadge'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function inputCls() {
  return 'w-full rounded border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 transition-shadow'
}

export function PatientDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [requests, setRequests] = useState<MedRequest[]>([])
  const [visits, setVisits] = useState<Visit[]>([])

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [blood, setBlood] = useState('')
  const [historyShort, setHistoryShort] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    patientsApi.getById(id)
      .then(data => {
        setPatient(data)
        setName(data.name); setAge(String(data.age)); setPhone(data.phone)
        setBlood(data.bloodType ?? ''); setHistoryShort(data.historyShort ?? '')
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    requestsApi.getAll({ patientId: id, limit: 10 }).then(res => setRequests(res.data)).catch(() => setRequests([]))
    visitsApi.getAgenda({ patientId: id }).then(setVisits).catch(() => setVisits([]))
  }, [id])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || saving) return
    setSaving(true)
    try {
      const updated = await patientsApi.update(id, {
        name: name.trim(),
        age: Number(age),
        phone: phone.trim(),
        bloodType: blood || undefined,
        historyShort: historyShort.trim() || undefined,
      })
      setPatient(updated)
      setEditing(false)
      toast.success('Paciente actualizado')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el paciente'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
      </div>
    )
  }

  if (notFound || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-zinc-500 dark:text-zinc-400">Paciente no encontrado</p>
        <button onClick={() => navigate('/patients')} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Volver al listado
        </button>
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size={44} />
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{patient.name}</h1>
            <p className="text-xs text-zinc-400">{patient.age} años · {patient.phone}</p>
          </div>
        </div>
      </div>

      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Información del paciente</p>
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls()} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Edad</label>
                <input value={age} onChange={e => setAge(e.target.value)} type="number" min="0" max="120" className={inputCls()} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Teléfono</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls()} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Tipo sanguíneo</label>
                <select value={blood} onChange={e => setBlood(e.target.value)} className={inputCls()}>
                  <option value="">Seleccionar...</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Historial breve</label>
              <textarea value={historyShort} onChange={e => setHistoryShort(e.target.value)} rows={2} className={[inputCls(), 'resize-none'].join(' ')} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setEditing(false)} className="h-8 px-3 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button
                type="submit" disabled={saving}
                className="h-8 px-3 rounded text-xs font-medium text-white flex items-center gap-1.5 disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {saving ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={12} />}
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-[10px] text-zinc-400">Edad</p><p className="font-medium text-zinc-900 dark:text-white">{patient.age} años</p></div>
            <div><p className="text-[10px] text-zinc-400 flex items-center gap-1"><Phone size={9} /> Teléfono</p><p className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{patient.phone}</p></div>
            <div><p className="text-[10px] text-zinc-400 flex items-center gap-1"><Droplet size={9} /> Tipo sanguíneo</p><p className="font-medium text-zinc-900 dark:text-white">{patient.bloodType ?? '—'}</p></div>
            <div><p className="text-[10px] text-zinc-400 flex items-center gap-1"><Calendar size={9} /> Registrado</p><p className="text-xs text-zinc-700 dark:text-zinc-300">{new Date(patient.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
            {patient.historyShort && (
              <div className="col-span-2 sm:col-span-4 pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 mb-1">Historial breve</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{patient.historyShort}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card padding="md">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
          <History size={12} /> Solicitudes médicas ({requests.length})
        </p>
        {requests.length > 0 ? (
          <div className="space-y-1.5">
            {requests.map(r => (
              <button
                key={r.id}
                onClick={() => navigate(`/requests/${r.id}`)}
                className="w-full flex items-center justify-between gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{r.symptoms}</p>
                  <p className="text-[10px] text-zinc-400">{new Date(r.callTime).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <StateBadge state={r.state} size="sm" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">Sin solicitudes registradas.</p>
        )}
      </Card>

      <Card padding="md">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
          <Calendar size={12} /> Visitas programadas ({visits.length})
        </p>
        {visits.length > 0 ? (
          <div className="space-y-1.5">
            {visits.map(v => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    {new Date(v.scheduledAt).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-zinc-400">{v.zoneName}{v.doctorName ? ` · ${v.doctorName}` : ''}</p>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 capitalize">{v.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">Sin visitas programadas.</p>
        )}
      </Card>
    </div>
  )
}
