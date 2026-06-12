const TIMEOUT_MS = 5000
const RATE_DELAY_MS = 350 // Nominatim: máx. 1 req/s

async function searchOne(name, city) {
  const q   = encodeURIComponent(`${name}, ${city}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&accept-language=es`

  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal:  controller.signal,
      headers: {
        'Accept-Language':  'es',
        'User-Agent':       'GeoQuizAI/1.0 (TFG prototype)',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.length) return null
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/** Busca coordenadas reales en Nominatim para POI generados por IA. */
export async function enrichPOIsWithNominatim(pois, city) {
  let nominatimCount = 0
  let aiCount        = 0
  const enriched     = []

  for (let i = 0; i < pois.length; i++) {
    const poi    = pois[i]
    const coords = await searchOne(poi.name, city)

    if (coords) {
      nominatimCount++
      enriched.push({ ...poi, lat: coords.lat, lng: coords.lng, coordSource: 'nominatim' })
      console.info(`[GeoQuiz] Nominatim ✓ "${poi.name}" → ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)
    } else {
      aiCount++
      enriched.push({ ...poi, coordSource: 'ai' })
      console.warn(`[GeoQuiz] Nominatim sin resultado para "${poi.name}", usando coords de IA`)
    }

    if (i < pois.length - 1) await sleep(RATE_DELAY_MS)
  }

  console.info(`[GeoQuiz] Coords: ${nominatimCount} Nominatim, ${aiCount} IA`)
  return { pois: enriched, nominatimCount, aiCount }
}
