import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, ChevronRight,
  PhoneCall, User, Map, Stethoscope, Check, Star, MessageCircle, Ban, History,
} from 'lucide-react'
import { requestsApi } from '@/core/api/requests.api'
import type { MedRequest } from '@/core/api/types'
import { StateBadge } from '@/components/ui/StateBadge'
import { PriorityPill } from '@/components/ui/PriorityPill'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/core/components/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AssignDoctorModal } from './components/AssignDoctorModal'
import { type StateId } from '@/data/medData'
import { toast } from 'sonner'

const STATE_ORDER: StateId[] = ['pending', 'enroute', 'attending', 'done']

const TIMELINE_STEPS = [
  { label: 'Solicitud recibida',  icon: PhoneCall },
  { label: 'Médico asignado',     icon: User },
  { label: 'Médico en camino',    icon: Map },
  { label: 'En domicilio',        icon: Stethoscope },
  { label: 'Atención completada', icon: Check },
]

function stateToStep(state: string): number {
  const idx = STATE_ORDER.indexOf(state as StateId)
  return idx >= 0 ? idx : 0
}

function VitalCard({ label, value, unit, abnormal }: { label: string; value: string | number; unit: string; abnormal?: boolean }) {
  return (
    <div className={['rounded-lg border p-3 text-center', abnormal ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30' : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50'].join(' ')}>
      <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={['text-lg font-bold mt-1', abnormal ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-900 dark:text-white'].join(' ')}>{value}</p>
      <p className="text-[10px] text-zinc-400">{unit}</p>
    </div>
  )
}

export function RequestDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [req, setReq] = useState<MedRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [sendingNote, setSendingNote] = useState(false)
  const [advancingState, setAdvancingState] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [history, setHistory] = useState<MedRequest[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    requestsApi.getById(id)
      .then(data => {
        setReq(data)
        setStep(stateToStep(data.state))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!req) return
    setHistoryLoading(true)
    requestsApi.getAll({ patientId: req.patient.id, limit: 10 })
      .then(res => setHistory(res.data.filter(r => r.id !== req.id)))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [req?.patient.id, req?.id])

  const handleAdvanceState = async () => {
    if (!id || advancingState || step >= 4) return
    setAdvancingState(true)
    try {
      const updated = await requestsApi.advanceState(id)
      setReq(updated)
      setStep(stateToStep(updated.state))
      toast.success('Estado actualizado')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al avanzar estado'
      toast.error(msg)
    } finally {
      setAdvancingState(false)
    }
  }

  const handleSendNote = async () => {
    if (!id || !noteText.trim() || sendingNote) return
    setSendingNote(true)
    try {
      const updated = await requestsApi.addNote(id, noteText.trim(), user?.name ?? 'Coordinador')
      setReq(updated)
      setNoteText('')
      toast.success('Nota agregada')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la nota'
      toast.error(msg)
    } finally {
      setSendingNote(false)
    }
  }

  const handleAssigned = (updated: MedRequest) => {
    setReq(updated)
    setAssignOpen(false)
    toast.success('Médico asignado correctamente')
  }

  const handleCancel = async () => {
    if (!id || cancelling) return
    if (!window.confirm('¿Cancelar esta solicitud? Esta acción no se puede deshacer.')) return
    setCancelling(true)
    try {
      const updated = await requestsApi.cancel(id)
      setReq(updated)
      toast.success('Solicitud cancelada')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar la solicitud'
      toast.error(msg)
    } finally {
      setCancelling(false)
    }
  }

  const handleNotifyWhatsApp = async () => {
    if (!id || sendingWhatsApp) return
    setSendingWhatsApp(true)
    // Abrimos la pestaña de forma síncrona (dentro del gesto del click) y
    // navegamos después de resolver el enlace; si se hace tras el await,
    // los navegadores bloquean el popup por no considerarlo user-initiated.
    const tab = window.open('', '_blank', 'noopener,noreferrer')
    try {
      const link = await requestsApi.getWhatsAppLink(id)
      if (tab) tab.location.href = link.url
      else window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      tab?.close()
      const msg = err instanceof Error ? err.message : 'Error al generar el enlace de WhatsApp'
      toast.error(msg)
    } finally {
      setSendingWhatsApp(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
      </div>
    )
  }

  if (notFound || !req) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-zinc-500 dark:text-zinc-400">Solicitud no encontrada</p>
        <button onClick={() => navigate('/requests')} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          Volver al listado
        </button>
      </div>
    )
  }

  const currentStep = stateToStep(req.state)
  const isCancelled = req.state === 'cancelled'
  const isTerminal = req.state === 'done' || isCancelled
  const v = req.vitals
  const abnormalBP   = v ? parseInt(v.bp) >= 140 : false
  const abnormalHR   = v ? v.hr >= 100 : false
  const abnormalTemp = v ? parseFloat(v.temp) >= 38 : false
  const abnormalSpo2 = v ? v.spo2 < 95 : false

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/requests')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Volver al listado
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{req.patient.name}</h1>
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{req.id}</span>
            <StateBadge state={isCancelled ? 'cancelled' : STATE_ORDER[Math.min(currentStep, 3)] as StateId} />
            <PriorityPill priority={req.priority} withIcon />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-zinc-400">hace {req.minutesAgo}m · {req.zone.name}</p>
            <button
              disabled={sendingWhatsApp}
              onClick={handleNotifyWhatsApp}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 disabled:opacity-40 transition-opacity"
            >
              {sendingWhatsApp
                ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                : <MessageCircle size={13} />}
              WhatsApp
            </button>
            {isAdmin && !isTerminal && (
              <button
                disabled={cancelling}
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 disabled:opacity-40 transition-colors"
              >
                {cancelling
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                  : <Ban size={13} />}
                Cancelar
              </button>
            )}
            {isAdmin && !isTerminal && (
              <button
                disabled={currentStep >= 3 || advancingState}
                onClick={handleAdvanceState}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {advancingState
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <ChevronRight size={13} />}
                Avanzar estado
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Patient info */}
          <Card padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3">Información del Paciente</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><p className="text-[10px] text-zinc-400">Nombre</p><p className="font-medium text-zinc-900 dark:text-white">{req.patient.name}</p></div>
              <div><p className="text-[10px] text-zinc-400">Edad</p><p className="font-medium text-zinc-900 dark:text-white">{req.patient.age} años</p></div>
              <div><p className="text-[10px] text-zinc-400">Teléfono</p><p className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{req.patient.phone}</p></div>
              <div className="col-span-2"><p className="text-[10px] text-zinc-400">Dirección</p><p className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1"><MapPin size={11} className="text-zinc-400" />{req.address}</p></div>
              <div><p className="text-[10px] text-zinc-400">Zona</p><p className="text-zinc-700 dark:text-zinc-300">{req.zone.name}</p></div>
            </div>
            {req.patient.historyShort && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 mb-1">Historial breve</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{req.patient.historyShort}</p>
              </div>
            )}
            {!historyLoading && history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 mb-2 flex items-center gap-1">
                  <History size={11} /> Otras visitas de {req.patient.name} ({history.length})
                </p>
                <div className="space-y-1.5">
                  {history.map(h => (
                    <button
                      key={h.id}
                      onClick={() => navigate(`/requests/${h.id}`)}
                      className="w-full flex items-center justify-between gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{h.symptoms}</p>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(h.callTime).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <StateBadge state={h.state} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Request details + vitals */}
          <Card padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3">Detalles de la Solicitud</p>
            <div>
              <p className="text-[10px] text-zinc-400 mb-1">Síntomas</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{req.symptoms}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-400">Hora de llamada</p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Clock size={11} className="text-zinc-400" />
                  {new Date(req.callTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Tiempo transcurrido</p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{req.minutesAgo} minutos</p>
              </div>
            </div>
            {v && (
              <div className="mt-4">
                <p className="text-[10px] text-zinc-400 mb-2">Signos vitales iniciales</p>
                <div className="grid grid-cols-4 gap-2">
                  <VitalCard label="Presión arterial" value={v.bp} unit="mmHg" abnormal={abnormalBP} />
                  <VitalCard label="Frec. cardíaca" value={v.hr} unit="lpm" abnormal={abnormalHR} />
                  <VitalCard label="Temperatura" value={v.temp} unit="°C" abnormal={abnormalTemp} />
                  <VitalCard label="Saturación O₂" value={`${v.spo2}%`} unit="SpO₂" abnormal={abnormalSpo2} />
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3">Notas Internas</p>
            {req.notes.length > 0 ? (
              <div className="space-y-2 mb-3">
                {req.notes.map(note => (
                  <div key={note.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm">
                    <p className="text-[10px] text-zinc-400 mb-1">{note.authorName} · {new Date(note.createdAt).toLocaleString('es', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm mb-3">
                <p className="text-zinc-400 italic text-xs">Sin notas aún.</p>
              </div>
            )}
            {isAdmin && (
              <div className="flex gap-2">
                <textarea
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Añadir nota..."
                  rows={2}
                  className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200 resize-none"
                />
                <button
                  disabled={!noteText.trim() || sendingNote}
                  onClick={handleSendNote}
                  className="self-end h-9 px-4 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {sendingNote && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  Enviar nota
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-4">Línea de Tiempo</p>
            <ol className="relative space-y-0">
              {TIMELINE_STEPS.map((ts, i) => {
                const done = i < currentStep
                const active = i === currentStep
                const Icon = ts.icon
                return (
                  <li key={i} className="flex items-start gap-3 pb-5 last:pb-0 relative">
                    {i < TIMELINE_STEPS.length - 1 && (
                      <span
                        className="absolute left-3 top-6 bottom-0 w-[2px]"
                        style={{ backgroundColor: done ? 'var(--accent)' : '#e4e4e7' }}
                      />
                    )}
                    <div className="relative z-10 shrink-0">
                      {active ? (
                        <div className="relative flex h-6 w-6 items-center justify-center">
                          <div className="absolute inset-0 rounded-full opacity-30 animate-pulse-ring" style={{ backgroundColor: 'var(--accent)' }} />
                          <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }} />
                        </div>
                      ) : done ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent)' }}>
                          <Icon size={11} className="text-white" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                          <Icon size={11} className="text-zinc-300 dark:text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className={['text-sm font-medium', done || active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'].join(' ')}>
                        {ts.label}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
            {isAdmin && !isTerminal && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  disabled={currentStep >= 3 || advancingState}
                  onClick={handleAdvanceState}
                  className="w-full h-8 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-1"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {advancingState
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <ChevronRight size={12} />}
                  Avanzar estado
                </button>
              </div>
            )}
          </Card>

          {/* Assigned doctor */}
          <Card padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-3">Médico Asignado</p>
            {req.doctor ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={req.doctor.name} size={44} status={req.doctor.status} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{req.doctor.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{req.doctor.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{req.doctor.casesToday}</p>
                    <p className="text-[10px] text-zinc-400">Casos hoy</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-0.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />{req.doctor.rating}
                    </p>
                    <p className="text-[10px] text-zinc-400">Rating</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">~15m</p>
                    <p className="text-[10px] text-zinc-400">ETA</p>
                  </div>
                </div>
                {isAdmin && !isTerminal && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssignOpen(true)}
                      className="flex-1 h-8 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Reasignar
                    </button>
                  </div>
                )}
              </div>
            ) : isAdmin && !isTerminal ? (
              <button
                onClick={() => setAssignOpen(true)}
                className="w-full h-14 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-center gap-1.5"
              >
                + Asignar médico
              </button>
            ) : (
              <p className="text-sm text-zinc-400 italic">Sin médico asignado</p>
            )}
          </Card>
        </div>
      </div>

      <AssignDoctorModal
        open={assignOpen}
        requestId={req.id}
        onClose={() => setAssignOpen(false)}
        onAssigned={handleAssigned}
      />
    </div>
  )
}
