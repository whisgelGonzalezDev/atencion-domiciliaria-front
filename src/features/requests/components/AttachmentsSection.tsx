import { useEffect, useRef, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { filesApi, type Attachment } from '@/core/api/files.api'
import { AttachmentThumbnail } from '@/core/components/AttachmentThumbnail'

const ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf'

interface AttachmentsSectionProps {
  requestId: string
  canUpload: boolean
}

export function AttachmentsSection({ requestId, canUpload }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    filesApi.listForRequest(requestId)
      .then(setAttachments)
      .catch(() => setAttachments([]))
      .finally(() => setLoading(false))
  }, [requestId])

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
      ) : attachments.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
