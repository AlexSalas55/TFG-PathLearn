import { GoogleGenerativeAI } from '@google/generative-ai'

// Modelos preferidos (menos usados primero para evitar límites de cuota)
const PREFERRED_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest',
  'gemini-3-pro-preview',
]

let _modelCache = null

async function getAvailableModels(apiKey) {
  if (_modelCache) return _modelCache
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const available = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''))
    console.info('[GeoQuiz] Modelos disponibles:', available)
    _modelCache = available
    return available
  } catch (err) {
    console.warn('[GeoQuiz] No se pudo listar modelos:', err.message)
    return []
  }
}

async function getCandidates(apiKey) {
  const available = await getAvailableModels(apiKey)
  if (available.length === 0) return PREFERRED_MODELS

  const preferred = PREFERRED_MODELS.filter(m => available.includes(m))
  const rest = available.filter(
    m => !PREFERRED_MODELS.includes(m) && (m.includes('flash') || m.includes('pro'))
  )
  const candidates = [...preferred, ...rest]
  console.info('[GeoQuiz] Candidatos a probar:', candidates)
  return candidates.length > 0 ? candidates : available
}

async function callModel(genAI, modelName, prompt) {
  const configs = [
    { responseMimeType: 'application/json', temperature: 0.2 },
    { temperature: 0.2 },
  ]
  for (const generationConfig of configs) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err) {
      const isJsonModeError =
        err.message?.includes('responseMimeType') ||
        err.message?.includes('application/json')
      if (isJsonModeError && generationConfig.responseMimeType) continue
      throw err
    }
  }
}

async function tryModels(genAI, candidates, prompt) {
  let lastError = null
  for (const modelName of candidates) {
    try {
      const text = await callModel(genAI, modelName, prompt)
      console.info(`[GeoQuiz] ✓ Modelo usado: ${modelName}`)
      return { text, modelUsed: modelName }
    } catch (err) {
      const skip = err.message?.includes('404') ||
                   err.message?.includes('not found') ||
                   err.message?.includes('429') ||
                   err.message?.includes('quota') ||
                   err.message?.includes('503') ||
                   err.message?.includes('high demand') ||
                   err.message?.includes('overloaded') ||
                   err.message?.includes('temporarily')
      if (skip) {
        console.warn(`[GeoQuiz] ${modelName} no disponible, probando siguiente...`)
        lastError = err
        continue
      }
      throw err
    }
  }
  const isQuota = lastError?.message?.includes('429') || lastError?.message?.includes('quota')
  const isOverload = lastError?.message?.includes('503') ||
                     lastError?.message?.includes('high demand') ||
                     lastError?.message?.includes('overloaded')
  if (isQuota) {
    throw new Error('Has agotado la cuota por minuto. Espera 1-2 minutos e inténtalo de nuevo.')
  }
  if (isOverload) {
    throw new Error('Los modelos de Gemini están saturados en este momento. Espera unos segundos e inténtalo de nuevo.')
  }
  throw new Error(`Sin modelos disponibles. Último error: ${lastError?.message ?? 'desconocido'}`)
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('La IA devolvió un formato inesperado.')
  }
}

function matchQuizzesToPOIs(quizzes, pois) {
  return quizzes.map(quiz => {
    if (pois.find(p => p.id === quiz.poi_id)) return quiz
    const nameMatch = pois.find(p =>
      p.name.toLowerCase().includes(quiz.poi_name?.toLowerCase()) ||
      quiz.poi_name?.toLowerCase().includes(p.name.toLowerCase())
    )
    return nameMatch ? { ...quiz, poi_id: nameMatch.id } : quiz
  })
}

const MODE_INSTRUCTIONS = {
  explorer: `TIPO DE PREGUNTAS — EXPLORADOR (básico):
- Preguntas de conocimiento directo: fechas, autores, estilos arquitectónicos, funciones originales, datos curiosos
- La respuesta es un dato concreto, sin necesidad de razonamiento previo
- Las opciones incorrectas deben ser plausibles pero claramente distinguibles
- El campo "context" déjalo como cadena vacía ""`,

  historian: `TIPO DE PREGUNTAS — HISTORIADOR (contexto histórico):
- Preguntas sobre el por qué y el para qué: causas, consecuencias, movimientos culturales/sociales relacionados
- OBLIGATORIO: rellena el campo "context" con UNA sola frase que sitúe al estudiante (aporta marco histórico sin revelar la respuesta)
- La pregunta en sí debe pedir razonamiento, no un dato: "¿Qué factor...", "¿Cuál fue la causa...", "¿Qué movimiento..."
- Las opciones deben representar interpretaciones distintas, no simples errores de dato`,

  analyst: `TIPO DE PREGUNTAS — ANALISTA (razonamiento crítico):
- Preguntas que requieren evaluar, comparar o deducir; EVITA preguntas de dato directo
- Formatos válidos: "¿Cuál de estas afirmaciones es INCORRECTA?", "¿Qué factor fue MENOS determinante?", "¿Qué se puede deducir de...?"
- Las cuatro opciones deben ser afirmaciones plausibles que requieran reflexión para distinguirlas
- El campo "context" déjalo como cadena vacía ""`,
}

