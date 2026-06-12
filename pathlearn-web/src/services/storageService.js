/** Persistencia local de quizzes y rutas guardadas (localStorage). */

const STORAGE_KEY_QUIZZES = 'pathlearn_saved_quizzes'
const STORAGE_KEY_ROUTES  = 'pathlearn_saved_routes'
const SCHEMA_VERSION = '1'

function readAll(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(key, records) {
  localStorage.setItem(key, JSON.stringify(records))
}

export function getAllSaved() {
  return readAll(STORAGE_KEY_QUIZZES)
}

export function getSavedById(id) {
  return readAll(STORAGE_KEY_QUIZZES).find(r => r.id === id) ?? null
}

export function saveQuiz({
  name,
  description = '',
  location,
  locationName,
  radius,
  generationMeta,
  debugLog,
  pois,
  quizzes,
}) {
  const record = {
    id:            crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    name:          name.trim(),
    description,
    savedAt:       new Date().toISOString(),
    location,
    locationName,
    radius,
    generationMeta: {
      ...generationMeta,
      generatedAt: generationMeta?.generatedAt instanceof Date
        ? generationMeta.generatedAt.toISOString()
        : generationMeta?.generatedAt,
    },
    debugLog,
    pois,
    quizzes,
  }

  const all = readAll(STORAGE_KEY_QUIZZES)
  all.unshift(record)
  writeAll(STORAGE_KEY_QUIZZES, all)
  return record
}

export function deleteSaved(id) {
  writeAll(STORAGE_KEY_QUIZZES, readAll(STORAGE_KEY_QUIZZES).filter(r => r.id !== id))
}

export function deleteAllSaved() {
  localStorage.removeItem(STORAGE_KEY_QUIZZES)
}

export function getStorageUsageKB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZZES) ?? ''
    return Math.round((raw.length * 2) / 1024)
  } catch {
    return 0
  }
}

export function getAllSavedRoutes() {
  return readAll(STORAGE_KEY_ROUTES)
}

export function deleteSavedRoute(id) {
  writeAll(STORAGE_KEY_ROUTES, readAll(STORAGE_KEY_ROUTES).filter(r => r.id !== id))
}

export function deleteAllSavedRoutes() {
  localStorage.removeItem(STORAGE_KEY_ROUTES)
}

export function getRoutesStorageUsageKB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTES) ?? ''
    return Math.round((raw.length * 2) / 1024)
  } catch {
    return 0
  }
}

export function saveRoute({
  name,
  description = '',
  route,
  generationMeta,
  pois,
  quizzes,
}) {
  const record = {
    id:            crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    name:          name.trim(),
    description,
    savedAt:       new Date().toISOString(),
    type:          'route',
    route,
    generationMeta: {
      ...generationMeta,
      generatedAt: generationMeta?.generatedAt instanceof Date
        ? generationMeta.generatedAt.toISOString()
        : generationMeta?.generatedAt,
    },
    pois,
    quizzes,
  }

  const all = readAll(STORAGE_KEY_ROUTES)
  all.unshift(record)
  writeAll(STORAGE_KEY_ROUTES, all)
  return record
}
