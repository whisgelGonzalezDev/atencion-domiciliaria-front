import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Images, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { galleryApi } from '@/core/api/gallery.api'
import type { Attachment } from '@/core/api/files.api'
import { AttachmentThumbnail } from '@/core/components/AttachmentThumbnail'
import { Card, CardSkeleton } from '@/core/components/Card'

const TYPE_FILTERS = [
  { id: '', label: 'Todos los tipos' },
  { id: 'image/jpeg', label: 'JPEG' },
  { id: 'image/png', label: 'PNG' },
  { id: 'image/webp', label: 'WebP' },
  { id: 'application/pdf', label: 'PDF' },
]

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administradora',
  operativo: 'Operador/a',
  doctor: 'Médico',
}

const PAGE_SIZE = 24

function selectCls() {
  return 'h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900'
}

export function GaleriaView() {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [mimeType, setMimeType] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    galleryApi.getAll({ mimeType: mimeType || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        setAttachments(res.data)
        setTotal(res.total)
      })
      .catch(() => toast.error('No se pudo cargar la galería'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, mimeType])

  const handleDelete = async (attachment: Attachment) => {
    if (!window.confirm(`¿Eliminar "${attachment.originalName}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(attachment.id)
    try {
      await galleryApi.remove(attachment.id)
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
      setTotal((t) => t - 1)
      toast.success('Adjunto eliminado')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el adjunto'
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Images size={20} style={{ color: 'var(--accent)' }} />
            Galería
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Fotos y documentos adjuntos a solicitudes en todo el sistema
          </p>
        </div>
        <select
          value={mimeType}
          onChange={(e) => { setPage(1); setMimeType(e.target.value) }}
          className={selectCls()}
        >
          {TYPE_FILTERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : attachments.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center justify-center gap-2 text-center py-12">
          <Images size={28} className="text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Aún no hay archivos subidos.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {attachments.map((a) => (
            <Card key={a.id} padding="none" className="overflow-hidden flex flex-col">
              <AttachmentThumbnail attachment={a} className="h-32 w-full rounded-none border-0 border-b border-zinc-200 dark:border-zinc-800" />
              <div className="p-2.5 space-y-1.5">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate" title={a.originalName}>
                  {a.originalName}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {a.uploadedByEmail} · {ROLE_LABEL[a.uploadedByRole] ?? a.uploadedByRole}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {new Date(a.createdAt).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/requests/${a.requestId}`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    <ExternalLink size={10} /> Ver solicitud
                  </Link>
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                    aria-label="Eliminar adjunto"
                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                  >
                    {deletingId === a.id
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-8 px-3 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 px-3 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
