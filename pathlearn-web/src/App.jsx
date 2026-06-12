import { generateFullRoute, generatePOIsAndQuizzes, generateQuizzes } from './services/geminiService'
import { getDraftById, updateDraft } from './services/creatorStorageService'
import { joinSession, recordAnswer } from './services/sessionStorageService'
import { saveQuiz, saveRoute } from './services/storageService'
import { useCallback, useEffect, useState } from 'react'

import CreatorPanel from './components/Creator/CreatorPanel'
import DebugModal from './components/UI/DebugModal'
import Header from './components/UI/Header'
import JoinSessionModal from './components/UI/JoinSessionModal'
import JoinedSessionBanner from './components/UI/JoinedSessionBanner'
import LeaveSessionModal from './components/UI/LeaveSessionModal'
import LoadingOverlay from './components/UI/LoadingOverlay'
import MapView from './components/Map/MapView'
import MobilePanelFAB from './components/UI/MobilePanelFAB'
import QuizModal from './components/Quiz/QuizModal'
import { ROUTES } from './data/routesData'
import RoleDrawer from './components/UI/RoleDrawer'
import RoutePanel from './components/Routes/RoutePanel'
import SaveQuizModal from './components/UI/SaveQuizModal'
import SaveRouteModal from './components/UI/SaveRouteModal'
import SavedQuizzesModal from './components/UI/SavedQuizzesModal'
import Sidebar from './components/UI/Sidebar'
import StudentTutorialModal from './components/UI/StudentTutorialModal'
import { Zap } from 'lucide-react'
import { enrichPOIsWithNominatim } from './services/nominatimService'
import { fetchPOIImages } from './services/wikipediaService'
import { fetchPOIs } from './services/overpassService'

