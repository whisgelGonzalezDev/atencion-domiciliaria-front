import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, FileText, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { filesApi, type Attachment } from '@/core/api/files.api'
import { AttachmentThumbnail } from '@/core/components/AttachmentThumbnail'
import { subscribeQueue, subscribeSynced, type QueuedAction } from '@/core/offline/queue'
import { OfflineQueuedError } from '@/core/utils/apiClient'

const ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf'

const uploadEndpoint = (requestId: string) => `/requests/${requestId}/attachments`

function PendingFileThumbnail({ action }: { action: QueuedAction }) {
  const blob = action.file!.blob
  const previewUrl = useMemo(() => (blob.type.startsWith('image/') ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  return (
    <div
      title={`${action.file!.name} — pendiente de subir`}
      className="relative h-16 w-16 overflow-hidden rounded border border-amber-300 dark:border-amber-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center"
    >
      {previewUrl
        ? <img src={previewUrl} alt={action.file!.name} className="h-full w-full object-cover opacity-70" />
        : <FileText size={20} className="text-zinc-400" />}
      <span className="absolute bottom-0.5 right-0.5 rounded-full bg-amber-500 p-0.5 text-white">
        <Clock size={10} />
      </span>
    </div>
  )
}

interface AttachmentsSectionProps {
  requestId: string
  canUpload: boolean
}

export function AttachmentsSection({ requestId, canUpload }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [queued, setQueued] = useState<QueuedAction[]>([])

  const load = useCallback(() => {
    filesApi.listForRequest(requestId)
      .then(setAttachments)
      .catch(() => setAttachments([]))
      .finally(() => setLoading(false))
  }, [requestId])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => subscribeQueue(({ actions }) =>
    setQueued(actions.filter((a) => a.file && a.endpoint === uploadEndpoint(requestId)))), [requestId])

  // A photo taken offline just reached the server: show it as a real attachment.
  useEffect(() => subscribeSynced((a) => {
    if (a.file && a.endpoint === uploadEndpoint(requestId)) load()
  }), [requestId, load])

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const attachment = await filesApi.uploadForRequest(requestId, file)
      setAttachments((prev) => [attachment, ...prev])
      toast.success('Archivo adjuntado')
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        toast.info('Sin conexión: el archivo se subirá solo al recuperarla')
        return
      }
      const msg = err instanceof Error ? err.message : 'Error al subir el archivo'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Adjuntos {attachments.length > 0 && `(${attachments.length})`}
        </p>
        {canUpload && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            {uploading
              ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
              : <Paperclip size={12} />}
            Adjuntar archivo
          </button>
        )}
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFileChosen} className="hidden" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        </div>
      ) : attachments.length > 0 || queued.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {queued.map((a) => <PendingFileThumbnail key={a.id} action={a} />)}
          {attachments.map((a) => (
            <AttachmentThumbnail key={a.id} attachment={a} className="h-16 w-16" />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-400 italic">Sin adjuntos aún.</p>
      )}
    </div>
  )
}
