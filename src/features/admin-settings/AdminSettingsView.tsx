import { useEffect, useState } from 'react'
import { Palette, SlidersHorizontal, Bell, Save } from 'lucide-react'
import { toast } from 'sonner'
import { settingsApi } from '@/core/api/settings.api'
import { useSystemSettings } from '@/core/providers/SystemSettingsProvider'
import { ACCENT_PRESETS } from '@/hooks/useTweaks'
import { Card } from '@/core/components/Card'

interface FormState {
  clinicName: string
  logoUrl: string
  accent: string
  accentSoft: string
  accentStrong: string
  notifyNewRequest: boolean
  notifyOverdueRequest: boolean
  defaultExchangeRate: string
  targetResponseMinutes: string
  businessHoursStart: string
  businessHoursEnd: string
}

const EMPTY_FORM: FormState = {
  clinicName: '',
  logoUrl: '',
  accent: '#0369a1',
  accentSoft: '#e0f2fe',
  accentStrong: '#0c4a6e',
  defaultExchangeRate: '',
  targetResponseMinutes: '',
  businessHoursStart: '',
  businessHoursEnd: '',
  notifyNewRequest: true,
  notifyOverdueRequest: true,
}

const TABS = [
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'operational', label: 'Parámetros operativos', icon: SlidersHorizontal },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
] as const

type TabId = typeof TABS[number]['id']

function inputCls() {
  return 'w-full h-9 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900'
}
const labelCls = 'text-xs font-medium text-zinc-700 dark:text-zinc-300'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={['relative h-6 w-11 rounded-full transition-colors shrink-0', checked ? 'bg-[var(--accent)]' : 'bg-zinc-200 dark:bg-zinc-700'].join(' ')}
    >
      <span className={['absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
    </button>
  )
}

export function AdminSettingsView() {
  const { settings, loading, refresh } = useSystemSettings()
  const [tab, setTab] = useState<TabId>('appearance')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!settings) return
    setForm({
      clinicName: settings.clinicName,
      logoUrl: settings.logoUrl ?? '',
      accent: settings.accent,
      accentSoft: settings.accentSoft,
      accentStrong: settings.accentStrong,
      defaultExchangeRate: settings.defaultExchangeRate?.toString() ?? '',
      targetResponseMinutes: settings.targetResponseMinutes?.toString() ?? '',
      businessHoursStart: settings.businessHoursStart ?? '',
      businessHoursEnd: settings.businessHoursEnd ?? '',
      notifyNewRequest: settings.notifyNewRequest,
      notifyOverdueRequest: settings.notifyOverdueRequest,
    })
  }, [settings])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.clinicName.trim()) {
      toast.error('El nombre de la clínica no puede estar vacío')
      return
    }
    setSaving(true)
    try {
      await settingsApi.update({
        clinicName: form.clinicName.trim(),
        logoUrl: form.logoUrl.trim(),
        accent: form.accent,
        accentSoft: form.accentSoft,
        accentStrong: form.accentStrong,
        defaultExchangeRate: form.defaultExchangeRate ? Number(form.defaultExchangeRate) : undefined,
        targetResponseMinutes: form.targetResponseMinutes ? Number(form.targetResponseMinutes) : undefined,
        businessHoursStart: form.businessHoursStart || undefined,
        businessHoursEnd: form.businessHoursEnd || undefined,
        notifyNewRequest: form.notifyNewRequest,
        notifyOverdueRequest: form.notifyOverdueRequest,
      })
      await refresh()
      toast.success('Configuración guardada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Panel de administración</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configuración del sistema, aplicada para todos los usuarios
          </p>
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded text-xs font-medium text-white disabled:opacity-60 transition-opacity shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={13} />}
          Guardar cambios
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
            ].join(' ')}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'appearance' && (
        <div className="space-y-4">
          <Card padding="md" className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Nombre de la clínica</label>
              <input value={form.clinicName} onChange={e => set('clinicName', e.target.value)} placeholder="Atención Domiciliaria" className={inputCls()} />
              <p className="text-[10px] text-zinc-400">Se muestra en el menú lateral y en el título de la pestaña.</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>URL del logo (opcional)</label>
              <input value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." className={inputCls()} />
              <p className="text-[10px] text-zinc-400">Reemplaza el ícono por defecto en el menú lateral. Déjalo vacío para usar el ícono predeterminado.</p>
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Color de marca</p>
            <div className="grid grid-cols-2 gap-3">
              {ACCENT_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, accent: p.accent, accentSoft: p.accentSoft, accentStrong: p.accentStrong }))}
                  className={['flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-colors text-left', form.accent === p.accent ? 'border-[var(--accent)]' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'].join(' ')}
                >
                  <span className="h-6 w-6 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900" style={{ backgroundColor: p.accent }} />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {([
                ['accent', 'Principal'],
                ['accentSoft', 'Suave'],
                ['accentStrong', 'Fuerte'],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <label className={labelCls}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      className="h-9 w-9 shrink-0 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                    />
                    <input value={form[key]} onChange={e => set(key, e.target.value)} className={inputCls()} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400">
              Se aplica como color por defecto para todos los usuarios. Quien ya personalizó su propio color en Configuración conserva su elección.
            </p>
          </Card>
        </div>
      )}

      {tab === 'operational' && (
        <Card padding="md" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Tasa de cambio Bs/USD por defecto</label>
              <input type="number" step="0.01" min="0" value={form.defaultExchangeRate} onChange={e => set('defaultExchangeRate', e.target.value)} placeholder="Ej. 38.50" className={inputCls()} />
              <p className="text-[10px] text-zinc-400">Se usa para prellenar el formulario de nuevo cobro en Facturación.</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Tiempo objetivo de respuesta (min)</label>
              <input type="number" step="1" min="1" value={form.targetResponseMinutes} onChange={e => set('targetResponseMinutes', e.target.value)} placeholder="Ej. 30" className={inputCls()} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Horario de atención — inicio</label>
              <input type="time" value={form.businessHoursStart} onChange={e => set('businessHoursStart', e.target.value)} className={inputCls()} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Horario de atención — fin</label>
              <input type="time" value={form.businessHoursEnd} onChange={e => set('businessHoursEnd', e.target.value)} className={inputCls()} />
            </div>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Solicitudes nuevas</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Preferencia para avisar cuando llega una solicitud pendiente</p>
            </div>
            <Toggle checked={form.notifyNewRequest} onChange={v => set('notifyNewRequest', v)} />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Solicitudes con demora</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Preferencia para avisar cuando se supera el tiempo objetivo de respuesta</p>
            </div>
            <Toggle checked={form.notifyOverdueRequest} onChange={v => set('notifyOverdueRequest', v)} />
          </div>
          <p className="text-[10px] text-zinc-400 pt-1">
            Estas preferencias quedan guardadas para todo el sistema. Por ahora solo son configuración base — el sistema aún no envía notificaciones en tiempo real.
          </p>
        </Card>
      )}
    </div>
  )
}
