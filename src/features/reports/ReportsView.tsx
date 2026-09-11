import { useEffect, useState } from 'react'
import { Download, FileText, Receipt, CalendarClock, ScrollText } from 'lucide-react'
import { reportsApi } from '@/core/api/reports.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Doctor } from '@/core/api/types'
import { Card } from '@/core/components/Card'
import { STATES, PRIORITY, ZONES } from '@/data/medData'
import { toast } from 'sonner'

const VISIT_STATUSES = [
  { id: 'scheduled', label: 'Programada' },
  { id: 'confirmed', label: 'Confirmada' },
  { id: 'done', label: 'Completada' },
  { id: 'missed', label: 'No asistió' },
  { id: 'cancelled', label: 'Cancelada' },
]

const BILLING_STATUSES = [
  { id: 'pending', label: 'Pendiente' },
  { id: 'paid', label: 'Pagado' },
  { id: 'cancelled', label: 'Cancelado' },
]

const ENTITY_TYPES = [
  { id: 'request', label: 'Solicitudes' },
  { id: 'patient', label: 'Pacientes' },
  { id: 'visit', label: 'Visitas' },
  { id: 'billing', label: 'Facturación' },
  { id: 'zone', label: 'Zonas' },
]

function selectCls() {
  return 'h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900'
}

function DownloadButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white disabled:opacity-50 transition-opacity self-start"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Download size={13} />}
      Descargar CSV
    </button>
  )
}

function ReportCard({
  icon: Icon, title, description, children, loading, onDownload,
}: {
  icon: React.ElementType
  title: string
  description: string
  children?: React.ReactNode
  loading: boolean
  onDownload: () => void
}) {
  return (
    <Card padding="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--accent-soft)' }}>
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        {children}
        <DownloadButton loading={loading} onClick={onDownload} />
      </div>
    </Card>
  )
}

async function runDownload(fn: () => Promise<void>, setLoading: (v: boolean) => void) {
  setLoading(true)
  try {
    await fn()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo generar el reporte'
    toast.error(msg)
  } finally {
    setLoading(false)
  }
}

export function ReportsView() {
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => { doctorsApi.getAll().then(setDoctors).catch(() => {}) }, [])

  // Solicitudes
  const [reqState, setReqState] = useState('')
  const [reqPriority, setReqPriority] = useState('')
  const [reqZone, setReqZone] = useState('')
  const [reqLoading, setReqLoading] = useState(false)

  // Facturación
  const [billStatus, setBillStatus] = useState('')
  const [billLoading, setBillLoading] = useState(false)

  // Visitas
  const [visitFrom, setVisitFrom] = useState('')
  const [visitTo, setVisitTo] = useState('')
  const [visitStatus, setVisitStatus] = useState('')
  const [visitDoctorId, setVisitDoctorId] = useState('')
  const [visitLoading, setVisitLoading] = useState(false)

  // Auditoría
  const [entityType, setEntityType] = useState('')
  const [auditLoading, setAuditLoading] = useState(false)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Exporta los datos del sistema a CSV, con filtros opcionales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard
          icon={FileText}
          title="Solicitudes"
          description="Historial de solicitudes médicas, con estado, prioridad, paciente y médico asignado."
          loading={reqLoading}
          onDownload={() => runDownload(
            () => reportsApi.downloadRequests({ state: reqState || undefined, priority: reqPriority || undefined, zone: reqZone || undefined }),
            setReqLoading,
          )}
        >
          <select value={reqState} onChange={e => setReqState(e.target.value)} className={selectCls()}>
            <option value="">Todo estado</option>
            {STATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={reqPriority} onChange={e => setReqPriority(e.target.value)} className={selectCls()}>
            <option value="">Toda prioridad</option>
            {PRIORITY.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select value={reqZone} onChange={e => setReqZone(e.target.value)} className={selectCls()}>
            <option value="">Toda zona</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </ReportCard>

        <ReportCard
          icon={Receipt}
          title="Facturación"
          description="Cobros registrados: monto en USD/Bs, método de pago, referencia y estado."
          loading={billLoading}
          onDownload={() => runDownload(
            () => reportsApi.downloadBilling({ status: billStatus || undefined }),
            setBillLoading,
          )}
        >
          <select value={billStatus} onChange={e => setBillStatus(e.target.value)} className={selectCls()}>
            <option value="">Todo estado</option>
            {BILLING_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </ReportCard>

        <ReportCard
          icon={CalendarClock}
          title="Visitas"
          description="Agenda de visitas domiciliarias programadas, completadas o canceladas."
          loading={visitLoading}
          onDownload={() => runDownload(
            () => reportsApi.downloadVisits({
              from: visitFrom ? new Date(visitFrom).toISOString() : undefined,
              to: visitTo ? new Date(`${visitTo}T23:59:59`).toISOString() : undefined,
              status: visitStatus || undefined,
              doctorId: visitDoctorId || undefined,
            }),
            setVisitLoading,
          )}
        >
          <input type="date" value={visitFrom} onChange={e => setVisitFrom(e.target.value)} className={selectCls()} />
          <input type="date" value={visitTo} onChange={e => setVisitTo(e.target.value)} className={selectCls()} />
          <select value={visitStatus} onChange={e => setVisitStatus(e.target.value)} className={selectCls()}>
            <option value="">Todo estado</option>
            {VISIT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={visitDoctorId} onChange={e => setVisitDoctorId(e.target.value)} className={selectCls()}>
            <option value="">Todo médico</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </ReportCard>

        <ReportCard
          icon={ScrollText}
          title="Auditoría"
          description="Registro completo de quién hizo qué y cuándo en el sistema."
          loading={auditLoading}
          onDownload={() => runDownload(
            () => reportsApi.downloadAuditLogs({ entityType: entityType || undefined }),
            setAuditLoading,
          )}
        >
          <select value={entityType} onChange={e => setEntityType(e.target.value)} className={selectCls()}>
            <option value="">Toda entidad</option>
            {ENTITY_TYPES.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </ReportCard>
      </div>
    </div>
  )
}
