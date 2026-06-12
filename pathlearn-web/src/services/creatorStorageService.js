/** Borradores del creador en localStorage. */

const CREATOR_ID_KEY = 'pathlearn_creator_id'
const DRAFTS_KEY     = 'pathlearn_creator_drafts'
const SCHEMA_VERSION = '1'

export function getOrCreateCreatorId() {
  try {
    const existing = localStorage.getItem(CREATOR_ID_KEY)
    if (existing?.trim()) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(CREATOR_ID_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function readAllDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAllDrafts(drafts) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function listDrafts(creatorId) {
  return readAllDrafts()
    .filter(d => d.creatorId === creatorId)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export function getDraftById(id) {
  return readAllDrafts().find(d => d.id === id) ?? null
}

export function createDraft({ creatorId, type }) {
  const now = new Date().toISOString()
  const id  = crypto.randomUUID()

  const draft = {
    id,
    schemaVersion: SCHEMA_VERSION,
    creatorId,
    type, // 'explore_quiz' | 'route'
    title: type === 'route' ? 'Nueva ruta' : 'Nuevo quiz',
    description: '',
    city: '',
    templateId: '',
    stops: '',
    orderingHint: '',
    pois: [],
    quizzesByPoiId: {},
    quizMode: 'explorer',
    generationMeta: null,
    debugLog: null,
    createdAt: now,
    updatedAt: now,
  }

  const all = readAllDrafts()
  all.unshift(draft)
  writeAllDrafts(all)
  return draft
}

export function updateDraft(id, patch) {
  const all = readAllDrafts()
  const idx = all.findIndex(d => d.id === id)
  if (idx === -1) return null

  const updated = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  all[idx] = updated
  writeAllDrafts(all)
  return updated
}

export function deleteDraft(id) {
  writeAllDrafts(readAllDrafts().filter(d => d.id !== id))
}

export function duplicateDraft(id) {
  const original = getDraftById(id)
  if (!original) return null

  const now = new Date().toISOString()
  const copy = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title || 'Borrador'} (copia)`,
    createdAt: now,
    updatedAt: now,
  }
  const all = readAllDrafts()
  all.unshift(copy)
  writeAllDrafts(all)
  return copy
}
