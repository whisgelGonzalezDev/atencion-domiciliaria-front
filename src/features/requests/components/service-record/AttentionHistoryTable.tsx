import type { MedRequest } from '@/core/api/types'
import { SectionCard } from './SectionCard'

interface AttentionHistoryTableProps {
  history: MedRequest[]
  onNavigate: (id: string) => void
}

export function AttentionHistoryTable({ history, onNavigate }: AttentionHistoryTableProps) {
  if (history.length === 0) return null

  return (
    <SectionCard title="Historial de atenciones">
      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">#</th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Fecha y hora</th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Servicios</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr
                key={h.id}
                onClick={() => onNavigate(h.id)}
                className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-3 py-2 font-mono text-xs text-zinc-500">{h.id}</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  {new Date(h.callTime).toLocaleString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 text-xs font-medium">
                    {h.serviceRecord?.serviceType ?? 'AMD'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
