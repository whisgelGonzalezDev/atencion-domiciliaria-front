import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useOfflineQueue, triggerSync } from '@/core/offline/useOfflineQueue'
import { discardAction, retryAction, type QueuedAction } from '@/core/offline/queue'
import { overwriteConflict, serviceRecordIdOf } from '@/core/offline/conflicts'
import { clearDraft } from '@/features/requests/serviceRecordDraftStorage'
import { useAuth } from '@/features/auth/hooks/useAuth'

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function PendingActionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions, authExpired, isOnline } = useOfflineQueue()
  const { logout } = useAuth()
  const [syncing, setSyncing] = useState(false)

  const syncNow = async () => {
    setSyncing(true)
    try {
      await triggerSync()
    } finally {
      setSyncing(false)
    }
  }

  const retry = async (id: string) => {
    await retryAction(id)
    void syncNow()
  }

  const discard = async (a: QueuedAction) => {
    // The local draft would otherwise re-submit the discarded edit next time the ficha opens.
    const requestId = serviceRecordIdOf(a)
    if (requestId) clearDraft(requestId)
    await discardAction(a.id)
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>Cambios sin sincronizar</Modal.Header>
      <Modal.Body>
        {authExpired && (
          <p className="mb-3 rounded-md bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:text-red-400">
            Tu sesión venció. Los cambios siguen guardados en este dispositivo: inicia sesión de nuevo y se enviarán solos.
          </p>
        )}
        {actions.length === 0 ? (
          <p>No hay cambios pendientes.</p>
        ) : (
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.description}</p>
                    <p className="text-xs text-zinc-400">{formatTime(a.createdAt)}</p>
                    {a.status === 'failed' && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{a.conflict ? 'Otra persona modificó esto mientras estabas sin conexión' : `Rechazada: ${a.lastError}`}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {a.status === 'failed' && a.conflict && serviceRecordIdOf(a) && (
                      <Button size="sm" variant="secondary" onClick={() => void overwriteConflict(a)}>Usar mis cambios</Button>
                    )}
                    {a.status === 'failed' && !a.conflict && (
                      <Button size="sm" variant="secondary" onClick={() => void retry(a.id)}>Reintentar</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => void discard(a)}>Descartar</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        {authExpired ? (
          <Button onClick={logout}>Iniciar sesión de nuevo</Button>
        ) : (
          <Button onClick={() => void syncNow()} loading={syncing} disabled={!isOnline || actions.length === 0}>
            Sincronizar ahora
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
