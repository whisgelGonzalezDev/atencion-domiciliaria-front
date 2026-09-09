import { useTweaks, ACCENT_PRESETS } from '@/hooks/useTweaks'
import { useTheme } from '@/core/providers/ThemeProvider'

export function SettingsView() {
  const { tweaks, update } = useTweaks()
  const { isDark, toggle } = useTheme()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Personaliza la apariencia del sistema</p>
      </div>

      {/* Accent color */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-card space-y-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Color de acento</p>
        <div className="grid grid-cols-2 gap-3">
          {ACCENT_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => update({ accent: p.accent, accentSoft: p.accentSoft, accentStrong: p.accentStrong })}
              className={['flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-colors text-left', tweaks.accent === p.accent ? 'border-[var(--accent)]' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'].join(' ')}
            >
              <span className="h-6 w-6 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900" style={{ backgroundColor: p.accent }} />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{p.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Density */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-card space-y-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Densidad de la tabla</p>
        <div className="flex gap-3">
          {(['comfy', 'dense'] as const).map(d => (
            <button
              key={d}
              onClick={() => update({ density: d })}
              className={['flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-colors', tweaks.density === d ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'].join(' ')}
            >
              {d === 'comfy' ? 'Confortable' : 'Compacto'}
            </button>
          ))}
        </div>
      </section>

      {/* Dark mode */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Modo oscuro</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Ajusta el tema de la interfaz</p>
          </div>
          <button
            onClick={toggle}
            className={['relative h-6 w-11 rounded-full transition-colors', isDark ? 'bg-[var(--accent)]' : 'bg-zinc-200 dark:bg-zinc-700'].join(' ')}
          >
            <span className={['absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', isDark ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
          </button>
        </div>
      </section>
    </div>
  )
}
