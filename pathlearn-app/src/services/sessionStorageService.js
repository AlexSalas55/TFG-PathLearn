/** Sesiones de publicación y unión por código (Supabase). */
import * as Crypto from 'expo-crypto'
import { supabase } from './supabaseClient'

const SCHEMA_VERSION = 1

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O/0/I/1

export function generateSessionCode(length = 6) {
  const bytes = Crypto.getRandomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return out
}

function normalizeCode(codeRaw) {
  const code = String(codeRaw || '').trim().toUpperCase()
  return code
}

async function fetchSessionByCode(codeRaw) {
  const code = normalizeCode(codeRaw)
  if (!code) return null

  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, creator_id, status, created_at, updated_at, activity')
    .eq('code', code)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    id: data.id,
    schemaVersion: SCHEMA_VERSION,
    code: data.code,
    creatorId: data.creator_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    activity: data.activity || {},
  }
}

export async function publishDraftToSession({ creatorId, draft }) {
  if (!creatorId) throw new Error('Falta creatorId.')
  if (!draft) throw new Error('Falta borrador.')

  const activity = {
    type: draft.type,
    title: draft.title,
    description: draft.description ?? '',
    city: draft.city ?? '',
    location: draft.location ?? null,
    locationName: draft.locationName ?? '',
    radius: draft.radius ?? 500,
    quizMode: draft.quizMode ?? 'explorer',
    pois: draft.pois ?? [],
    quizzesByPoiId: draft.quizzesByPoiId ?? {},
    generationMeta: draft.generationMeta ?? null,
    debugLog: draft.debugLog ?? null,
  }

  let lastErr = null
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateSessionCode(6)
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        schema_version: SCHEMA_VERSION,
        code,
        creator_id: creatorId,
        status: 'open',
        activity,
      })
      .select('id, code, creator_id, status, created_at, updated_at, activity')
      .single()

    if (!error && data) {
      return {
        id: data.id,
        schemaVersion: SCHEMA_VERSION,
        code: data.code,
        creatorId: data.creator_id,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        activity: data.activity || {},
        participants: [],
        answers: [],
      }
    }

    lastErr = error
    // colisión de código → reintentar
    const msg = String(error?.message || '')
    const isCollision =
      msg.includes('sessions_code_uq') ||
      msg.toLowerCase().includes('duplicate key') ||
      msg.toLowerCase().includes('unique')
    if (!isCollision) break
  }

  throw new Error(lastErr?.message || 'No se pudo publicar la sesión.')
}

export async function getSessionByCode(codeRaw) {
  return await fetchSessionByCode(codeRaw)
}

export async function joinSession(codeRaw, displayName) {
  const code = normalizeCode(codeRaw)
  const name = String(displayName || '').trim()
  if (!code) throw new Error('Introduce un código.')
  if (!name) throw new Error('Introduce tu nombre.')

  const session = await fetchSessionByCode(code)
  if (!session) throw new Error('Código no encontrado.')
  if (session.status !== 'open') throw new Error('Esta sesión está cerrada.')

  const { data: participant, error } = await supabase
    .from('participants')
    .insert({
      session_id: session.id,
      name,
    })
    .select('id, name, joined_at')
    .single()

  if (error) throw new Error(error.message)

  return {
    session,
    participant: {
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joined_at,
    },
  }
}

export async function recordAnswer(codeRaw, participantId, poiId, selectedIndex, correct) {
  const code = normalizeCode(codeRaw)
  if (!code || !participantId || !poiId) return null

  const session = await fetchSessionByCode(code)
  if (!session) return null

  const payload = {
    session_id: session.id,
    participant_id: participantId,
    poi_id: String(poiId),
    selected_index: Number(selectedIndex),
    correct: !!correct,
    answered_at: new Date().toISOString(),
  }

  // upsert por (participant_id, poi_id)
  const { data, error } = await supabase
    .from('answers')
    .upsert(payload, { onConflict: 'participant_id,poi_id' })
    .select('id, participant_id, poi_id, selected_index, correct, answered_at')
    .single()

  if (error) throw new Error(error.message)

  return {
    participantId: data.participant_id,
    poiId: data.poi_id,
    selectedIndex: data.selected_index,
    correct: !!data.correct,
    answeredAt: data.answered_at,
  }
}

export async function listSessionsByCreator(creatorId) {
  if (!creatorId) return []

  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, creator_id, status, created_at, updated_at, activity, participants(*), answers(*)')
    .eq('creator_id', creatorId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data || []).map(s => ({
    id: s.id,
    schemaVersion: SCHEMA_VERSION,
    code: s.code,
    creatorId: s.creator_id,
    status: s.status,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    activity: s.activity || {},
    participants: (s.participants || []).map(p => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joined_at,
    })),
    answers: (s.answers || []).map(a => ({
      participantId: a.participant_id,
      poiId: a.poi_id,
      selectedIndex: a.selected_index,
      correct: !!a.correct,
      answeredAt: a.answered_at,
    })),
  }))
}

export async function closeSession(sessionId) {
  if (!sessionId) return null
  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'closed' })
    .eq('id', sessionId)
    .select('id, code, creator_id, status, created_at, updated_at, activity')
    .single()

  if (error) throw new Error(error.message)
  return {
    id: data.id,
    schemaVersion: SCHEMA_VERSION,
    code: data.code,
    creatorId: data.creator_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    activity: data.activity || {},
  }
}

export async function deleteSession(sessionId) {
  if (!sessionId) return false
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  return true
}

