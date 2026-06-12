const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

const MAX_POIS      = 10
const FETCH_TIMEOUT = 15000 // ms per endpoint

function buildQuery(lat, lng, radius) {
  return `
[out:json][timeout:12];
(
  node["name"]["tourism"](around:${radius},${lat},${lng});
  node["name"]["historic"](around:${radius},${lat},${lng});
  node["name"]["amenity"~"place_of_worship|theatre|library|arts_centre|museum"](around:${radius},${lat},${lng});
  way["name"]["tourism"](around:${radius},${lat},${lng});
  way["name"]["historic"](around:${radius},${lat},${lng});
);
out center body 20;
  `.trim()
}

function getPOIType(tags) {
  if (tags.historic) return { type: 'historic', subtype: tags.historic }
  if (tags.tourism)  return { type: 'tourism',  subtype: tags.tourism }
  if (tags.amenity)  return { type: 'amenity',  subtype: tags.amenity }
  if (tags.building) return { type: 'building', subtype: tags.building }
  return { type: 'other', subtype: 'point_of_interest' }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function parsePOIs(elements) {
  return elements
    .filter(el => el.tags?.name)
    .map(el => {
      const { type, subtype } = getPOIType(el.tags)
      return {
        id:     `${el.type}/${el.id}`,
        name:   el.tags.name,
        type,
        subtype,
        lat:    el.lat ?? el.center?.lat,
        lng:    el.lon ?? el.center?.lon,
        tags:   el.tags,
        source: 'overpass',
      }
    })
    .filter(p => p.lat != null && p.lng != null)
}

function deduplicate(pois) {
  const seen = new Set()
  return pois.filter(p => {
    const key = p.name.toLowerCase().replace(/\s+/g, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** POI desde Overpass. Incluye datos para el panel de depuración. */
export async function fetchPOIs(lat, lng, radius) {
  const query = buildQuery(lat, lng, radius)

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.info(`[GeoQuiz] Overpass: ${endpoint}`)
      const data = await fetchWithTimeout(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    `data=${encodeURIComponent(query)}`,
      })
      const all  = deduplicate(parsePOIs(data.elements))
      const pois = all.slice(0, MAX_POIS)
      if (pois.length > 0) {
        return {
          pois,
          allPOIs:      all,
          totalFound:   all.length,
          endpointUsed: endpoint,
          query,
        }
      }
    } catch (err) {
      console.warn(`[GeoQuiz] Overpass falló (${endpoint}): ${err.message}`)
    }
  }

  throw new Error('Todos los servidores de OpenStreetMap fallaron.')
}
