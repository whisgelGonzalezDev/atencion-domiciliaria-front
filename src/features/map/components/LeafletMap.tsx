import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import type { Zone, MapMarker } from '@/core/api/types'

interface LeafletMapProps {
  zones: Zone[]
  markers: MapMarker[]
  canManage: boolean
  onEditZone: (zone: Zone) => void
}

const MARKER_COLOR: Record<string, string> = {
  pending:   '#f59e0b',
  enroute:   '#0ea5e9',
  attending: '#8b5cf6',
  done:      '#10b981',
  cancelled: '#a1a1aa',
}

// Centro del área metropolitana de Caracas — fallback si aún no hay zonas.
const CARACAS_CENTER: [number, number] = [10.4806, -66.9036]

export function LeafletMap({ zones, markers, canManage, onEditZone }: LeafletMapProps) {
  const navigate = useNavigate()

  const center: [number, number] = zones.length > 0
    ? [
        zones.reduce((sum, z) => sum + z.lat, 0) / zones.length,
        zones.reduce((sum, z) => sum + z.lng, 0) / zones.length,
      ]
    : CARACAS_CENTER

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map(zone => (
        <Circle
          key={zone.id}
          center={[zone.lat, zone.lng]}
          radius={zone.radiusKm * 1000}
          pathOptions={{ color: '#0369a1', fillColor: '#0369a1', fillOpacity: 0.08, weight: 1.5 }}
        >
          <Popup>
            <p className="text-sm font-semibold text-zinc-900">{zone.name}</p>
            <p className="text-xs text-zinc-500">{zone.radiusKm} km de radio</p>
            {canManage && (
              <button
                onClick={() => onEditZone(zone)}
                className="mt-2 text-xs font-medium underline"
                style={{ color: 'var(--accent)' }}
              >
                Editar zona
              </button>
            )}
          </Popup>
        </Circle>
      ))}

      {markers.map(marker => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={marker.priority === 'emergency' ? 9 : 7}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: MARKER_COLOR[marker.state] ?? '#71717a',
            fillOpacity: 0.95,
          }}
          eventHandlers={{ click: () => navigate(`/requests/${marker.id}`) }}
        >
          <Popup>
            <p className="text-xs text-zinc-500">{marker.zone}</p>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
