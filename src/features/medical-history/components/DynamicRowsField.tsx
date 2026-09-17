import { Plus, X } from 'lucide-react'
import { inputCls, labelCls } from '../formStyles'

export interface FieldColumn {
  key: string
  label: string
  type?: 'text' | 'date' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface DynamicRowsFieldProps {
  columns: FieldColumn[]
  rows: Record<string, string>[]
  onChange: (rows: Record<string, string>[]) => void
  addLabel: string
  emptyHint: string
}

export function DynamicRowsField({ columns, rows, onChange, addLabel, emptyHint }: DynamicRowsFieldProps) {
  const addRow = () => {
    const blank = Object.fromEntries(columns.map(c => [c.key, '']))
    onChange([...rows, blank])
  }

  const updateRow = (index: number, key: string, value: string) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)))
  }

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">{emptyHint}</p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded border border-zinc-200 dark:border-zinc-700 p-3">
          {columns.map(col => (
            <div key={col.key} className="min-w-[140px] flex-1 space-y-1">
              <label className={labelCls}>{col.label}</label>
              {col.type === 'select' ? (
                <select value={row[col.key] ?? ''} onChange={e => updateRow(i, col.key, e.target.value)} className={inputCls()}>
                  <option value="">Seleccionar...</option>
                  {col.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={col.type === 'date' ? 'date' : 'text'}
                  value={row[col.key] ?? ''}
                  onChange={e => updateRow(i, col.key, e.target.value)}
                  placeholder={col.placeholder}
                  className={inputCls()}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Eliminar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        <Plus size={13} />
        {addLabel}
      </button>
    </div>
  )
}
