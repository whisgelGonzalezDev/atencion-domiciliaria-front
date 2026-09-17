import { useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { inputCls } from '../formStyles'

interface ChipListInputProps {
  value: string[]
  onChange: (value: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function ChipListInput({ value, onChange, suggestions = [], placeholder }: ChipListInputProps) {
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const v = raw.trim()
    if (!v || value.includes(v)) return
    onChange([...value, v])
    setDraft('')
  }

  const remove = (item: string) => onChange(value.filter(v => v !== item))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add(draft)
    }
  }

  const available = suggestions.filter(s => !value.includes(s))

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 px-2.5 py-1 text-xs font-medium"
            >
              {item}
              <button type="button" onClick={() => remove(item)} aria-label={`Quitar ${item}`} className="hover:text-sky-900 dark:hover:text-sky-200">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Escribe y presiona Enter para agregar'}
          className={inputCls()}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Agregar"
        >
          <Plus size={14} />
        </button>
      </div>

      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {available.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 text-xs hover:border-solid hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
