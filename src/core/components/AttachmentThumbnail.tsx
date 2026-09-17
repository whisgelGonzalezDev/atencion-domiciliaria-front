import { FileText } from 'lucide-react'
import { useAuthenticatedBlobUrl } from '@/core/hooks/useAuthenticatedBlobUrl'
import type { Attachment } from '@/core/api/files.api'

interface AttachmentThumbnailProps {
  attachment: Attachment
  className?: string
}

export function AttachmentThumbnail({ attachment, className = '' }: AttachmentThumbnailProps) {
  const isImage = attachment.mimeType.startsWith('image/')
  const { blobUrl, loading, error } = useAuthenticatedBlobUrl(attachment.url)

  const handleClick = () => {
    if (blobUrl) window.open(blobUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!blobUrl}
      title={attachment.originalName}
      className={[
        'relative flex items-center justify-center overflow-hidden rounded-lg',
        'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900',
        'disabled:cursor-default',
        className,
      ].join(' ')}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />}
      {!loading && error && (
        <div className="flex flex-col items-center gap-1 p-2 text-center">
          <FileText size={20} className="text-zinc-300 dark:text-zinc-600" />
          <span className="text-[10px] text-zinc-400">Error al cargar</span>
        </div>
      )}
      {!loading && !error && isImage && blobUrl && (
        <img src={blobUrl} alt={attachment.originalName} className="h-full w-full object-cover" />
      )}
      {!loading && !error && !isImage && (
        <div className="flex flex-col items-center gap-1 p-2 text-center">
          <FileText size={20} className="text-zinc-400" />
          <span className="line-clamp-2 text-[10px] text-zinc-500 dark:text-zinc-400 break-all">{attachment.originalName}</span>
        </div>
      )}
    </button>
  )
}
