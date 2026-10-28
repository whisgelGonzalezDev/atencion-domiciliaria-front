import { SERVICE_TYPES, type ServiceRecord, type ServiceType } from '@/core/api/types'

interface ServiceTypeTabsProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function ServiceTypeTabs({ data, update }: ServiceTypeTabsProps) {
  const setType = (serviceType: ServiceType) => update(prev => ({ ...prev, serviceType }))

  return (
    <div className="flex flex-wrap gap-2">
      {SERVICE_TYPES.map(type => {
        const active = data.serviceType === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => setType(type)}
            className={[
              'h-8 min-w-[52px] rounded-full px-3 text-xs font-semibold border transition-colors',
              active
                ? 'text-white border-transparent'
                : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950',
            ].join(' ')}
            style={active ? { backgroundColor: 'var(--accent)' } : undefined}
          >
            {type}
          </button>
        )
      })}
    </div>
  )
}