export default function App() {
  const [role, setRole] = useState('student') // 'student' | 'creator'
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [creatorActiveDraftId, setCreatorActiveDraftId] = useState(null)
  const [creatorPickLocation, setCreatorPickLocation] = useState(false)
  const [creatorLoading, setCreatorLoading] = useState(false)
  const [creatorLoadingStep, setCreatorLoadingStep] = useState('')
  const [creatorError, setCreatorError] = useState(null)
  const [creatorEditingPoiId, setCreatorEditingPoiId] = useState(null)
  const [creatorDraftTick, setCreatorDraftTick] = useState(0)
  const [creatorMovePoiId, setCreatorMovePoiId] = useState(null)
  const [creatorSessionPreview, setCreatorSessionPreview] = useState(null) // activity snapshot when viewing a published session
  const [creatorSessionPreviewPoiId, setCreatorSessionPreviewPoiId] = useState(null)
  const [creatorSessionsSummary, setCreatorSessionsSummary] = useState({ open: 0, total: 0 })
  const [creatorRequestedView, setCreatorRequestedView] = useState(null) // null | 'sessions'

  const [activeTab, setActiveTab] = useState('explore') // 'explore' | 'discover'
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false) // móvil: alternar panel / mapa
  useEffect(() => {
    setMobilePanelOpen(false)
  }, [role, activeTab])

  const [selectedRoute, setSelectedRoute]   = useState(null)
  const [routeActive, setRouteActive]       = useState(false)
  const [routeWaypoints, setRouteWaypoints] = useState([])
  const [routeQuizzes, setRouteQuizzes]     = useState({})
  const [routeAnswers, setRouteAnswers]     = useState({})
  const [routeImages, setRouteImages]       = useState({})
  const [routeLoading, setRouteLoading]     = useState(false)
  const [routeLoadingStep, setRouteLoadingStep] = useState('') // 'generating' | 'verifying'
  const [routeError, setRouteError]         = useState(null)
  const [routeMeta, setRouteMeta]           = useState(null)
  const [activeRouteQuiz, setActiveRouteQuiz] = useState(null) // { poi, quiz }

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationName, setLocationName]         = useState('')
  const [pois, setPois]                         = useState([])
  const [quizzes, setQuizzes]                   = useState({})   // { [poi.id]: quizObject }
  const [poiImages, setPoiImages]               = useState({})   // { [poi.id]: imageUrl }
  const [activeQuiz, setActiveQuiz]             = useState(null) // { poi, quiz }
  const [answers, setAnswers]                   = useState({})   // { [poi.id]: { selected, correct } }
  const [loading, setLoading]                   = useState(false)
  const [loadingStep, setLoadingStep]           = useState('')
  const [radius, setRadius]                     = useState(500)
  const [quizMode, setQuizMode]                 = useState('explorer') // 'explorer' | 'historian' | 'analyst'
  const [error, setError]                       = useState(null)
  const [quizFailed, setQuizFailed]             = useState(false)
  const [generationMeta, setGenerationMeta]     = useState(null)
  const [debugLog, setDebugLog]                 = useState(null)
  const [showDebug, setShowDebug]               = useState(false)
  const [showRouteDebug, setShowRouteDebug]     = useState(false)
  const [showSave, setShowSave]                 = useState(false)
  const [showSaveRoute, setShowSaveRoute]       = useState(false)
  const [showSaved, setShowSaved]               = useState(false)
  const [savedToast, setSavedToast]             = useState('')

  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [leaveSessionOpen, setLeaveSessionOpen] = useState(false)
  const [joinedSession, setJoinedSession] = useState(null) // { session, participant }

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      const parts = data.display_name?.split(',').slice(0, 3).join(', ')
      return parts || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }, [])

  const handleLocationSelect = useCallback(async (latlng) => {
    setSelectedLocation(latlng)
    setPois([])
    setQuizzes({})
    setAnswers({})
    setError(null)
    setQuizFailed(false)
    setGenerationMeta(null)
    setDebugLog(null)
    const name = await reverseGeocode(latlng.lat, latlng.lng)
    setLocationName(name)
  }, [reverseGeocode])

  const creatorActiveDraft = creatorActiveDraftId ? getDraftById(creatorActiveDraftId) : null
  const creatorDraftLocation = creatorActiveDraft?.location ?? null
  const creatorDraftRadius   = creatorActiveDraft?.radius ?? 500
  const creatorDraftPOIs      = creatorActiveDraft?.pois ?? []
  const creatorDraftQuizzes   = creatorActiveDraft?.quizzesByPoiId ?? {}

  const creatorPreviewActivity = !creatorActiveDraftId ? creatorSessionPreview : null
  const creatorPreviewIsRoute = creatorPreviewActivity?.type === 'route'
  const creatorPreviewLocation = creatorPreviewActivity?.location ?? null
  const creatorPreviewRadius = creatorPreviewActivity?.radius ?? 500
  const creatorPreviewPOIs = creatorPreviewActivity?.pois ?? []
  const creatorPreviewQuizzes = creatorPreviewActivity?.quizzesByPoiId ?? {}

  useEffect(() => {
    setCreatorSessionPreviewPoiId(null)
  }, [creatorSessionPreview])

  const updateCreatorDraft = useCallback((id, patch) => {
    updateDraft(id, patch)
    setCreatorDraftTick(t => t + 1)
  }, [])

  const setCreatorMapLoading = useCallback((on, step = '') => {
    setCreatorLoading(!!on)
    setCreatorLoadingStep(step || '')
  }, [])

  const handlePreviewSessionActivity = useCallback((activity) => {
    setCreatorSessionPreview(activity)
  }, [])

  const handleCreatorMapClick = useCallback(async (latlng) => {
    if (!creatorActiveDraftId) return
    const draft = getDraftById(creatorActiveDraftId)
    if (!draft) return

    if (creatorMovePoiId) {
      const nextPois = (draft.pois || []).map(p =>
        p.id === creatorMovePoiId ? { ...p, lat: latlng.lat, lng: latlng.lng, coordSource: 'manual' } : p
      )
      updateCreatorDraft(creatorActiveDraftId, { pois: nextPois })
      setCreatorMovePoiId(null)
      setCreatorEditingPoiId(null)
      return
    }

    const implicitFirstPick = draft.type === 'explore_quiz' && !draft.location
    if (!creatorPickLocation && !implicitFirstPick) return

    const name = await reverseGeocode(latlng.lat, latlng.lng)
    updateCreatorDraft(creatorActiveDraftId, { location: latlng, locationName: name, radius: creatorDraftRadius })
    setCreatorPickLocation(false)
  }, [creatorMovePoiId, creatorPickLocation, creatorActiveDraftId, creatorDraftRadius, reverseGeocode, updateCreatorDraft])

  const handleCreatorGenerateQuiz = useCallback(async () => {
    const draft = creatorActiveDraftId ? getDraftById(creatorActiveDraftId) : null
    if (!draft || creatorLoading) return
    if (draft.type !== 'explore_quiz') return
    if (!draft.location) {
      setCreatorError('Selecciona una ubicación antes de generar.')
      return
    }

    setCreatorLoading(true)
    setCreatorLoadingStep('')
    setCreatorError(null)

    try {
      const location = draft.location
      const radiusToUse = Number(draft.radius ?? 500)
      const modeToUse = draft.quizMode ?? 'explorer'
      const nameToUse =
        draft.locationName ||
        (await reverseGeocode(location.lat, location.lng))

      let fetchedPOIs = []
      let quizzesMap = {}
      let meta = { generatedAt: new Date(), quizMode: modeToUse }
      let debug = null

      setCreatorLoadingStep('pois')
      let overpassResult = null
      try {
        overpassResult = await fetchPOIs(location.lat, location.lng, radiusToUse)
        fetchedPOIs = overpassResult.pois
      } catch (poiErr) {
        console.warn('[PathLearn] Overpass falló (creator), usando IA:', poiErr.message)
      }

      if (fetchedPOIs.length > 0) {
        meta.poiSource = 'overpass'
        meta.endpoint = overpassResult.endpointUsed
        meta.totalFound = overpassResult.totalFound
        meta.poisSelected = fetchedPOIs.length

        setCreatorLoadingStep('quizzes')
        const { quizzes: generated, modelUsed, prompt, rawResponse } = await generateQuizzes(
          fetchedPOIs,
          location,
          nameToUse,
          modeToUse
        )
        generated.forEach(q => { if (q.poi_id) quizzesMap[q.poi_id] = q })
        meta.model = modelUsed

        debug = {
          steps: [
            {
              type: 'overpass',
              endpoint: overpassResult.endpointUsed,
              query: overpassResult.query,
              allPOIs: overpassResult.allPOIs,
              selectedPOIs: fetchedPOIs,
            },
            {
              type: 'gemini',
              model: modelUsed,
              prompt,
              rawResponse,
              quizCount: generated.length,
            },
          ],
        }
      } else {
        setCreatorLoadingStep('ai-all')
        const result = await generatePOIsAndQuizzes(location, nameToUse, radiusToUse, modeToUse)
        fetchedPOIs = result.pois
        quizzesMap = result.quizzesMap

        meta.poiSource = 'ai'
        meta.poisSelected = fetchedPOIs.length
        meta.totalFound = fetchedPOIs.length
        meta.model = result.modelUsed

        debug = {
          steps: [
            {
              type: 'gemini-all',
              model: result.modelUsed,
              prompt: result.prompt,
              rawResponse: result.rawResponse,
              poisGenerated: fetchedPOIs,
            },
          ],
        }
      }

      updateDraft(draft.id, {
        location: draft.location,
        locationName: nameToUse,
        radius: radiusToUse,
        quizMode: modeToUse,
        pois: fetchedPOIs,
        quizzesByPoiId: quizzesMap,
        generationMeta: meta,
        debugLog: debug,
      })
      setCreatorDraftTick(t => t + 1)
    } catch (err) {
      setCreatorError(err.message || 'Error al generar. Inténtalo de nuevo.')
    } finally {
      setCreatorLoading(false)
      setCreatorLoadingStep('')
    }
  }, [creatorActiveDraftId, creatorLoading, reverseGeocode])

  const handleSelectRoute = useCallback((route) => {
    setSelectedRoute(route)
    setRouteActive(false)
    setRouteWaypoints([])
    setRouteQuizzes({})
    setRouteAnswers({})
    setRouteImages({})
    setRouteError(null)
    setRouteMeta(null)
  }, [])

  const handleGenerateRoute = useCallback(async () => {
    if (!selectedRoute || routeLoading) return
    setRouteLoading(true)
    setRouteLoadingStep('generating')
    setRouteError(null)
    setRouteWaypoints([])
    setRouteQuizzes({})
    setRouteAnswers({})
    setRouteImages({})
    setRouteMeta(null)
    setRouteActive(false)

    try {
      const { pois: aiPois, quizzesMap, modelUsed, prompt, rawResponse } = await generateFullRoute(selectedRoute)

      setRouteLoadingStep('verifying')
      const { pois: enrichedPois, nominatimCount, aiCount } = await enrichPOIsWithNominatim(
        aiPois, selectedRoute.city
      )

      setRouteWaypoints(enrichedPois)
      setRouteQuizzes(quizzesMap)
      setRouteActive(true)
      setRouteMeta({
        model:           modelUsed,
        totalPOIs:       enrichedPois.length,
        nominatimCount,
        aiCount,
        generatedAt:     new Date(),
        prompt,
        rawResponse,
      })

      fetchPOIImages(enrichedPois).then(imgs => setRouteImages(imgs))

    } catch (err) {
      setRouteError(err.message || 'Error al generar la ruta. Inténtalo de nuevo.')
    } finally {
      setRouteLoading(false)
      setRouteLoadingStep('')
    }
  }, [selectedRoute, routeLoading])

  const handleRouteWaypointClick = useCallback((poi) => {
    if (routeQuizzes[poi.id]) {
      setActiveRouteQuiz({ poi, quiz: routeQuizzes[poi.id] })
    }
  }, [routeQuizzes])

  const handleRouteAnswer = useCallback((poiId, selectedIndex) => {
    const quiz = routeQuizzes[poiId]
    if (!quiz) return
    const isCorrect = selectedIndex === Number(quiz.correct_answer)
    setRouteAnswers(prev => ({
      ...prev,
      [poiId]: { selected: selectedIndex, correct: isCorrect },
    }))
    setActiveRouteQuiz(prev => prev ? { ...prev } : null)

    if (joinedSession?.session?.code && joinedSession?.participant?.id) {
      recordAnswer(joinedSession.session.code, joinedSession.participant.id, poiId, selectedIndex, isCorrect)
    }
  }, [routeQuizzes, joinedSession])

  const handleGenerateQuiz = async () => {
    if (!selectedLocation || loading) return

    setLoading(true)
    setError(null)
    setQuizFailed(false)
    setGenerationMeta(null)
    setDebugLog(null)
    setPois([])
    setQuizzes({})
    setAnswers({})
    setPoiImages({})

    try {
      let fetchedPOIs    = []
      let quizzesMap     = {}
      let meta           = { generatedAt: new Date(), quizMode }

      setLoadingStep('pois')
      let overpassResult = null
      try {
        overpassResult = await fetchPOIs(selectedLocation.lat, selectedLocation.lng, radius)
        fetchedPOIs    = overpassResult.pois
      } catch (poiErr) {
        console.warn('[GeoQuiz] Overpass falló, usando IA:', poiErr.message)
      }

      if (fetchedPOIs.length > 0) {
        meta.poiSource    = 'overpass'
        meta.endpoint     = overpassResult.endpointUsed
        meta.totalFound   = overpassResult.totalFound
        meta.poisSelected = fetchedPOIs.length

        setPois(fetchedPOIs)
        fetchPOIImages(fetchedPOIs).then(imgs => setPoiImages(imgs))

        setLoadingStep('quizzes')
        const { quizzes: generated, modelUsed, prompt, rawResponse } = await generateQuizzes(
          fetchedPOIs, selectedLocation, locationName, quizMode
        )
        generated.forEach(q => { if (q.poi_id) quizzesMap[q.poi_id] = q })
        setQuizzes(quizzesMap)
        meta.model = modelUsed

        setDebugLog({
          steps: [
            {
              type:         'overpass',
              endpoint:     overpassResult.endpointUsed,
              query:        overpassResult.query,
              allPOIs:      overpassResult.allPOIs,
              selectedPOIs: fetchedPOIs,
            },
            {
              type:        'gemini',
              model:       modelUsed,
              prompt,
              rawResponse,
              quizCount:   generated.length,
            },
          ],
        })

      } else {
        setLoadingStep('ai-all')
        const result = await generatePOIsAndQuizzes(selectedLocation, locationName, radius, quizMode)
        fetchedPOIs  = result.pois
        quizzesMap   = result.quizzesMap

        meta.poiSource    = 'ai'
        meta.poisSelected = fetchedPOIs.length
        meta.totalFound   = fetchedPOIs.length
        meta.model        = result.modelUsed

        setPois(fetchedPOIs)
        setQuizzes(quizzesMap)
        fetchPOIImages(fetchedPOIs).then(imgs => setPoiImages(imgs))

        setDebugLog({
          steps: [
            {
              type:        'gemini-all',
              model:       result.modelUsed,
              prompt:      result.prompt,
              rawResponse: result.rawResponse,
              poisGenerated: fetchedPOIs,
            },
          ],
        })
      }

      setGenerationMeta(meta)

      if (fetchedPOIs.length === 0) {
        setError('No se encontraron puntos de interés. Prueba una ciudad o zona turística conocida.')
      }

    } catch (err) {
      setError(err.message || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.')
      setQuizFailed(true)
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  const handlePOIClick = useCallback((poi) => {
    if (quizzes[poi.id]) {
      setActiveQuiz({ poi, quiz: quizzes[poi.id] })
    }
  }, [quizzes])

  const handleAnswer = useCallback((poiId, selectedIndex) => {
    const quiz = quizzes[poiId]
    if (!quiz) return
    const isCorrect = selectedIndex === Number(quiz.correct_answer)
    setAnswers(prev => ({
      ...prev,
      [poiId]: { selected: selectedIndex, correct: isCorrect },
    }))
    setActiveQuiz(prev => prev ? { ...prev } : null)

    if (joinedSession?.session?.code && joinedSession?.participant?.id) {
      recordAnswer(joinedSession.session.code, joinedSession.participant.id, poiId, selectedIndex, isCorrect)
    }
  }, [quizzes])

  const handleSaveQuiz = useCallback((name) => {
    const record = saveQuiz({
      name,
      location: selectedLocation,
      locationName,
      radius,
      generationMeta,
      debugLog,
      pois,
      quizzes,
    })
    setShowSave(false)
    setSavedToast(`"${record.name}" guardado`)
    setTimeout(() => setSavedToast(''), 3000)
  }, [selectedLocation, locationName, radius, generationMeta, debugLog, pois, quizzes])

  const handleLoadQuiz = useCallback((record) => {
    setSelectedLocation(record.location)
    setLocationName(record.locationName)
    setRadius(record.radius)
    setPois(record.pois ?? [])
    setQuizzes(record.quizzes ?? {})
    setAnswers({})
    setPoiImages({})
    setGenerationMeta(record.generationMeta ?? null)
    setDebugLog(record.debugLog ?? null)
    setQuizMode(record.generationMeta?.quizMode ?? 'explorer')
    setError(null)
    setQuizFailed(false)
    if (record.pois?.length) {
      fetchPOIImages(record.pois).then(imgs => setPoiImages(imgs))
    }
  }, [])

  const handleSaveRoute = useCallback((name) => {
    const record = saveRoute({
      name,
      route: selectedRoute,
      generationMeta: routeMeta,
      pois: routeWaypoints,
      quizzes: routeQuizzes,
    })
    setShowSaveRoute(false)
    setSavedToast(`"${record.name}" guardada`)
    setTimeout(() => setSavedToast(''), 3000)
  }, [selectedRoute, routeMeta, routeWaypoints, routeQuizzes])

  const score = Object.values(answers).filter(a => a.correct).length
  const total = Object.keys(quizzes).length

  const routeScore = Object.values(routeAnswers).filter(a => a.correct).length
  const routeTotal = Object.keys(routeQuizzes).length

  const exploreLocked = role === 'student' && activeTab === 'explore' && total > 0
  const studentHasGenerated = role === 'student' && (activeTab === 'explore' ? total > 0 : routeTotal > 0)

  const handleResetExplore = useCallback(() => {
    setSelectedLocation(null)
    setLocationName('')
    setPois([])
    setQuizzes({})
    setAnswers({})
    setPoiImages({})
    setGenerationMeta(null)
    setDebugLog(null)
    setError(null)
    setQuizFailed(false)
  }, [])

  const leaveJoinedSession = useCallback(() => {
    setJoinedSession(null)
    setActiveQuiz(null)
    setActiveRouteQuiz(null)
    setJoinOpen(false)
    setLeaveSessionOpen(false)
    setMobilePanelOpen(false)
    setSavedToast('')

    setSelectedLocation(null)
    setLocationName('')
    setPois([])
    setQuizzes({})
    setAnswers({})
    setPoiImages({})
    setLoading(false)
    setLoadingStep('')
    setError(null)
    setQuizFailed(false)
    setGenerationMeta(null)
    setDebugLog(null)
    setRadius(500)
    setQuizMode('explorer')

    setSelectedRoute(null)
    setRouteActive(false)
    setRouteWaypoints([])
    setRouteQuizzes({})
    setRouteAnswers({})
    setRouteImages({})
    setRouteLoading(false)
    setRouteLoadingStep('')
    setRouteError(null)
    setRouteMeta(null)
  }, [])

  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      <Header
        score={activeTab === 'explore' ? score : routeScore}
        total={activeTab === 'explore' ? total : routeTotal}
        hasQuizzes={activeTab === 'explore' ? total > 0 : routeTotal > 0}
        onShowSaved={() => setShowSaved(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
        onOpenRoleMenu={() => setRoleMenuOpen(true)}
        onJoinSession={() => setJoinOpen(true)}
        onLeaveSession={() => setLeaveSessionOpen(true)}
        joinedSession={joinedSession}
        creatorOpenSessionsCount={creatorSessionsSummary.open}
        onOpenCreatorSessions={() => setCreatorRequestedView('sessions')}
        onOpenTutorial={() => setTutorialOpen(true)}
      />

      <div className="relative overflow-hidden h-screen pt-16">
        {role === 'student' && joinedSession?.session?.code && (
          <JoinedSessionBanner
            session={joinedSession.session}
            onNavigate={() => {
              const activity = joinedSession.session.activity || {}
              setActiveTab(activity.type === 'route' ? 'discover' : 'explore')
            }}
          />
        )}
        <MapView
          selectedLocation={
            role === 'student'
              ? (activeTab === 'explore' ? selectedLocation : null)
              : (creatorActiveDraftId ? creatorDraftLocation : creatorPreviewLocation)
          }
          pois={
            role === 'student'
              ? (activeTab === 'explore' ? pois : [])
              : (creatorActiveDraftId
                ? (creatorActiveDraft?.type === 'route' ? [] : creatorDraftPOIs)
                : (creatorPreviewIsRoute ? [] : creatorPreviewPOIs))
          }
          quizzes={
            role === 'student'
              ? (activeTab === 'explore' ? quizzes : {})
              : (creatorActiveDraftId
                ? (creatorActiveDraft?.type === 'route' ? {} : creatorDraftQuizzes)
                : (creatorPreviewIsRoute ? {} : creatorPreviewQuizzes))
          }
          answers={role === 'student' && activeTab === 'explore' ? answers : {}}
          poiImages={role === 'student' && activeTab === 'explore' ? poiImages : null}
          onLocationSelect={role === 'student' ? handleLocationSelect : handleCreatorMapClick}
          onPOIClick={role === 'student'
            ? handlePOIClick
            : (poi) => {
                if (!creatorActiveDraftId && creatorPreviewActivity) {
                  setCreatorSessionPreviewPoiId(poi.id)
                } else {
                  setCreatorEditingPoiId(poi.id)
                }
              }}
          radius={role === 'student' && activeTab === 'explore'
            ? radius
            : (creatorActiveDraftId ? creatorDraftRadius : creatorPreviewRadius)}
          routeWaypoints={
            role === 'student'
              ? (activeTab === 'discover' ? routeWaypoints : [])
              : (creatorActiveDraftId
                ? (creatorActiveDraft?.type === 'route' ? creatorDraftPOIs : [])
                : (creatorPreviewIsRoute ? creatorPreviewPOIs : []))
          }
          routeQuizzes={
            role === 'student'
              ? (activeTab === 'discover' ? routeQuizzes : {})
              : (creatorActiveDraftId
                ? (creatorActiveDraft?.type === 'route' ? creatorDraftQuizzes : {})
                : (creatorPreviewIsRoute ? creatorPreviewQuizzes : {}))
          }
          routeAnswers={role === 'student' && activeTab === 'discover' ? routeAnswers : {}}
          routeImages={role === 'student' && activeTab === 'discover' ? routeImages : null}
          onRouteWaypointClick={
            role === 'student'
              ? handleRouteWaypointClick
              : (poi) => {
                  if (!creatorActiveDraftId && creatorPreviewActivity) {
                    setCreatorSessionPreviewPoiId(poi.id)
                  } else {
                    setCreatorEditingPoiId(poi.id)
                  }
                }
          }
          clickDisabled={
            role === 'student'
              ? exploreLocked
              : !(creatorMovePoiId || creatorPickLocation || (creatorActiveDraft?.type === 'explore_quiz' && !creatorActiveDraft?.location))
          }
          allowRouteMapClicks={role === 'creator' && !!creatorMovePoiId}
          cursorMode={
            role === 'creator'
              ? (creatorMovePoiId || creatorPickLocation || (creatorActiveDraft?.type === 'explore_quiz' && !creatorActiveDraft?.location) ? 'crosshair' : 'grab')
              : (exploreLocked ? 'grab' : 'crosshair')
          }
          showExploreCircle={role === 'student' && activeTab === 'explore' ? !exploreLocked : true}
        />

        {role === 'creator' && creatorMovePoiId && (
          <div className="fixed left-1/2 top-[calc(4rem+0.625rem)] z-[950] -translate-x-1/2 pointer-events-none">
            <div className="max-w-[min(calc(100vw-2rem),28rem)] whitespace-nowrap rounded-full border border-white/10 bg-slate-900/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm">
              Haz clic en el mapa para colocar el punto en la nueva posición.
            </div>
          </div>
        )}

        {((role === 'student' && (loading || routeLoading)) || (role === 'creator' && creatorLoading)) && (
          <LoadingOverlay
            step={role === 'creator'
              ? (creatorLoadingStep === 'verifying' ? 'route-verify'
                : creatorLoadingStep === 'generating' ? 'route-gen'
                  : creatorLoadingStep)
              : (activeTab === 'discover'
                ? (routeLoadingStep === 'verifying' ? 'route-verify' : 'route-gen')
                : loadingStep)}
            poisCount={role === 'creator'
              ? (creatorActiveDraft?.type === 'route' ? creatorActiveDraft?.stops : creatorDraftPOIs.length)
              : (activeTab === 'discover' ? selectedRoute?.stops : pois.length)}
          />
        )}

        {role === 'student' && activeTab === 'explore' && <Sidebar
          selectedLocation={selectedLocation}
          locationName={locationName}
          pois={pois}
          quizzes={quizzes}
          answers={answers}
          radius={radius}
          onRadiusChange={setRadius}
          quizMode={quizMode}
          onModeChange={setQuizMode}
          onGenerate={handleGenerateQuiz}
          onResetExplore={handleResetExplore}
          loading={loading}
          error={error}
          onPOIClick={handlePOIClick}
          score={score}
          total={total}
          quizFailed={quizFailed}
          generationMeta={generationMeta}
          onShowDebug={() => setShowDebug(true)}
          hasDebug={!!debugLog}
          onSaveQuiz={() => setShowSave(true)}
          canSave={total > 0}
          poiImages={poiImages}
          mobileOpen={mobilePanelOpen}
          onMobileToggle={setMobilePanelOpen}
        />}

        {role === 'student' && activeTab === 'discover' && (
          <RoutePanel
            routes={ROUTES}
            selectedRoute={selectedRoute}
            onSelectRoute={handleSelectRoute}
            onGenerate={handleGenerateRoute}
            onSaveRoute={() => setShowSaveRoute(true)}
            canSaveRoute={routeActive && routeWaypoints.length > 0 && Object.keys(routeQuizzes).length > 0}
            loading={routeLoading}
            loadingStep={routeLoadingStep}
            error={routeError}
            routeActive={routeActive}
            routeWaypoints={routeWaypoints}
            routeQuizzes={routeQuizzes}
            routeAnswers={routeAnswers}
            onWaypointClick={handleRouteWaypointClick}
            score={routeScore}
            total={routeTotal}
            routeMeta={routeMeta}
            onShowDebug={() => setShowRouteDebug(true)}
            hasDebug={!!routeMeta?.prompt || !!routeMeta?.rawResponse}
            mobileOpen={mobilePanelOpen}
            onMobileToggle={setMobilePanelOpen}
          />
        )}

        {role === 'creator' && (
          <CreatorPanel
            activeDraftId={creatorActiveDraftId}
            onActiveDraftChange={(id) => {
              setCreatorActiveDraftId(id)
              setCreatorEditingPoiId(null)
            }}
            externalTick={creatorDraftTick}
            onDraftUpdated={() => setCreatorDraftTick(t => t + 1)}
            onSetMapLoading={setCreatorMapLoading}
            pickLocationActive={creatorPickLocation}
            onStartPickLocation={() => setCreatorPickLocation(true)}
            onStopPickLocation={() => setCreatorPickLocation(false)}
            loading={creatorLoading}
            loadingStep={creatorLoadingStep}
            error={creatorError}
            onGenerateQuiz={handleCreatorGenerateQuiz}
            editingPoiId={creatorEditingPoiId}
            onEditingPoiChange={setCreatorEditingPoiId}
            movePoiId={creatorMovePoiId}
            onStartMovePoi={(poiId) => setCreatorMovePoiId(poiId)}
            onCancelMovePoi={() => setCreatorMovePoiId(null)}
            onPreviewSessionActivity={handlePreviewSessionActivity}
            sessionPoiId={creatorSessionPreviewPoiId}
            onSessionPoiChange={setCreatorSessionPreviewPoiId}
            requestedView={creatorRequestedView}
            onRequestedViewHandled={() => setCreatorRequestedView(null)}
            onSessionsSummaryChange={setCreatorSessionsSummary}
            mobileOpen={mobilePanelOpen}
            onMobileToggle={setMobilePanelOpen}
          />
        )}

        {role === 'student' && !mobilePanelOpen && !studentHasGenerated && (
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[1100] px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm sm:text-base shadow-2xl border border-blue-500/20 transition-all active:scale-[0.98]"
            aria-label={activeTab === 'discover' ? 'Generar ruta' : 'Generar quiz'}
          >
            <span className="inline-flex items-center gap-2 tracking-wide uppercase whitespace-nowrap">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              {activeTab === 'discover' ? 'Generar ruta' : 'Generar quiz'}
            </span>
          </button>
        )}

        {(role === 'creator' || (role === 'student' && studentHasGenerated)) && (
          <MobilePanelFAB
            open={mobilePanelOpen}
            onToggle={() => setMobilePanelOpen(v => !v)}
            role={role}
            activeTab={activeTab}
          />
        )}
      </div>

      <RoleDrawer
        open={roleMenuOpen}
        role={role}
        onClose={() => setRoleMenuOpen(false)}
        onChangeRole={setRole}
      />

      <JoinSessionModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={async ({ code, name }) => {
          const { session, participant } = await joinSession(code, name)
          setJoinedSession({ session, participant })

          const activity = session.activity || {}
          const isRoute = activity.type === 'route'

          setError(null)
          setQuizFailed(false)

          if (isRoute) {
            setActiveTab('discover')
            setSelectedRoute(null)
            setRouteWaypoints(activity.pois ?? [])
            setRouteQuizzes(activity.quizzesByPoiId ?? {})
            setRouteAnswers({})
            setRouteImages({})
            setRouteError(null)
            setRouteMeta(activity.generationMeta ?? null)
            setRouteActive(true)
          } else {
            setActiveTab('explore')
            setSelectedLocation(activity.location)
            setLocationName(activity.locationName || '')
            setRadius(activity.radius ?? 500)
            setQuizMode(activity.quizMode ?? 'explorer')
            setPois(activity.pois ?? [])
            setQuizzes(activity.quizzesByPoiId ?? {})
            setAnswers({})
            setPoiImages({})
            setGenerationMeta(activity.generationMeta ?? null)
            setDebugLog(activity.debugLog ?? null)

            if (activity.pois?.length) {
              fetchPOIImages(activity.pois).then(imgs => setPoiImages(imgs))
            }
          }
        }}
      />

      <LeaveSessionModal
        open={leaveSessionOpen}
        onClose={() => setLeaveSessionOpen(false)}
        onConfirm={leaveJoinedSession}
      />

      {showDebug && debugLog && (
        <DebugModal log={debugLog} onClose={() => setShowDebug(false)} />
      )}

      {showRouteDebug && routeMeta && (
        <DebugModal
          log={{
            steps: [
              {
                type: 'gemini',
                model: routeMeta.model || '—',
                prompt: routeMeta.prompt || '',
                rawResponse: routeMeta.rawResponse || '',
                quizCount: Object.keys(routeQuizzes || {}).length,
              },
            ],
          }}
          onClose={() => setShowRouteDebug(false)}
        />
      )}

      {showSave && (
        <SaveQuizModal
          generationMeta={generationMeta}
          locationName={locationName}
          poisCount={pois.length}
          onSave={handleSaveQuiz}
          onClose={() => setShowSave(false)}
        />
      )}

      {showSaveRoute && (
        <SaveRouteModal
          route={selectedRoute}
          generationMeta={routeMeta}
          poisCount={routeWaypoints.length}
          onSave={handleSaveRoute}
          onClose={() => setShowSaveRoute(false)}
        />
      )}

      {showSaved && (
        <SavedQuizzesModal
          onLoadQuiz={handleLoadQuiz}
          onLoadRoute={(record) => {
            setActiveTab('discover')
            setSelectedRoute(record.route ?? null)
            setRouteWaypoints(record.pois ?? [])
            setRouteQuizzes(record.quizzes ?? {})
            setRouteAnswers({})
            setRouteImages({})
            setRouteMeta(record.generationMeta ?? null)
            setRouteActive(true)

            if (record.pois?.length) {
              fetchPOIImages(record.pois).then(imgs => setRouteImages(imgs))
            }
          }}
          onClose={() => setShowSaved(false)}
        />
      )}

      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[4000] bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <span>✓</span> {savedToast}
        </div>
      )}

      {activeQuiz && (
        <QuizModal
          poi={activeQuiz.poi}
          quiz={activeQuiz.quiz}
          answer={answers[activeQuiz.poi.id]}
          imageUrl={poiImages[activeQuiz.poi.id] ?? null}
          onAnswer={handleAnswer}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {activeRouteQuiz && (
        <QuizModal
          poi={activeRouteQuiz.poi}
          quiz={activeRouteQuiz.quiz}
          answer={routeAnswers[activeRouteQuiz.poi.id]}
          imageUrl={routeImages[activeRouteQuiz.poi.id] ?? null}
          onAnswer={handleRouteAnswer}
          onClose={() => setActiveRouteQuiz(null)}
        />
      )}

      {role === 'student' && (
        <StudentTutorialModal
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
        />
      )}
    </div>
  )
}
