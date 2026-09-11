import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Doctor } from '@/core/api/types'

type Status = Doctor['status']

const DOT: Record<Status, string> = {
  available: 'bg-emerald-500',
  busy: 'bg-sky-500',
  offshift: 'bg-zinc-300 dark:bg-zinc-600',
}

const LABEL: Record<Status, string> = {
  available: 'Disponible',
  busy: 'En ruta',
  offshift: 'Fuera de turno',
}

const OPTIONS: Status[] = ['available', 'busy', 'offshift']

export function DoctorStatusSelect({
  value, disabled, onChange,
}: {
  value: Status
  disabled: boolean
  onChange: (status: Status) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900"
      >
        {disabled ? (
          <span className="h-2 w-2 shrink-0 rounded-full border-2 border-zinc-300 border-t-transparent animate-spin" />
        ) : (
          <span className={['h-1.5 w-1.5 shrink-0 rounded-full', DOT[value]].join(' ')} />
        )}
        <span className="flex-1 text-left truncate">{LABEL[value]}</span>
        <ChevronDown size={13} className={['text-zinc-400 transition-transform shrink-0', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 overflow-hidden">
          {OPTIONS.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => { onChange(status); setOpen(false) }}
              className="w-full h-8 px-2.5 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className={['h-1.5 w-1.5 shrink-0 rounded-full', DOT[status]].join(' ')} />
              <span className="flex-1 text-left">{LABEL[status]}</span>
              {status === value && <Check size={13} style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
