import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestsApi } from '@/core/api/requests.api'
import type { MedRequest } from '@/core/api/types'
import { toast } from 'sonner'
import { Button } from '@/core/components/Button'
import { Card } from '@/core/components/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AttachmentsSection } from '@/features/requests/components/AttachmentsSection'

interface RequestContextPanelProps {
  patientId: string
  requestId: string
  /** Copies the ficha's récipe into the history; returns how many medications were added. */
  onPasteRecipe: (recipeText: string) => number
  /** Paste once as soon as the request loads (arriving from the ficha's shortcut). */
  autoPasteRecipe?: boolean
  onAutoPasted?: () => void
}

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; request: MedRequest }

/**
 * Files belong to a request, so they are added here only when the history was
 * opened from one. The request must be this patient's; otherwise nothing could
 * be attached to the wrong case.
 */
export function RequestContextPanel({ patientId, requestId, onPasteRecipe, autoPasteRecipe, onAutoPasted }: RequestContextPanelProps) {
  const { user } = useAuth()
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const autoDone = useRef(false)

  useEffect(() => {
    setLoad({ status: 'loading' })
    requestsApi.getById(requestId)
      .then((request) => setLoad(request.patient.id === patientId ? { status: 'ready', request } : { status: 'error' }))
      .catch(() => setLoad({ status: 'error' }))
  }, [requestId, patientId])

  const recipeText = load.status === 'ready' ? load.request.serviceRecord?.recipeText?.trim() ?? '' : ''

  const pasteRecipe = () => {
    const added = onPasteRecipe(recipeText)
    if (added > 0) toast.success(`${added === 1 ? 'Se agregó 1 medicamento' : `Se agregaron ${added} medicamentos`} a «Medicación actual»`)
    else toast.message('El récipe ya estaba en la medicación actual')
  }

  useEffect(() => {
    if (!autoPasteRecipe || autoDone.current || load.status !== 'ready') return
    autoDone.current = true
    if (recipeText) pasteRecipe()
    onAutoPasted?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPasteRecipe, load.status])

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
      <div className="mb-4 rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Récipe de la ficha</p>
          <Button type="button" size="sm" variant="secondary" onClick={pasteRecipe} disabled={!recipeText}>
            Pasar a la historia médica
          </Button>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">
          {recipeText || 'La ficha de esta solicitud aún no tiene récipe.'}
        </p>
      </div>
      <AttachmentsSection requestId={request.id} canUpload={canUpload} />
      {!canUpload && (
        <p className="mt-2 text-[11px] text-zinc-400">Solo el administrador o el médico asignado pueden adjuntar archivos.</p>
      )}
    </Card>
  )
}
