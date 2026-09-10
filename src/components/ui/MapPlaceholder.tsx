import { STATES } from '@/data/medData'
import type { MapMarker } from '@/core/api/types'

interface MapPlaceholderProps {
  markers: MapMarker[]
}

const MARKER_COLOR: Record<string, string> = {
  pending:   '#f59e0b',
  enroute:   '#0ea5e9',
  attending: '#8b5cf6',
  done:      '#10b981',
}

// Área metropolitana de Caracas (mismo rango que las zonas sembradas) —
// proyecta lat/lng reales al espacio abstracto 0–100 de esta grilla
// decorativa, sin necesidad de cargar Leaflet en este widget pequeño.
const LAT_RANGE: [number, number] = [10.44, 10.545]
const LNG_RANGE: [number, number] = [-66.98, -66.82]

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_RANGE[0]) / (LNG_RANGE[1] - LNG_RANGE[0])) * 84 + 8
  const y = ((LAT_RANGE[1] - lat) / (LAT_RANGE[1] - LAT_RANGE[0])) * 78 + 10
  return { x: Math.min(96, Math.max(2, x)), y: Math.min(98, Math.max(4, y)) }
}

export function MapPlaceholder({ markers }: MapPlaceholderProps) {
  return (
    <div className="relative w-full h-full min-h-[320px] map-grid rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Zone outlines */}
        <rect x="5" y="5" width="40" height="40" rx="1" fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="2,1" />
        <rect x="55" y="5" width="40" height="40" rx="1" fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="2,1" />
        <rect x="5" y="55" width="40" height="40" rx="1" fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="2,1" />
        <rect x="55" y="55" width="40" height="40" rx="1" fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="2,1" />
        <rect x="30" y="30" width="40" height="40" rx="1" fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="2,1" />

        {/* Roads */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.6" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.6" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1,2" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1,2" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1,2" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1,2" />

        {/* Zone labels */}
        <text x="25" y="22" textAnchor="middle" fontSize="3.5" fill="#94a3b8" fontWeight="600">Norte</text>
        <text x="75" y="22" textAnchor="middle" fontSize="3.5" fill="#94a3b8" fontWeight="600">Este</text>
        <text x="25" y="78" textAnchor="middle" fontSize="3.5" fill="#94a3b8" fontWeight="600">Oeste</text>
        <text x="75" y="78" textAnchor="middle" fontSize="3.5" fill="#94a3b8" fontWeight="600">Sur</text>
        <text x="50" y="52" textAnchor="middle" fontSize="3.5" fill="#94a3b8" fontWeight="600">Centro</text>

        {/* Markers */}
        {markers.map(m => {
          const color = MARKER_COLOR[m.state] ?? '#6b7280'
          const isEmergency = m.priority === 'emergency'
          const { x, y } = project(m.lat, m.lng)
          return (
            <g key={m.id}>
              {isEmergency && (
                <circle cx={x} cy={y} r="4" fill={color} opacity="0.3" className="animate-pulse-ring" />
              )}
              <circle cx={x} cy={y} r="2.2" fill={color} stroke="white" strokeWidth="0.8" />
            </g>
          )
        })}

        {/* Compass N */}
        <text x="94" y="8" textAnchor="middle" fontSize="4" fill="#64748b" fontWeight="700">N</text>
        <line x1="94" y1="9" x2="94" y2="14" stroke="#64748b" strokeWidth="0.6" />
        <polygon points="94,9 92.5,12 94,11.5 95.5,12" fill="#64748b" />

        {/* Scale */}
        <line x1="5" y1="96" x2="15" y2="96" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="5" y1="94.5" x2="5" y2="97.5" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="15" y1="94.5" x2="15" y2="97.5" stroke="#94a3b8" strokeWidth="0.8" />
        <text x="10" y="100" textAnchor="middle" fontSize="2.5" fill="#94a3b8">1 km</text>
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex flex-wrap gap-1.5">
        {STATES.map(s => (
          <span key={s.id} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: MARKER_COLOR[s.id] }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
