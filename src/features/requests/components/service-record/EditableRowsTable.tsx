import { Plus, X } from 'lucide-react'
import { inputCls } from '../../formStyles'

export interface RowColumn {
  key: string
  label: string
  placeholder?: string
}

interface EditableRowsTableProps {
  columns: RowColumn[]
  rows: Record<string, string>[]
  onChange: (rows: Record<string, string>[]) => void
  addLabel: string
  emptyHint: string
}

export function EditableRowsTable({ columns, rows, onChange, addLabel, emptyHint }: EditableRowsTableProps) {
  const addRow = () => onChange([...rows, Object.fromEntries(columns.map(c => [c.key, '']))])
  const updateRow = (i: number, key: string, value: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))

  return (
    <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            {columns.map(col => (
              <th key={col.key} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {col.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-xs italic text-zinc-400">
                {emptyHint}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                {columns.map(col => (
                  <td key={col.key} className="px-2 py-1.5">
                    <input
                      value={row[col.key] ?? ''}
                      onChange={e => updateRow(i, col.key, e.target.value)}
                      placeholder={col.placeholder}
                      className={inputCls()}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Eliminar fila"
                    className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))
          )}
          <tr>
            <td colSpan={columns.length + 1} className="px-3 py-2">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <Plus size={13} />
                {addLabel}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