export async function generateQuizzes(pois, location, locationName, mode = 'explorer', apiKey) {
  const key = apiKey || process.env.EXPO_PUBLIC_GOOGLE_AI_KEY
  if (!key?.trim()) throw new Error('Falta la API key de Google AI en el archivo .env')

  const genAI      = new GoogleGenerativeAI(key)
  const candidates = await getCandidates(key)

  const poisList = pois
    .map((p, i) => `${i + 1}. ID: "${p.id}" | Nombre: "${p.name}" | Tipo: ${p.type}/${p.subtype}`)
    .join('\n')

  const modeBlock = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.explorer

  const prompt = `Eres un generador experto de quizzes educativos geolocalizados.

INSTRUCCIONES GENERALES:
- Genera exactamente 1 pregunta por cada punto de interés de la lista
- 4 opciones de respuesta, solo una correcta
- Temática: historia, cultura, arquitectura, arte o datos del lugar
- Explicación breve (2-3 frases) de la respuesta correcta
- RESPONDE SIEMPRE EN ESPAÑOL
- "correct_answer" es el índice (0-3) de la opción correcta en el array
- Varía la posición de la respuesta correcta entre preguntas

${modeBlock}

JSON EXACTO (sin texto fuera del JSON):
{
  "quizzes": [
    {
      "poi_id": "id exacto del POI",
      "poi_name": "nombre",
      "context": "",
      "question": "¿Pregunta?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Explicación..."
    }
  ]
}

Ubicación: ${locationName} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})

Puntos de interés:
${poisList}`

  const { text, modelUsed } = await tryModels(genAI, candidates, prompt)
  const parsed = safeParseJSON(text)
  return {
    quizzes:     matchQuizzesToPOIs(parsed.quizzes || [], pois),
    modelUsed,
    prompt,
    rawResponse: text,
  }
}

export async function generateFullRoute(route, apiKey) {
  const key = apiKey || process.env.EXPO_PUBLIC_GOOGLE_AI_KEY
  if (!key?.trim()) throw new Error('Falta la API key de Google AI en el archivo .env')

  const genAI      = new GoogleGenerativeAI(key)
  const candidates = await getCandidates(key)

  const prompt = `Eres un experto en patrimonio cultural y educación. Vas a crear una RUTA DE APRENDIZAJE completa: descubres los lugares, los ordenas y generas las preguntas.

TEMA DE LA RUTA: "${route.title}"
DESCRIPCIÓN: "${route.description}"
CIUDAD: ${route.city}
NÚMERO DE PARADAS: ${route.stops}

CRITERIO DE ORDENACIÓN: ${route.orderingHint}

TAREA (en un solo paso):
1. Identifica entre ${route.stops} lugares REALES, CONOCIDOS y RELEVANTES para este tema en ${route.city}
2. Ordénalos según el criterio indicado
3. Para cada lugar, genera una pregunta educativa que construya conocimiento de forma progresiva:
   - Paradas iniciales → introducen el tema, el contexto general
   - Paradas intermedias → profundizan en aspectos específicos
   - Paradas finales → conectan lo aprendido, reflexión sobre el legado

REGLAS:
- Solo lugares que realmente existan en esa ciudad
- Coordenadas PRECISAS (lat/lng reales del lugar, no aproximaciones de barrio)
- RESPONDE SIEMPRE EN ESPAÑOL
- Modo HISTORIADOR: incluye en "context" una frase que sitúe al estudiante (no revela la respuesta)
- 4 opciones de respuesta, solo una correcta
- "correct_answer" es el índice (0-3)
- Varía la posición de la respuesta correcta entre preguntas
- Las preguntas deben estar temáticamente relacionadas (no son preguntas aisladas)

JSON EXACTO (sin texto fuera del JSON):
{
  "route": [
    {
      "poi": {
        "id": "route/${route.id}/1",
        "name": "Nombre real del lugar",
        "type": "historic",
        "subtype": "monument",
        "lat": 41.12345,
        "lng": 2.12345
      },
      "quiz": {
        "poi_id": "route/${route.id}/1",
        "poi_name": "Nombre real del lugar",
        "context": "Frase de contexto histórico que sitúa al estudiante.",
        "question": "¿Pregunta progresiva relacionada con el tema de la ruta?",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correct_answer": 0,
        "explanation": "Explicación que conecta esta parada con el aprendizaje global de la ruta."
      }
    }
  ]
}`

  const { text, modelUsed } = await tryModels(genAI, candidates, prompt)
  const parsed  = safeParseJSON(text)
  const entries = parsed.route || []

  if (entries.length === 0) {
    throw new Error('La IA no generó paradas para esta ruta. Inténtalo de nuevo.')
  }

  const pois = entries
    .map(e => ({
      ...e.poi,
      lat: Number(e.poi?.lat),
      lng: Number(e.poi?.lng),
    }))
    .filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng) && p.name)

  if (pois.length === 0) {
    throw new Error('La IA no devolvió coordenadas válidas. Inténtalo de nuevo.')
  }

  const quizzesMap = {}
  entries.forEach(e => {
    if (e.quiz?.poi_id) quizzesMap[e.quiz.poi_id] = e.quiz
  })

  console.info('[GeoQuiz] Ruta generada:', pois.map(p => `${p.name} (${p.lat.toFixed(4)},${p.lng.toFixed(4)})`))

  return { pois, quizzesMap, modelUsed, prompt, rawResponse: text }
}

