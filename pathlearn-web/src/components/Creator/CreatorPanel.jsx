import { useEffect, useMemo, useRef, useState } from 'react'
import { PenSquare, Wand2, MapPin, Plus, Copy, Trash2, FileText, X, ArrowLeft, PencilLine, Edit3, ChevronUp, ChevronDown, Upload } from 'lucide-react'
import FieldLabel from '../UI/FieldLabel'
import QuizEditorModal from './QuizEditorModal'
import { generateQuizzes } from '../../services/geminiService'
import { publishDraftToSession, closeSession, deleteSession, listSessionsByCreator } from '../../services/sessionStorageService'
import { ROUTES } from '../../data/routesData'
import { APP_CONFIG } from '../../config/appConfig'
import { getCorrectAnswerIndex } from '../../utils/quizUtils'
import {
  createDraft,
  deleteDraft,
  duplicateDraft,
  getDraftById,
  getOrCreateCreatorId,
  listDrafts,
  updateDraft,
} from '../../services/creatorStorageService'

function CreateDraftModal({ open, onClose, onCreate }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center p-2 sm:p-4 pt-20 sm:pt-24 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-[min(520px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl my-4">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Creador</div>
            <div className="text-lg font-black text-slate-900">Nuevo borrador</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-5 grid gap-3">
          <button
            onClick={() => onCreate('explore_quiz')}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 flex-none rounded-xl bg-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-black text-slate-900">Quiz por ubicación</div>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Modo sencillo
                  </span>
                </div>
                <div className="text-sm text-slate-500 leading-snug mt-1">
                  Crea un quiz rápido desde un punto en el mapa: sin descripción, sin parámetros extra ni personalización avanzada.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onCreate('route')}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 flex-none rounded-xl bg-blue-600 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-black text-slate-900">Ruta por temática</div>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Modo avanzado
                  </span>
                </div>
                <div className="text-sm text-slate-500 leading-snug mt-1">
                  Define título, descripción, ciudad, paradas y orden; puedes usar plantillas. Más control sobre el contenido generado.
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreatorPanel({
  activeDraftId: activeDraftIdProp,
  onActiveDraftChange,
  externalTick = 0,
  onDraftUpdated,
  onSetMapLoading,
  pickLocationActive = false,
  onStartPickLocation,
  onStopPickLocation,
  loading = false,
  loadingStep = '',
  error = null,
  onGenerateQuiz,
  editingPoiId = null,
  onEditingPoiChange,
  movePoiId = null,
  onStartMovePoi,
  onCancelMovePoi,
  onPreviewSessionActivity,
  sessionPoiId = null,
  onSessionPoiChange,
  requestedView = null,
  onRequestedViewHandled,
  onSessionsSummaryChange,
  mobileOpen = false,
  onMobileToggle,
}) {
  const [creatorId, setCreatorId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [activeDraftIdLocal, setActiveDraftIdLocal] = useState(null)

  useEffect(() => {
    setCreatorId(getOrCreateCreatorId())
  }, [])

  const drafts = useMemo(() => {
    if (!creatorId) return []
    return listDrafts(creatorId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId, refreshKey])

  const bump = () => setRefreshKey(k => k + 1)
  const activeDraftId = activeDraftIdProp ?? activeDraftIdLocal
  const setActiveDraftId = onActiveDraftChange ?? setActiveDraftIdLocal
  const activeDraft = useMemo(() => (activeDraftId ? getDraftById(activeDraftId) : null), [activeDraftId, refreshKey, externalTick])

  const handleCreate = (type) => {
    if (!creatorId) return
    const draft = createDraft({ creatorId, type })
    setShowCreate(false)
    setActiveDraftId(draft.id)
    bump()
  }

  const closeEditor = () => {
    setQuizDraft(null)
    setQuizDirty(false)
    setQuizSavedFlash(false)
    onEditingPoiChange?.(null)
  }
  const [quizDraft, setQuizDraft] = useState(null)
  const [quizDirty, setQuizDirty] = useState(false)
  const [quizSavedFlash, setQuizSavedFlash] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState(null)
  const [publishedSession, setPublishedSession] = useState(null)
  const [showPublished, setShowPublished] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [creatorView, setCreatorView] = useState('drafts') // 'drafts' | 'sessions'
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState(null)
  const [autoRefreshSessions, setAutoRefreshSessions] = useState(true)
  const [activeSessionPoiIdLocal, setActiveSessionPoiIdLocal] = useState(null)
  const activeSessionPoiId = sessionPoiId ?? activeSessionPoiIdLocal
  const setActiveSessionPoiId = onSessionPoiChange ?? setActiveSessionPoiIdLocal
  const [activeSessionParticipantId, setActiveSessionParticipantId] = useState(null)
  const sessionQuestionModalScrollTop = useRef(0)
  const sessionParticipantModalScrollTop = useRef(0)

  useEffect(() => {
    if (!activeSessionPoiId) sessionQuestionModalScrollTop.current = 0
  }, [activeSessionPoiId])

  useEffect(() => {
    if (!activeSessionParticipantId) sessionParticipantModalScrollTop.current = 0
  }, [activeSessionParticipantId])

  // Al cambiar de borrador, cerrar la vista de sesión publicada.
  useEffect(() => {
    if (!activeDraftId) return
    setPublishedSession(null)
    setShowPublished(false)
  }, [activeDraftId])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!creatorId) {
        setSessions([])
        return
      }
      setSessionsLoading(true)
      setSessionsError(null)
      try {
        const rows = await listSessionsByCreator(creatorId)
        if (!cancelled) setSessions(rows)
      } catch (e) {
        if (!cancelled) setSessionsError(e.message || 'No se pudieron cargar las sesiones.')
      } finally {
        if (!cancelled) setSessionsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [creatorId, refreshKey])

  // Refresco periódico de la lista de sesiones.
  useEffect(() => {
    if (!creatorId) return
    if (!autoRefreshSessions) return
    if (creatorView !== 'sessions') return
    if (activeDraftId) return // no refrescar mientras se edita un borrador

    let cancelled = false
    let inFlight = false

    const tick = async () => {
      if (inFlight) return
      inFlight = true
      try {
        const rows = await listSessionsByCreator(creatorId)
        if (!cancelled) setSessions(rows)
      } catch {
        // ignorar errores de refresco en segundo plano
      } finally {
        inFlight = false
      }
    }

    tick()
    const id = setInterval(tick, APP_CONFIG.creatorSessionsPollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [creatorId, creatorView, autoRefreshSessions, activeDraftId])

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null
    return sessions.find(s => s.id === activeSessionId) ?? null
  }, [sessions, activeSessionId])

  const lastSessionsSummaryRef = useRef({ open: -1, total: -1 })
  useEffect(() => {
    const open = sessions.filter(s => s.status === 'open').length
    const total = sessions.length
    const prev = lastSessionsSummaryRef.current
    if (prev.open === open && prev.total === total) return
    lastSessionsSummaryRef.current = { open, total }
    onSessionsSummaryChange?.({ open, total })
  }, [sessions, onSessionsSummaryChange])

  useEffect(() => {
    if (requestedView === 'sessions') {
      setCreatorView('sessions')
      setActiveSessionId(null)
      onRequestedViewHandled?.()
    }
  }, [requestedView, onRequestedViewHandled])

  useEffect(() => {
    setActiveSessionPoiId(null)
    setActiveSessionParticipantId(null)
  }, [activeSessionId])

  useEffect(() => {
    if (activeSessionId) {
      const s = sessions.find(x => x.id === activeSessionId) ?? null
      onPreviewSessionActivity?.(s?.activity ?? null)
    } else {
      onPreviewSessionActivity?.(null)
    }
    // No incluir `sessions` en deps: el polling actualizaría la vista previa y cerraría modales.
  }, [activeSessionId, onPreviewSessionActivity])

  useEffect(() => {
    if (!editingPoiId || !activeDraft) {
      setQuizDraft(null)
      setQuizDirty(false)
      return
    }
    const stored = activeDraft.quizzesByPoiId?.[editingPoiId]
    if (!stored) {
      setQuizDraft(null)
      return
    }
    setQuizDraft({
      ...stored,
      options: Array.isArray(stored.options) ? [...stored.options] : ['', '', '', ''],
    })
    setQuizDirty(false)
    setQuizSavedFlash(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPoiId, activeDraft?.id])

  function updateQuizDraft(patch) {
    setQuizDraft(prev => (prev ? { ...prev, ...patch } : prev))
    setQuizDirty(true)
    setQuizSavedFlash(false)
  }

  function saveQuizDraft() {
    if (!activeDraft || !editingPoiId || !quizDraft) return
    const next = {
      ...activeDraft.quizzesByPoiId,
      [editingPoiId]: quizDraft,
    }
    updateDraft(activeDraft.id, { quizzesByPoiId: next })
    bump()
    setQuizDirty(false)
    setQuizSavedFlash(true)
  }

  async function regenerateEditingQuiz() {
    if (!activeDraft || !editingPoiId) return

    const poi = (activeDraft.pois || []).find(p => p.id === editingPoiId)
    if (!poi) {
      setRegenError('No se encontró el POI asociado a esta pregunta.')
      return
    }

    const hasCoords = (coords) =>
      coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng))

    let location = hasCoords(activeDraft.location) ? activeDraft.location : null
    if (!location && hasCoords(poi)) {
      location = { lat: Number(poi.lat), lng: Number(poi.lng) }
    }
    if (!location) {
      const anchor = (activeDraft.pois || []).find(p => hasCoords(p))
      if (anchor) location = { lat: Number(anchor.lat), lng: Number(anchor.lng) }
    }
    if (!location) {
      setRegenError('Este borrador no tiene ubicación. Selecciona una antes de regenerar.')
      return
    }

    setRegenLoading(true)
    setRegenError(null)
    try {
      const modeToUse =
        activeDraft.generationMeta?.quizMode ??
        activeDraft.quizMode ??
        (activeDraft.type === 'route' ? 'historian' : 'explorer')
      const locationNameToUse =
        activeDraft.locationName ||
        poi.name ||
        activeDraft.city ||
        `${Number(location.lat).toFixed(4)}, ${Number(location.lng).toFixed(4)}`

      const { quizzes: generated, modelUsed, prompt, rawResponse } = await generateQuizzes(
        [poi],
        location,
        locationNameToUse,
        modeToUse
      )

      const newQuiz = generated?.[0]
      if (!newQuiz) throw new Error('No se pudo generar una pregunta válida.')

      const nextQuizzes = {
        ...(activeDraft.quizzesByPoiId || {}),
        [poi.id]: { ...newQuiz, poi_id: poi.id, poi_name: poi.name },
      }

      const nextDebug = {
        ...(activeDraft.debugLog || { steps: [] }),
        steps: [
          ...((activeDraft.debugLog?.steps || [])),
          {
            type: 'gemini-regenerate-one',
            model: modelUsed,
            prompt,
            rawResponse,
            poi: { id: poi.id, name: poi.name },
          },
        ],
      }

      updateDraft(activeDraft.id, {
        quizzesByPoiId: nextQuizzes,
        debugLog: nextDebug,
        generationMeta: {
          ...(activeDraft.generationMeta || {}),
          model: modelUsed,
          quizMode: modeToUse,
          generatedAt: new Date(),
        },
      })
      const saved = nextQuizzes[poi.id]
      setQuizDraft(saved ? { ...saved, options: [...(saved.options || [])] } : null)
      setQuizDirty(false)
      setQuizSavedFlash(false)
      bump()
    } catch (e) {
      setRegenError(e.message || 'Error al regenerar. Inténtalo de nuevo.')
    } finally {
      setRegenLoading(false)
    }
  }

  function movePoi(poiId, dir) {
    if (!activeDraft) return
    const pois = Array.isArray(activeDraft.pois) ? [...activeDraft.pois] : []
    const idx = pois.findIndex(p => p.id === poiId)
    if (idx === -1) return
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= pois.length) return
    const tmp = pois[idx]
    pois[idx] = pois[nextIdx]
    pois[nextIdx] = tmp
    updateDraft(activeDraft.id, { pois })
    bump()
  }

  function removePoi(poiId) {
    if (!activeDraft) return
    const pois = (activeDraft.pois || []).filter(p => p.id !== poiId)
    const nextQuizzes = { ...(activeDraft.quizzesByPoiId || {}) }
    delete nextQuizzes[poiId]
    if (editingPoiId === poiId) closeEditor()
    updateDraft(activeDraft.id, { pois, quizzesByPoiId: nextQuizzes })
    bump()
  }

  function computeParticipantRows(session) {
    const totalStops = (session?.activity?.pois || []).length
    const participants = session?.participants || []
    const answers = session?.answers || []

    return participants.map(p => {
      const a = answers.filter(x => x.participantId === p.id)
      const answered = a.length
      const correct = a.filter(x => x.correct).length
      const last = a.length ? a[a.length - 1] : null
      const percent = totalStops > 0 ? Math.round((answered / totalStops) * 100) : 0
      return {
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt,
        answered,
        correct,
        percent,
        lastAnsweredAt: last?.answeredAt || null,
      }
    }).sort((a, b) => (b.answered - a.answered) || (b.correct - a.correct))
  }

  function SessionQuestionModal() {
    if (!activeSession || !activeSessionPoiId) return null
    const activity = activeSession.activity || {}
    const poi = (activity.pois || []).find(p => p.id === activeSessionPoiId) || null
    const quiz = activity.quizzesByPoiId?.[activeSessionPoiId] || null
    const correctIndex = getCorrectAnswerIndex(quiz)

    const participants = activeSession.participants || []
    const answers = activeSession.answers || []
    const answersByParticipant = new Map(
      answers.filter(a => a.poiId === activeSessionPoiId).map(a => [a.participantId, a])
    )

    const correct = []
    const wrong = []
    const pending = []
    const options = Array.isArray(quiz?.options) ? quiz.options : []
    const optionCounts = new Array(options.length).fill(0)
    for (const p of participants) {
      const a = answersByParticipant.get(p.id)
      if (!a) pending.push(p)
      else {
        const idx = Number(a.selectedIndex)
        if (Number.isFinite(idx) && optionCounts[idx] != null) optionCounts[idx] += 1
        if (a.correct) correct.push(p)
        else wrong.push(p)
      }
    }
    const totalP = participants.length || 0
    const pct = (n) => totalP > 0 ? Math.round((n / totalP) * 100) : 0

    const close = () => setActiveSessionPoiId(null)

    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
        <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px]" onClick={close} />
        <div className="relative w-full max-w-[min(48rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col bg-white">
          <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">Monitorización</div>
              <div className="pl-headline text-2xl font-bold tracking-tight text-slate-900 mt-1 truncate">
                {poi?.name || quiz?.poi_name || activeSessionPoiId}
              </div>
              {quiz?.question && (
                <div className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {quiz.question}
                </div>
              )}
            </div>
            <button
              onClick={close}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div
            className="px-4 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-7 overflow-x-hidden overflow-y-auto sidebar-scroll min-w-0"
            ref={(el) => {
              if (el) el.scrollTop = sessionQuestionModalScrollTop.current
            }}
            onScroll={(e) => {
              sessionQuestionModalScrollTop.current = e.currentTarget.scrollTop
            }}
          >
            {!quiz ? (
              <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                No hay pregunta asociada a este punto.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                {quiz.context && (
                  <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase tracking-[0.2rem] text-slate-500 font-bold">
                      Contexto
                    </div>
                    <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {quiz.context}
                    </div>
                  </div>
                )}
                <div className="mt-3 grid gap-2">
                  {(quiz.options || []).map((opt, idx) => {
                    const isCorrect = correctIndex === idx
                    const c = optionCounts[idx] || 0
                    const p = pct(c)
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-sm ${
                          isCorrect ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="pl-headline text-xs font-bold text-slate-400 mr-2">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="pl-headline text-sm font-bold text-slate-800">{opt}</span>
                            {isCorrect && <span className="ml-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">Correcta</span>}
                          </div>
                          <div className="text-xs font-black text-slate-700 tabular-nums flex-shrink-0">
                            {p}%
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {quiz.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase tracking-[0.2rem] text-slate-500 font-bold">
                      Explicación
                    </div>
                    <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {quiz.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.16em]">Correctas</div>
                <div className="text-xl font-black text-emerald-900 tabular-nums">{correct.length} <span className="text-[11px] font-bold text-emerald-800/80">({pct(correct.length)}%)</span></div>
                <div className="mt-1 text-[11px] text-emerald-800/80">
                  {correct.length ? correct.map(p => p.name).join(', ') : '—'}
                </div>
              </div>
              <div className="p-3 rounded-2xl border border-red-200 bg-red-50/50">
                <div className="text-[10px] font-bold text-red-700 uppercase tracking-[0.16em]">Incorrectas</div>
                <div className="text-xl font-black text-red-900 tabular-nums">{wrong.length} <span className="text-[11px] font-bold text-red-800/80">({pct(wrong.length)}%)</span></div>
                <div className="mt-1 text-[11px] text-red-800/80">
                  {wrong.length ? wrong.map(p => p.name).join(', ') : '—'}
                </div>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-white">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em]">Sin responder</div>
                <div className="text-xl font-black text-slate-900 tabular-nums">{pending.length} <span className="text-[11px] font-bold text-slate-600">({pct(pending.length)}%)</span></div>
                <div className="mt-1 text-[11px] text-slate-600">
                  {pending.length ? pending.map(p => p.name).join(', ') : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function SessionParticipantModal() {
    if (!activeSession || !activeSessionParticipantId) return null
    const activity = activeSession.activity || {}
    const participant = (activeSession.participants || []).find(p => p.id === activeSessionParticipantId) || null
    const answers = (activeSession.answers || []).filter(a => a.participantId === activeSessionParticipantId)
    const answersByPoi = new Map(answers.map(a => [a.poiId, a]))
    const pois = activity.pois || []
    const close = () => setActiveSessionParticipantId(null)
    const total = pois.length
    const answered = answers.length
    const correct = answers.filter(a => a.correct).length

    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
        <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px]" onClick={close} />
        <div className="relative w-full max-w-[min(48rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col bg-white">
          <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">Monitorización</div>
              <div className="pl-headline text-2xl font-bold tracking-tight text-slate-900 mt-1 truncate">
                {participant?.name || activeSessionParticipantId}
              </div>
              <div className="mt-2 text-sm text-slate-600 tabular-nums">
                {answered}/{total} respondidas · {correct} correctas
              </div>
            </div>
            <button
              onClick={close}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div
            className="px-4 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-7 overflow-x-hidden overflow-y-auto sidebar-scroll min-w-0"
            ref={(el) => {
              if (el) el.scrollTop = sessionParticipantModalScrollTop.current
            }}
            onScroll={(e) => {
              sessionParticipantModalScrollTop.current = e.currentTarget.scrollTop
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-2xl border border-slate-200 bg-white">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em]">Respondidas</div>
                <div className="text-xl font-black text-slate-900 tabular-nums">{answered}</div>
              </div>
              <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.16em]">Correctas</div>
                <div className="text-xl font-black text-emerald-900 tabular-nums">{correct}</div>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/40">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em]">Pendientes</div>
                <div className="text-xl font-black text-slate-900 tabular-nums">{Math.max(0, total - answered)}</div>
              </div>
            </div>

            <div className="grid gap-2">
            {pois.map((p, idx) => {
              const q = activity.quizzesByPoiId?.[p.id] || null
              const a = answersByPoi.get(p.id) || null
              const correctIdx = getCorrectAnswerIndex(q)
              const selectedIdx = a ? Number(a.selectedIndex) : null
              const status = !a ? 'pending' : (a.correct ? 'correct' : 'wrong')

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border min-w-0 ${
                    status === 'correct'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : status === 'wrong'
                        ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-slate-900 break-words">
                        <span className="text-slate-400 tabular-nums mr-2">{idx + 1}.</span>
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 break-words">
                        {q?.question || '—'}
                      </div>
                    </div>
                    <div className="text-xs font-black tabular-nums flex-shrink-0">
                      {status === 'pending' ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className={status === 'correct' ? 'text-emerald-800' : 'text-red-800'}>
                          {String.fromCharCode(65 + selectedIdx)}
                          {Number.isFinite(correctIdx) ? ` / ${String.fromCharCode(65 + correctIdx)}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {a?.answeredAt && (
                    <div className="mt-1 text-[11px] text-slate-400 tabular-nums">
                      Respondida: {new Date(a.answeredAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function PublishedModal() {
    if (!showPublished || !publishedSession) return null
    return (
      <div className="fixed inset-0 z-[2000] flex items-start justify-center p-2 sm:p-4 pt-20 sm:pt-24 overflow-y-auto">
        <div className="absolute inset-0 bg-slate-900/30" onClick={() => setShowPublished(false)} />
        <div className="relative w-full max-w-[min(520px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl my-4">
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Publicado</div>
              <div className="text-lg font-black text-slate-900">Código de acceso</div>
              <div className="text-sm text-slate-500 mt-1">
                Comparte este código con tus alumnos para que se unan desde el botón <span className="font-black">Unirse</span>.
              </div>
            </div>
            <button
              onClick={() => setShowPublished(false)}
              className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="p-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Código</div>
                <div className="text-3xl font-black text-slate-900 tracking-widest">{publishedSession.code}</div>
              </div>
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(publishedSession.code) } catch {}
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all"
              >
                Copiar
              </button>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => setShowPublished(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function applyTemplate() {
    if (!activeDraft?.templateId) return
    const r = ROUTES.find(x => x.id === activeDraft.templateId)
    if (!r) return
    updateDraft(activeDraft.id, {
      title: r.title,
      description: r.description,
      city: r.city,
      stops: r.stops,
      orderingHint: r.orderingHint,
    })
    bump()
    onDraftUpdated?.()
  }

  async function generateRouteNow() {
    if (!activeDraft) return
    if (activeDraft.type !== 'route') return
    if (routeLoading) return

    const title = String(activeDraft.title || '').trim()
    const description = String(activeDraft.description || '').trim()
    const city = String(activeDraft.city || '').trim()
    const stops = String(activeDraft.stops || '').trim()
    const orderingHint = String(activeDraft.orderingHint || '').trim()

    if (!title || !city || !stops || !orderingHint) {
      setRouteError('Rellena al menos: título, ciudad, paradas y criterio de ordenación.')
      return
    }

    setRouteLoading(true)
    setRouteError(null)
    onSetMapLoading?.(true, 'route-gen')
    try {
      const { generateFullRoute } = await import('../../services/geminiService')
      const { enrichPOIsWithNominatim } = await import('../../services/nominatimService')

      const route = {
        id: activeDraft.id,
        title,
        description,
        city,
        stops,
        orderingHint,
      }

      const { pois: aiPois, quizzesMap, modelUsed, prompt, rawResponse } = await generateFullRoute(route)
      onSetMapLoading?.(true, 'route-verify')
      const { pois: enrichedPois, nominatimCount, aiCount } = await enrichPOIsWithNominatim(aiPois, city)

      updateDraft(activeDraft.id, {
        pois: enrichedPois,
        quizzesByPoiId: quizzesMap,
        quizMode: 'historian',
        generationMeta: {
          poiSource: 'ai',
          model: modelUsed,
          totalFound: enrichedPois.length,
          poisSelected: enrichedPois.length,
          generatedAt: new Date(),
          quizMode: 'historian',
          nominatimCount,
          aiCount,
        },
        debugLog: {
          steps: [
            ...((activeDraft.debugLog?.steps || [])),
            {
              type: 'gemini-route',
              model: modelUsed,
              prompt,
              rawResponse,
              route,
            },
            {
              type: 'nominatim-enrich',
              nominatimCount,
              aiCount,
            },
          ],
        },
      })
      bump()
      onDraftUpdated?.()
    } catch (e) {
      setRouteError(e.message || 'Error al generar la ruta.')
    } finally {
      setRouteLoading(false)
      onSetMapLoading?.(false, '')
    }
  }

  return (
    <>
      <aside
        className={`
          pl-glass border-t border-slate-200/80 shadow-2xl overflow-hidden flex flex-col rounded-none
          transition-transform duration-300 z-[900]
          fixed inset-x-0 top-16 bottom-0 w-full
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
          lg:pointer-events-auto lg:translate-x-0 lg:absolute lg:left-auto lg:right-0 lg:top-16 lg:bottom-0 lg:w-[560px] lg:max-w-[96vw] lg:border-t-0 lg:border-l lg:border-slate-200/80 lg:z-[1200]
        `.replace(/\s+/g, ' ').trim()}
      >
        <div className="lg:hidden flex-shrink-0 flex items-center justify-end px-4 py-2.5 border-b border-slate-100/80 bg-white/40">
          <button
            type="button"
            onClick={() => onMobileToggle?.(false)}
            className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white flex items-center justify-center text-slate-600"
            aria-label="Ver mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 sidebar-scroll overflow-auto flex-1 min-h-0">
          {!activeSession && (
            <div className="pt-1 pb-4 border-b border-slate-100">
              {activeDraft ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">Borrador</div>
                <div className="text-base font-black text-slate-900 truncate">{activeDraft.title}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                    {activeDraft.type === 'route' ? 'Ruta' : 'Quiz'}
                  </span>
                  <span className="tabular-nums text-[11px] text-slate-400">
                    {new Date(activeDraft.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveDraftId(null)
                  onStopPickLocation?.()
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-2"
                title="Volver a la lista"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">Creador</div>
                <div className="text-base font-black text-slate-900">Creación</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  Borradores, generación IA y sesiones.
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <PenSquare className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
            </div>
          )}
          {!activeDraft && !activeSession && (
            <div className="space-y-3">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo borrador
              </button>

              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl gap-1 w-full">
                <button
                  onClick={() => { setCreatorView('drafts'); setActiveSessionId(null) }}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-black transition-all ${
                    creatorView === 'drafts'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Borradores
                </button>
                <button
                  onClick={() => setCreatorView('sessions')}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-black transition-all ${
                    creatorView === 'sessions'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Sesiones
                </button>
              </div>
            </div>
          )}

          {!activeDraft ? (
            creatorView === 'sessions' ? (
              <div>
                {!activeSession ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          Sesiones publicadas
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Participantes y progreso.</div>
                        <label className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-slate-500 select-none">
                          <input
                            type="checkbox"
                            checked={autoRefreshSessions}
                            onChange={(e) => setAutoRefreshSessions(e.target.checked)}
                          />
                          Actualizar automáticamente
                        </label>
                      </div>
                      <div className="text-xs font-bold text-slate-400 tabular-nums">
                        {sessions.length} total
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {sessionsError && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                          {sessionsError}
                        </div>
                      )}

                      {sessionsLoading ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                          Cargando sesiones…
                        </div>
                      ) : sessions.length === 0 ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                          Aún no has publicado ninguna actividad. Abre un borrador y pulsa <span className="font-bold text-slate-700">Publicar</span>.
                        </div>
                      ) : (
                        sessions.map(s => {
                          const open = s.status === 'open'
                          return (
                            <div
                              key={s.id}
                              className={`p-3 rounded-2xl border shadow-sm transition-all ${
                                open
                                  ? 'border-emerald-200/70 bg-white/60 hover:bg-white/80 hover:border-emerald-300'
                                  : 'border-slate-200/70 bg-white/60 hover:bg-white/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    open ? 'bg-emerald-600' : 'bg-slate-600'
                                  }`}>
                                    <Upload className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-black text-slate-900 truncate">
                                      {s.activity?.title || 'Sesión'}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                                      <span className={`px-2 py-0.5 rounded-full border font-black ${
                                        open
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                          : 'bg-slate-50 text-slate-700 border-slate-200'
                                      }`}>
                                        {open ? 'Abierta' : 'Cerrada'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full border bg-white/70 text-slate-700 border-slate-200 font-black tracking-widest tabular-nums">
                                        {s.code}
                                      </span>
                                      <span className="tabular-nums text-slate-400">
                                        {s.participants?.length || 0} participantes
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    className={`px-3 py-2 rounded-xl text-white text-xs font-black transition-colors ${
                                      open ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                    onClick={() => setActiveSessionId(s.id)}
                                  >
                                    {open ? 'Abrir' : 'Ver'}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try { await closeSession(s.id); bump() } catch {}
                                    }}
                                    disabled={s.status !== 'open'}
                                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                    title="Cerrar sesión"
                                  >
                                    <X className="w-4 h-4 text-slate-700" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try { await deleteSession(s.id); bump() } catch {}
                                    }}
                                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center"
                                    title="Eliminar sesión"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Sesión</div>
                        <div className="text-lg font-black text-slate-900 truncate">{activeSession.activity?.title || 'Sesión'}</div>
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                            {activeSession.status === 'open' ? 'Abierta' : 'Cerrada'}
                          </span>
                          <span className="font-black tracking-widest text-slate-900">{activeSession.code}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSessionId(null)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-black flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={async () => { try { await navigator.clipboard.writeText(activeSession.code) } catch {} }}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm transition-all"
                      >
                        Copiar código
                      </button>
                      <button
                        onClick={async () => {
                          try { await closeSession(activeSession.id); bump() } catch {}
                        }}
                        disabled={activeSession.status !== 'open'}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm transition-all"
                      >
                        Cerrar sesión
                      </button>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl border border-slate-200/70 bg-white/60">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Monitorización</div>
                      <div className="text-sm font-black text-slate-900 mt-1">Participantes</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Progreso calculado como paradas respondidas / total de paradas.
                      </div>

                      <div className="mt-3 grid gap-2">
                        {(activeSession.participants || []).length === 0 ? (
                          <div className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-3">
                            Aún no se ha unido nadie.
                          </div>
                        ) : (
                          computeParticipantRows(activeSession).map(row => (
                            <button
                              type="button"
                              key={row.id}
                              onClick={() => setActiveSessionParticipantId(row.id)}
                              className="w-full text-left p-3 rounded-2xl bg-white/60 border border-slate-200/70 hover:bg-white/80 hover:border-blue-200 transition-all"
                              title="Ver detalle de este alumno"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-black text-slate-900 truncate">{row.name}</div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                    <span className="px-2 py-0.5 rounded-full border bg-white/70 border-slate-200 text-slate-700 font-bold tabular-nums">
                                      {row.answered}/{(activeSession.activity?.pois || []).length}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-100 text-emerald-800 font-bold tabular-nums">
                                      {row.correct} ✓
                                    </span>
                                    {row.lastAnsweredAt && (
                                      <span className="px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-500 font-bold tabular-nums">
                                        {new Date(row.lastAnsweredAt).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs font-black text-slate-900 tabular-nums">
                                  {row.percent}%
                                </div>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.percent}%` }} />
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl border border-slate-200/70 bg-white/60">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Monitorización</div>
                      <div className="text-sm font-black text-slate-900 mt-1">Preguntas</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Pulsa una parada para ver el detalle: quién acertó, quién falló y quién no ha respondido.
                      </div>

                      <div className="mt-3 grid gap-2">
                        {((activeSession.activity?.pois || []).length === 0) ? (
                          <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                            Esta sesión no tiene paradas.
                          </div>
                        ) : (
                          (activeSession.activity?.pois || []).map((p, idx) => {
                            const answeredCount = (activeSession.answers || []).filter(a => a.poiId === p.id).length
                            const totalP = (activeSession.participants || []).length
                            const hasQuiz = !!activeSession.activity?.quizzesByPoiId?.[p.id]
                            return (
                              <button
                                key={p.id}
                                onClick={() => setActiveSessionPoiId(p.id)}
                                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                title="Ver detalle de esta pregunta"
                              >
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                  <div className="min-w-0 overflow-hidden">
                                    <div className="text-sm font-black text-slate-900 truncate">
                                      <span className="text-slate-400 tabular-nums mr-2">{idx + 1}.</span>
                                      {p.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 truncate overflow-hidden">
                                      {hasQuiz ? (activeSession.activity.quizzesByPoiId[p.id]?.question || '—') : 'Sin pregunta'}
                                    </div>
                                  </div>
                                  <div className="text-xs font-black text-slate-700 tabular-nums flex-shrink-0">
                                    {answeredCount}/{totalP}
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Mis borradores
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Guardados en este navegador (localStorage). Más adelante se sincronizarán en una base de datos.
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400 tabular-nums">
                    {drafts.length} total
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {drafts.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      No tienes borradores todavía. Pulsa <span className="font-bold text-slate-700">Nuevo borrador</span> para crear el primero.
                    </div>
                  ) : (
                    drafts.map(d => (
                      <div
                        key={d.id}
                        className="p-3 rounded-2xl border border-slate-200/70 bg-white/60 hover:bg-white/80 hover:border-blue-200 shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              d.type === 'route' ? 'bg-violet-600' : 'bg-blue-600'
                            }`}>
                              {d.type === 'route'
                                ? <Wand2 className="w-5 h-5 text-white" />
                                : <MapPin className="w-5 h-5 text-white" />
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate">
                                {d.title || (d.type === 'route' ? 'Ruta' : 'Quiz')}
                              </div>
                              <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                                <span className={`px-2 py-0.5 rounded-full border font-black ${
                                  d.type === 'route'
                                    ? 'bg-violet-50 text-violet-700 border-violet-100'
                                    : 'bg-sky-50 text-sky-700 border-sky-100'
                                }`}>
                                  {d.type === 'route' ? 'Ruta' : 'Quiz'}
                                </span>
                                {d.lastPublished?.code && (
                                  <span className="px-2 py-0.5 rounded-full border bg-white/70 text-slate-700 border-slate-200 font-black tracking-widest tabular-nums">
                                    {d.lastPublished.code}
                                  </span>
                                )}
                                <span className="tabular-nums text-slate-400">
                                  {new Date(d.updatedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors"
                              onClick={() => setActiveDraftId(d.id)}
                            >
                              Abrir
                            </button>
                            <button
                              onClick={() => { duplicateDraft(d.id); bump() }}
                              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                              onClick={() => { deleteDraft(d.id); bump() }}
                              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {activeDraft.type === 'explore_quiz' && (
                <div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <PencilLine className="w-4 h-4 text-blue-600" />
                    Datos básicos
                  </div>
                  <div className="mt-3 grid gap-2">
                    <label className="text-xs font-bold text-slate-500">Título</label>
                    <input
                      value={activeDraft.title}
                      onChange={(e) => {
                        updateDraft(activeDraft.id, { title: e.target.value })
                        bump()
                      }}
                      placeholder="Ej.: Quiz del barrio gótico"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

              {activeDraft.type === 'explore_quiz' && (
                <div>
                  <div className="text-sm font-black text-slate-900">Generación</div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500">Radio (m)</label>
                      <input
                        type="number"
                        min={100}
                        max={2000}
                        step={50}
                        value={activeDraft.radius ?? 500}
                        onChange={(e) => {
                          updateDraft(activeDraft.id, { radius: Number(e.target.value) })
                          bump()
                        }}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">Modo</label>
                      <select
                        value={activeDraft.quizMode ?? 'explorer'}
                        onChange={(e) => {
                          updateDraft(activeDraft.id, { quizMode: e.target.value })
                          bump()
                        }}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="explorer">Sencillo</option>
                        <option value="historian">Intermedio</option>
                        <option value="analyst">Razonamiento</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onGenerateQuiz?.()}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm transition-all"
                    >
                      {loading
                        ? (loadingStep === 'pois'
                          ? 'Buscando lugares…'
                          : loadingStep === 'quizzes'
                            ? 'Generando preguntas…'
                            : 'Generando quiz…')
                        : 'Generar quiz'}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                      {error}
                    </div>
                  )}

                  {activeDraft.generationMeta && (
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="font-bold text-slate-700">Última generación</div>
                      <div className="mt-1">
                        Fuente POIs: <span className="font-bold">{activeDraft.generationMeta.poiSource}</span> · Modelo:{' '}
                        <span className="font-bold">{activeDraft.generationMeta.model || '—'}</span>
                      </div>
                      <div className="mt-0.5">
                        POIs: <span className="font-bold">{activeDraft.generationMeta.poisSelected ?? 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeDraft.type === 'route' && (
                <div>
                  <div className="text-sm font-black text-slate-900">Ruta por temática</div>
                  <div className="text-xs text-slate-500 mt-1">Selecciona una plantilla o define una ruta nueva.</div>

                  <div className="mt-3">
                    <FieldLabel
                      hint="Opcional. Puedes dejarla vacía o elegir una plantilla predeterminada y pulsar «Aplicar» para rellenar los campos."
                    >
                      Plantilla
                    </FieldLabel>
                    <div className="mt-1 flex items-center gap-2">
                      <select
                        value={activeDraft.templateId ?? ''}
                        onChange={(e) => {
                          const id = e.target.value
                          updateDraft(activeDraft.id, { templateId: id })
                          bump()
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Sin plantilla</option>
                        {ROUTES.map(r => (
                          <option key={r.id} value={r.id}>{r.title}</option>
                        ))}
                      </select>
                      <button
                        onClick={applyTemplate}
                        disabled={!activeDraft.templateId}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-black text-xs transition-all whitespace-nowrap"
                        title="Rellenar campos con la plantilla"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <FieldLabel hint="Nombre de la ruta. La IA lo usará como referencia del título al generarla.">
                      Título
                    </FieldLabel>
                    <input
                      value={activeDraft.title}
                      onChange={(e) => { updateDraft(activeDraft.id, { title: e.target.value }); bump() }}
                      placeholder="Ej.: Arte modernista en Barcelona"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <FieldLabel hint="Describe el tema, el enfoque y cualquier detalle o matiz que quieras en la ruta generada.">
                      Descripción
                    </FieldLabel>
                    <textarea
                      value={activeDraft.description ?? ''}
                      onChange={(e) => { updateDraft(activeDraft.id, { description: e.target.value }); bump() }}
                      rows={3}
                      placeholder="Ej.: Ruta sobre arquitectura modernista, edificios de Gaudí y contexto histórico del Eixample…"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel hint="Ciudad o zona donde tendrá lugar la ruta.">
                          Ciudad
                        </FieldLabel>
                        <input
                          value={activeDraft.city ?? ''}
                          onChange={(e) => { updateDraft(activeDraft.id, { city: e.target.value }); bump() }}
                          placeholder="Ej.: Barcelona"
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <FieldLabel hint="Número aproximado de paradas que tendrá la ruta.">
                          Paradas
                        </FieldLabel>
                        <input
                          value={activeDraft.stops ?? ''}
                          onChange={(e) => { updateDraft(activeDraft.id, { stops: e.target.value }); bump() }}
                          placeholder="Ej.: 5–6"
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    <FieldLabel hint="Indica cómo ordenar los puntos de la ruta (p. ej. alfabético, cronológico por fecha del monumento).">
                      Criterio de ordenación
                    </FieldLabel>
                    <textarea
                      value={activeDraft.orderingHint ?? ''}
                      onChange={(e) => { updateDraft(activeDraft.id, { orderingHint: e.target.value }); bump() }}
                      rows={3}
                      placeholder="Ej.: orden cronológico por fecha de construcción del monumento"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Plantilla seleccionada:{' '}
                    <span className="font-bold text-slate-700">
                      {activeDraft.templateId ? (ROUTES.find(r => r.id === activeDraft.templateId)?.title || activeDraft.templateId) : '—'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={generateRouteNow}
                      disabled={routeLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm transition-all"
                    >
                      {routeLoading ? 'Generando ruta…' : 'Generar ruta'}
                    </button>
                  </div>

                  {routeError && (
                    <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                      {routeError}
                    </div>
                  )}

                  {activeDraft.pois?.length > 0 && (
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      Ruta generada: <span className="font-bold">{activeDraft.pois.length}</span> paradas ·{' '}
                      <span className="font-bold">{Object.keys(activeDraft.quizzesByPoiId || {}).length}</span> preguntas
                    </div>
                  )}
                </div>
              )}

              {(activeDraft.type === 'explore_quiz' || activeDraft.type === 'route') && (
                <div className="p-4 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {activeDraft.type === 'route' ? 'Paradas y preguntas' : 'Preguntas'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {activeDraft.pois?.length ? `${activeDraft.pois.length} paradas` : 'Aún no hay paradas'} ·{' '}
                        {Object.keys(activeDraft.quizzesByPoiId || {}).length} preguntas
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {(activeDraft.pois || []).length === 0 ? (
                      <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        Genera primero las paradas y preguntas para poder editarlas.
                      </div>
                    ) : (
                      (activeDraft.pois || []).map((poi, index) => {
                        const has = !!activeDraft.quizzesByPoiId?.[poi.id]
                        return (
                          <button
                            key={poi.id}
                            onClick={() => has && onEditingPoiChange?.(poi.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all overflow-hidden ${
                              has
                                ? 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                                : 'border-slate-200 bg-slate-50 opacity-80 cursor-not-allowed'
                            }`}
                            disabled={!has}
                            title={has ? 'Editar pregunta' : 'Generando…'}
                          >
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                              <div className="min-w-0 overflow-hidden">
                                <div className="text-sm font-black text-slate-900 truncate">
                                  <span className="text-slate-400 tabular-nums mr-2">{index + 1}.</span>
                                  {poi.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 leading-snug overflow-hidden break-words">
                                  <span className="block max-h-[2.6em] overflow-hidden text-ellipsis">
                                    {activeDraft.quizzesByPoiId?.[poi.id]?.question || '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {has && (
                                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-600 mr-1">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Editar
                                  </span>
                                )}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); movePoi(poi.id, -1) }}
                                    disabled={index === 0}
                                    className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                    title="Subir"
                                  >
                                    <ChevronUp className="w-4 h-4 text-slate-700" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); movePoi(poi.id, 1) }}
                                    disabled={index === (activeDraft.pois?.length ?? 0) - 1}
                                    className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                    title="Bajar"
                                  >
                                    <ChevronDown className="w-4 h-4 text-slate-700" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePoi(poi.id) }}
                                    className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center"
                                    title="Eliminar parada"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                              </div>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {activeDraft.type === 'explore_quiz' && (
                <div>
                  <div className="text-sm font-black text-slate-900">Ubicación</div>
                  <div className="mt-2 text-sm text-slate-600">
                    {activeDraft.location
                      ? `Seleccionada: ${Number(activeDraft.location.lat).toFixed(5)}, ${Number(activeDraft.location.lng).toFixed(5)}`
                      : 'Aún no has seleccionado una ubicación.'}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {!pickLocationActive ? (
                      <button
                        onClick={() => onStartPickLocation?.()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all"
                      >
                        Elegir en el mapa
                      </button>
                    ) : (
                      <button
                        onClick={() => onStopPickLocation?.()}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm transition-all"
                      >
                        Cancelar selección
                      </button>
                    )}
                    {pickLocationActive && (
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">
                        Haz click en el mapa…
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-200">
                <div className="text-sm font-black text-slate-900">Acciones</div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!creatorId || !activeDraft) return
                      const hasContent = (activeDraft.pois || []).length > 0 && Object.keys(activeDraft.quizzesByPoiId || {}).length > 0
                      if (!hasContent) return
                      ;(async () => {
                        try {
                          const session = await publishDraftToSession({ creatorId, draft: activeDraft })
                          updateDraft(activeDraft.id, {
                            lastPublished: {
                              sessionId: session.id,
                              code: session.code,
                              status: session.status,
                              publishedAt: session.createdAt,
                            },
                          })
                          setSessions(prev => {
                            const i = prev.findIndex(s => s.id === session.id)
                            if (i >= 0) {
                              const next = [...prev]
                              next[i] = session
                              return next
                            }
                            return [session, ...prev]
                          })
                          onPreviewSessionActivity?.(session.activity ?? null)
                          bump()
                          setPublishedSession(session)
                          setShowPublished(true)
                          setCreatorView('sessions')
                          setActiveDraftId(null)
                          setActiveSessionId(session.id)
                        } catch {}
                      })()
                    }}
                    disabled={
                      !(activeDraft?.pois?.length > 0 && Object.keys(activeDraft?.quizzesByPoiId || {}).length > 0)
                    }
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm flex items-center gap-2 transition-all"
                    title="Publica y genera un código para alumnos"
                  >
                    <Upload className="w-4 h-4" />
                    Publicar
                  </button>
                  <button
                    onClick={() => { duplicateDraft(activeDraft.id); bump() }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>
                  <button
                    onClick={() => { deleteDraft(activeDraft.id); setActiveDraftId(null); bump() }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-red-700 font-black text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>

                {activeDraft?.lastPublished?.code && (
                  <div className="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Código (última publicación)</div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <div className="text-lg font-black text-slate-900 tracking-widest">{activeDraft.lastPublished.code}</div>
                      <button
                        onClick={async () => {
                          try { await navigator.clipboard.writeText(activeDraft.lastPublished.code) } catch {}
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-sm font-black transition-all"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
      <CreateDraftModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
      <QuizEditorModal
        open={!!(activeDraft && editingPoiId && quizDraft)}
        quiz={quizDraft}
        poiLabel={quizDraft?.poi_name || quizDraft?.poi_id || ''}
        movePoiId={movePoiId}
        regenLoading={regenLoading}
        regenError={regenError}
        quizDirty={quizDirty}
        quizSavedFlash={quizSavedFlash}
        onClose={closeEditor}
        onUpdate={updateQuizDraft}
        onSave={saveQuizDraft}
        onRegenerate={regenerateEditingQuiz}
        onStartMovePoi={(poiId) => {
          onStartMovePoi?.(poiId)
          onEditingPoiChange?.(null)
        }}
        onCancelMovePoi={onCancelMovePoi}
      />
      <PublishedModal />
      <SessionQuestionModal />
      <SessionParticipantModal />
    </>
  )
}

