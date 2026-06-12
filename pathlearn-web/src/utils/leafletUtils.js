import L from 'leaflet'

// Leaflet en Vite no carga los iconos por defecto
export function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

export function createLocationIcon() {
  return L.divIcon({
    html: `
      <div style="
        width: 16px; height: 16px;
        background: #4f46e5;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(79,70,229,0.25), 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

const TYPE_CONFIG = {
  historic:  { bg: '#d97706', border: '#b45309', label: 'H' },
  tourism:   { bg: '#2563eb', border: '#1d4ed8', label: 'T' },
  amenity:   { bg: '#7c3aed', border: '#6d28d9', label: 'C' },
  building:  { bg: '#ea580c', border: '#c2410c', label: 'E' },
  leisure:   { bg: '#16a34a', border: '#15803d', label: 'L' },
  other:     { bg: '#475569', border: '#334155', label: '?' },
}

const STATUS_CONFIG = {
  correct: { bg: '#059669', border: '#047857', label: '✓' },
  wrong:   { bg: '#dc2626', border: '#b91c1c', label: '✗' },
}

/** Marcador numerado para paradas de ruta. */
export function createRouteMarkerIcon(number, status = 'pending') {
  const COLORS = {
    pending: { bg: '#2563EB', ring: 'rgba(37,99,235,0.25)' },
    correct: { bg: '#059669', ring: 'rgba(5,150,105,0.25)'  },
    wrong:   { bg: '#DC2626', ring: 'rgba(220,38,38,0.25)'  },
    noQuiz:  { bg: '#94A3B8', ring: 'rgba(148,163,184,0.2)' },
  }
  const c    = COLORS[status] || COLORS.pending
  const size = 34

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${c.bg};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px ${c.ring}, 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 900;
        color: white;
        font-family: system-ui, sans-serif;
        line-height: 1;
        user-select: none;
      ">${number}</div>
    `,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  })
}

/** Pin de POI con color según tipo y estado de respuesta. */
export function createPOIIcon(type, status, hasQuiz) {
  const cfg = STATUS_CONFIG[status] || TYPE_CONFIG[type] || TYPE_CONFIG.other
  const size = hasQuiz && !status ? 40 : 34

  const html = `
    <div style="
      width: ${size}px;
      height: ${size + 12}px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${cfg.bg};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${Math.round(size * 0.38)}px;
          font-weight: 800;
          color: white;
          font-family: system-ui, sans-serif;
          line-height: 1;
          user-select: none;
        ">${cfg.label}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  })
}
