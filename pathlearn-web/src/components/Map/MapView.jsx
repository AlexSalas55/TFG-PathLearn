import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { createRouteMarkerIcon, fixLeafletIcons } from '../../utils/leafletUtils'

import L from 'leaflet'
import LocationMarker from './LocationMarker'
import POIMarker from './POIMarker'
import { useEffect, useRef } from 'react'

fixLeafletIcons()

function MapClickHandler({ onLocationSelect, disabled }) {
  useMapEvents(
    disabled
      ? {}
      : {
          click(e) {
            onLocationSelect(e.latlng)
          },
        }
  )
  return null
}

function poisBoundsKey(pois) {
  if (!pois?.length) return ''
  return pois.map(p => `${p.id ?? ''}:${p.lat},${p.lng}`).join('|')
}

function MapPanner({ location }) {
  const map = useMap()
  const lastPanKeyRef = useRef(null)
  const lat = location?.lat
  const lng = location?.lng

  useEffect(() => {
    if (lat == null || lng == null) return
    const key = `${lat},${lng}`
    if (lastPanKeyRef.current === key) return
    lastPanKeyRef.current = key
    map.panTo([lat, lng], { animate: true, duration: 0.8 })
  }, [lat, lng, map])
  return null
}

function MapFitter({ pois }) {
  const map = useMap()
  const lastFitKeyRef = useRef('')
  const boundsKey = poisBoundsKey(pois)

  useEffect(() => {
    if (!boundsKey) return
    if (boundsKey === lastFitKeyRef.current) return
    lastFitKeyRef.current = boundsKey
    try {
      const bounds = L.latLngBounds(pois.map(p => [p.lat, p.lng]))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 80], maxZoom: 16, animate: true })
      }
    } catch (e) {
      console.warn('[GeoQuiz] fitBounds error:', e)
    }
  }, [boundsKey, pois, map])
  return null
}

function createRouteImageMarkerIcon(number, imageUrl, status = 'pending') {
  const COLORS = {
    pending: { ring: 'rgba(37,99,235,0.25)' },
    correct: { ring: 'rgba(5,150,105,0.25)'  },
    wrong:   { ring: 'rgba(220,38,38,0.25)'  },
    noQuiz:  { ring: 'rgba(148,163,184,0.22)' },
  }
  const c = COLORS[status] || COLORS.pending
  const size = 40
  const safeUrl = String(imageUrl).replace(/'/g, '%27')

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 9999px;
        border: 3px solid white;
        box-shadow: 0 0 0 5px ${c.ring}, 0 10px 20px rgba(0,0,0,0.22);
        overflow: hidden;
        background: #ffffff;
        position: relative;
      ">
        <div style="
          position: absolute; inset: 0;
          background-image: url('${safeUrl}');
          background-size: cover;
          background-position: center;
          width: 100%; height: 100%;
        "></div>

        <div style="
          position: absolute;
          inset: 0;
          background: rgba(37, 99, 235, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 900;
          font-family: system-ui, sans-serif;
          line-height: 1;
          text-shadow: 0 2px 10px rgba(0,0,0,0.35);
          user-select: none;
        ">${number}</div>
      </div>
    `,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 8)],
  })
}

function RouteWaypointMarker({ poi, index, hasQuiz, answer, imageUrl, onClick }) {
  const status = answer
    ? (answer.correct ? 'correct' : 'wrong')
    : hasQuiz ? 'pending' : 'noQuiz'

  const icon = imageUrl
    ? createRouteImageMarkerIcon(index + 1, imageUrl, status)
    : createRouteMarkerIcon(index + 1, status)

  return (
    <Marker
      position={[poi.lat, poi.lng]}
      icon={icon}
      eventHandlers={{ click: () => hasQuiz && onClick(poi) }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={0.97}>
        <div style={{ fontFamily: 'system-ui', fontSize: 12 }}>
          <strong>#{index + 1} {poi.name}</strong>
          {!hasQuiz && <div style={{ color: '#94a3b8', fontSize: 10 }}>Generando…</div>}
        </div>
      </Tooltip>
    </Marker>
  )
}

export default function MapView({
  selectedLocation,
  pois,
  quizzes,
  answers,
  poiImages,
  onLocationSelect,
  onPOIClick,
  radius,
  routeWaypoints = [],
  routeQuizzes   = {},
  routeAnswers   = {},
  routeImages,
  onRouteWaypointClick,
  clickDisabled = false,
  allowRouteMapClicks = false,
  cursorMode = 'crosshair', // 'crosshair' | 'grab'
  showExploreCircle = true,
}) {
  const isRouteMode = routeWaypoints.length > 0
  const disableClicks = clickDisabled || (isRouteMode && !allowRouteMapClicks)

  return (
    <MapContainer
      center={[41.3851, 2.1734]}
      zoom={14}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
      className={cursorMode === 'grab' ? 'pl-map-grab' : 'pl-map-crosshair'}
    >
      <ZoomControl position="bottomleft" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler
        onLocationSelect={onLocationSelect}
        disabled={disableClicks}
      />

      {!isRouteMode && selectedLocation && (
        <>
          <MapPanner location={selectedLocation} />
          <LocationMarker position={selectedLocation} />
          {showExploreCircle && (
            <Circle
              center={selectedLocation}
              radius={radius}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '6 5',
              }}
            />
          )}
        </>
      )}

      {!isRouteMode && <MapFitter pois={pois} />}

      {!isRouteMode && pois.map(poi => (
        <POIMarker
          key={poi.id}
          poi={poi}
          hasQuiz={!!quizzes[poi.id]}
          answer={answers[poi.id]}
          imageUrl={poiImages?.[poi.id]}
          onClick={() => onPOIClick(poi)}
        />
      ))}

      {isRouteMode && (
        <>
          <MapFitter pois={routeWaypoints} />

          <Polyline
            positions={routeWaypoints.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: '#2563EB',
              weight: 3,
              dashArray: '10 7',
              opacity: 0.6,
            }}
          />

          {routeWaypoints.map((poi, index) => (
            <RouteWaypointMarker
              key={poi.id}
              poi={poi}
              index={index}
              hasQuiz={!!routeQuizzes[poi.id]}
              answer={routeAnswers[poi.id]}
              imageUrl={routeImages?.[poi.id]}
              onClick={onRouteWaypointClick}
            />
          ))}
        </>
      )}
    </MapContainer>
  )
}