export async function generatePOIsAndQuizzes(location, locationName, radius, mode = 'explorer') {
  const key = process.env.EXPO_PUBLIC_GOOGLE_AI_KEY
  if (!key?.trim()) throw new Error('Falta la API key de Google AI en el archivo .env')

  const genAI      = new GoogleGenerativeAI(key)
  const candidates = await getCandidates(key)

  const modeBlock = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.explorer

  const prompt = `Eres un experto en patrimonio cultural y turismo. Dado un punto en el mapa, identifica lugares reales cercanos y genera quizzes educativos sobre ellos.

UBICACIÓN: ${locationName}
COORDENADAS: lat ${location.lat.toFixed(5)}, lng ${location.lng.toFixed(5)}
RADIO DE BÚSQUEDA: ${radius} metros

TAREA:
1. Identifica entre 5 y 8 puntos de interés REALES y CONOCIDOS dentro del radio indicado (monumentos, museos, iglesias, plazas, edificios históricos, parques, etc.)
2. Para cada lugar, genera una pregunta educativa
3. Proporciona coordenadas APROXIMADAS pero precisas para colocarlos en el mapa

REGLAS GENERALES:
- Solo lugares que realmente existan en esa zona
- Coordenadas dentro del radio indicado desde el punto central
- RESPONDE SIEMPRE EN ESPAÑOL
- 4 opciones de respuesta, solo una correcta
- "correct_answer" es el índice (0-3) de la opción correcta
- Varía la posición de la respuesta correcta entre preguntas

${modeBlock}

JSON EXACTO (sin texto fuera del JSON):
{
  "results": [
    {
      "poi": {
        "id": "ai/1",
        "name": "Nombre real del lugar",
        "type": "historic",
        "subtype": "monument",
        "lat": 41.12345,
        "lng": 2.12345
      },
      "quiz": {
        "poi_id": "ai/1",
        "poi_name": "Nombre real del lugar",
        "context": "",
        "question": "¿Pregunta educativa?",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correct_answer": 0,
        "explanation": "Explicación de por qué esta respuesta es correcta..."
      }
    }
  ]
}`

  const { text, modelUsed } = await tryModels(genAI, candidates, prompt)
  const parsed  = safeParseJSON(text)
  const results = parsed.results || []

  if (results.length === 0) {
    throw new Error('La IA no encontró puntos de interés en esta zona. Prueba una ciudad o zona turística.')
  }

  const pois = results
    .map(r => ({
      ...r.poi,
      source: 'ai',
      lat: Number(r.poi?.lat),
      lng: Number(r.poi?.lng),
    }))
    .filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng) && p.name)

  if (pois.length === 0) {
    throw new Error('La IA no devolvió coordenadas válidas. Inténtalo de nuevo.')
  }

  const quizzesMap = {}
  results.forEach(r => {
    if (r.quiz?.poi_id) quizzesMap[r.quiz.poi_id] = r.quiz
  })

  console.info('[GeoQuiz] POIs generados por IA:', pois.map(p => `${p.name} (${p.lat},${p.lng})`))
  return { pois, quizzesMap, modelUsed, prompt, rawResponse: text }
}
