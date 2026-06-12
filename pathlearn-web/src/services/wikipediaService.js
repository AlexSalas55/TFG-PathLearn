const TIMEOUT_MS = 5000

async function fetchSummary(name, lang) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Api-User-Agent': 'GeoQuizAI/1.0 (TFG prototype)' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Imagen de Wikipedia para un POI (es, luego en). */
export async function fetchPOIImage(poiName) {
  for (const lang of ['es', 'en']) {
    const data = await fetchSummary(poiName, lang)
    if (!data) continue

    const url = data.originalimage?.source || data.thumbnail?.source
    if (url) return url
  }
  return null
}

/** Imágenes en paralelo para una lista de POI. Devuelve { [poiId]: url }. */
export async function fetchPOIImages(pois) {
  const results = await Promise.allSettled(
    pois.map(poi =>
      fetchPOIImage(poi.name).then(url => ({ id: poi.id, url }))
    )
  )
  const images = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value?.url) {
      images[r.value.id] = r.value.url
    }
  }
  console.log(`[GeoQuiz] Wikipedia imágenes: ${Object.keys(images).length}/${pois.length} encontradas`)
  return images
}
