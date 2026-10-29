import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestsApi } from '@/core/api/requests.api'
import type { MedRequest } from '@/core/api/types'
import { Card } from '@/core/components/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AttachmentsSection } from '@/features/requests/components/AttachmentsSection'

interface RequestContextPanelProps {
  patientId: string
  requestId: string
}

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; request: MedRequest }

/**
 * Files belong to a request, so they are added here only when the history was
 * opened from one. The request must be this patient's; otherwise nothing could
 * be attached to the wrong case.
 */
export function RequestContextPanel({ patientId, requestId }: RequestContextPanelProps) {
  const { user } = useAuth()
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    setLoad({ status: 'loading' })
    requestsApi.getById(requestId)
      .then((request) => setLoad(request.patient.id === patientId ? { status: 'ready', request } : { status: 'error' }))
      .catch(() => setLoad({ status: 'error' }))
  }, [requestId, patientId])

  if (load.status === 'loading') return null

  if (load.status === 'error') {
    return (
      <Card padding="md">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          La solicitud indicada no existe o no pertenece a este paciente, así que no se pueden adjuntar archivos desde aquí.
        </p>
      </Card>
    )
  }

  const { request } = load
  const canUpload = user?.role === 'admin' || (user?.role === 'doctor' && request.doctor?.id === user.doctorId)

  return (
    <Card padding="md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
          Atención de la solicitud <span className="font-mono text-xs text-zinc-500">#{request.id.slice(0, 8)}</span>
        </p>
        <Link to={`/requests/${request.id}`} className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline">
          Ver solicitud
        </Link>
      </div>
      <AttachmentsSection requestId={request.id} canUpload={canUpload} />
      {!canUpload && (
        <p className="mt-2 text-[11px] text-zinc-400">Solo el administrador o el médico asignado pueden adjuntar archivos.</p>
      )}
    </Card>
  )
}
