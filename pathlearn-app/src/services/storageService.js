/** Persistencia local de quizzes y rutas (AsyncStorage). */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { randomUUID } from 'expo-crypto'

const STORAGE_KEY_QUIZZES = 'geoquest_saved_quizzes'
const STORAGE_KEY_ROUTES = 'geoquest_saved_routes'
const SCHEMA_VERSION = '1'

async function readAll(key) {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function writeAll(key, records) {
  await AsyncStorage.setItem(key, JSON.stringify(records))
}

export async function getAllSaved() {
  return readAll(STORAGE_KEY_QUIZZES)
}

export async function getSavedById(id) {
  const all = await readAll(STORAGE_KEY_QUIZZES)
  return all.find(r => r.id === id) ?? null
}

export async function saveQuiz({
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
    id: randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    name: name.trim(),
    description,
    savedAt: new Date().toISOString(),
    location,
    locationName,
    radius,
    generationMeta: {
      ...generationMeta,
      generatedAt:
        generationMeta?.generatedAt instanceof Date
          ? generationMeta.generatedAt.toISOString()
          : generationMeta?.generatedAt,
    },
    debugLog,
    pois,
    quizzes,
  }

  const all = await readAll(STORAGE_KEY_QUIZZES)
  all.unshift(record)
  await writeAll(STORAGE_KEY_QUIZZES, all)
  return record
}

export async function deleteSaved(id) {
  const all = (await readAll(STORAGE_KEY_QUIZZES)).filter(r => r.id !== id)
  await writeAll(STORAGE_KEY_QUIZZES, all)
}

export async function deleteAllSaved() {
  await AsyncStorage.removeItem(STORAGE_KEY_QUIZZES)
}

export async function getStorageUsageKB() {
  try {
    const raw = (await AsyncStorage.getItem(STORAGE_KEY_QUIZZES)) ?? ''
    return Math.round((raw.length * 2) / 1024)
  } catch {
    return 0
  }
}

export async function getAllSavedRoutes() {
  return readAll(STORAGE_KEY_ROUTES)
}

export async function deleteSavedRoute(id) {
  const all = (await readAll(STORAGE_KEY_ROUTES)).filter(r => r.id !== id)
  await writeAll(STORAGE_KEY_ROUTES, all)
}

export async function deleteAllSavedRoutes() {
  await AsyncStorage.removeItem(STORAGE_KEY_ROUTES)
}

export async function getRoutesStorageUsageKB() {
  try {
    const raw = (await AsyncStorage.getItem(STORAGE_KEY_ROUTES)) ?? ''
    return Math.round((raw.length * 2) / 1024)
  } catch {
    return 0
  }
}

export async function saveRoute({
  name,
  description = '',
  route,
  generationMeta,
  pois,
  quizzes,
}) {
  const record = {
    id: randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    name: name.trim(),
    description,
    savedAt: new Date().toISOString(),
    type: 'route',
    route,
    generationMeta: {
      ...generationMeta,
      generatedAt:
        generationMeta?.generatedAt instanceof Date
          ? generationMeta.generatedAt.toISOString()
          : generationMeta?.generatedAt,
    },
    pois,
    quizzes,
  }

  const all = await readAll(STORAGE_KEY_ROUTES)
  all.unshift(record)
  await writeAll(STORAGE_KEY_ROUTES, all)
  return record
}
