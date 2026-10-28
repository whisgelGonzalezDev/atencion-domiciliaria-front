import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/core/components/Card'

interface SectionCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export function SectionCard({ title, children, action }: SectionCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{title}</p>
        {action}
      </div>
      {children}
    </Card>
  )
}

interface CollapsibleSectionCardProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSectionCard({ title, children, defaultOpen = false }: CollapsibleSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card padding="md">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{title}</p>
        <ChevronDown size={14} className={['text-zinc-400 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </Card>
  )
}
