import { Marker, Popup } from 'react-leaflet'
import { createLocationIcon } from '../../utils/leafletUtils'

const locationIcon = createLocationIcon()

export default function LocationMarker({ position }) {
  return (
    <Marker position={position} icon={locationIcon}>
      <Popup>
        <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '140px' }}>
          <p style={{ fontWeight: 600, fontSize: '13px', margin: '0 0 4px' }}>
            Ubicación seleccionada
          </p>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
