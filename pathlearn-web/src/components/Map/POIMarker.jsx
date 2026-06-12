import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { createPOIIcon } from '../../utils/leafletUtils'

const TYPE_LABELS = {
  historic: 'Histórico',
  tourism:  'Turístico',
  amenity:  'Cultural',
  building: 'Edificio',
  leisure:  'Ocio',
  other:    'Punto de interés',
}

function createPOIImageIcon(imageUrl, status, hasQuiz) {
  const ring = status === 'correct'
    ? 'rgba(5,150,105,0.30)'
    : status === 'wrong'
      ? 'rgba(220,38,38,0.28)'
      : hasQuiz ? 'rgba(37,99,235,0.25)' : 'rgba(148,163,184,0.22)'

  const border = status === 'correct'
    ? '#059669'
    : status === 'wrong'
      ? '#dc2626'
      : hasQuiz ? '#2563eb' : '#94a3b8'

  const size = hasQuiz && !status ? 44 : 38

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 9999px;
        border: 3px solid white;
        box-shadow: 0 0 0 5px ${ring}, 0 10px 20px rgba(0,0,0,0.22);
        overflow: hidden;
        background: #fff;
        position: relative;
      ">
        <div style="
          position: absolute; inset: 0;
          background-image: url('${String(imageUrl).replace(/'/g, '%27')}');
          background-size: cover;
          background-position: center;
        "></div>
        <div style="
          position: absolute; inset: 0;
          box-shadow: inset 0 0 0 2px ${border};
          border-radius: 9999px;
          opacity: 0.95;
          pointer-events: none;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  })
}

export default function POIMarker({ poi, hasQuiz, answer, onClick, imageUrl }) {
  const status = answer ? (answer.correct ? 'correct' : 'wrong') : null
  const icon = imageUrl
    ? createPOIImageIcon(imageUrl, status, hasQuiz)
    : createPOIIcon(poi.type, status, hasQuiz)

  return (
    <Marker
      position={[poi.lat, poi.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -(hasQuiz ? 52 : 46)]}>
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
          <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>
            {poi.name}
          </p>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 3px' }}>
            {TYPE_LABELS[poi.type] || 'POI'} · {poi.subtype?.replace(/_/g, ' ')}
          </p>
          {hasQuiz && !answer && (
            <p style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600, margin: 0 }}>
              ¡Clic para jugar!
            </p>
          )}
          {answer && (
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: answer.correct ? '#059669' : '#dc2626',
              margin: 0,
            }}>
              {answer.correct ? '✓ ¡Correcto!' : '✗ Incorrecto'}
            </p>
          )}
        </div>
      </Tooltip>
    </Marker>
  )
}
