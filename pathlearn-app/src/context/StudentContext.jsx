import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'expo-router'
import { generateFullRoute, generatePOIsAndQuizzes, generateQuizzes } from '../services/geminiService'
import { enrichPOIsWithNominatim } from '../services/nominatimService'
import { fetchPOIImages } from '../services/wikipediaService'
import { fetchPOIs } from '../services/overpassService'
import { recordAnswer } from '../services/sessionStorageService'
import { saveQuiz as saveQuizStorage, saveRoute as saveRouteStorage } from '../services/storageService'

const StudentContext = createContext(null)

export function StudentProvider({ children }) {
  const router = useRouter()

  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  const [selectedRoute, setSelectedRoute] = useState(null)
  const [routeActive, setRouteActive] = useState(false)
  const [routeWaypoints, setRouteWaypoints] = useState([])
  const [routeQuizzes, setRouteQuizzes] = useState({})
  const [routeAnswers, setRouteAnswers] = useState({})
  const [routeImages, setRouteImages] = useState({})
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeLoadingStep, setRouteLoadingStep] = useState('')
  const [routeError, setRouteError] = useState(null)
  const [routeMeta, setRouteMeta] = useState(null)

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [pois, setPois] = useState([])
  const [quizzes, setQuizzes] = useState({})
  const [poiImages, setPoiImages] = useState({})
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [radius, setRadius] = useState(500)
  const [quizMode, setQuizMode] = useState('explorer')
  const [error, setError] = useState(null)
  const [quizFailed, setQuizFailed] = useState(false)
  const [generationMeta, setGenerationMeta] = useState(null)
  const [debugLog, setDebugLog] = useState(null)

  const [joinedSession, setJoinedSession] = useState(null)

  const [savedToast, setSavedToast] = useState('')

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

  const handleLocationSelect = useCallback(
    async latlng => {
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
    },
    [reverseGeocode]
  )

  const handleSelectRoute = useCallback(route => {
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
    setMobilePanelOpen(false)

    try {
      const { pois: aiPois, quizzesMap, modelUsed, prompt, rawResponse } =
        await generateFullRoute(selectedRoute)

      setRouteLoadingStep('verifying')
      const { pois: enrichedPois, nominatimCount, aiCount } =
        await enrichPOIsWithNominatim(aiPois, selectedRoute.city)

      setRouteWaypoints(enrichedPois)
      setRouteQuizzes(quizzesMap)
      setRouteActive(true)
      setRouteMeta({
        model: modelUsed,
        totalPOIs: enrichedPois.length,
        nominatimCount,
        aiCount,
        generatedAt: new Date(),
        prompt,
        rawResponse,
      })

      fetchPOIImages(enrichedPois).then(imgs => setRouteImages(imgs))
    } catch (err) {
      setRouteError(err.message || 'Error al generar la ruta.')
    } finally {
      setRouteLoading(false)
      setRouteLoadingStep('')
    }
  }, [selectedRoute, routeLoading])

  const handleRouteWaypointClick = useCallback(
    poi => {
      if (routeQuizzes[poi.id]) {
        router.push({
          pathname: '/quiz/[poiId]',
          params: { poiId: String(poi.id), mode: 'discover' },
        })
      }
    },
    [routeQuizzes, router]
  )

  const handleRouteAnswer = useCallback(
    (poiId, selectedIndex) => {
      const quiz = routeQuizzes[poiId]
      if (!quiz) return
      const isCorrect = selectedIndex === Number(quiz.correct_answer)
      setRouteAnswers(prev => ({
        ...prev,
        [poiId]: { selected: selectedIndex, correct: isCorrect },
      }))

      if (joinedSession?.session?.code && joinedSession?.participant?.id) {
        recordAnswer(
          joinedSession.session.code,
          joinedSession.participant.id,
          poiId,
          selectedIndex,
          isCorrect
        )
      }
    },
    [routeQuizzes, joinedSession]
  )

  const handleGenerateQuiz = useCallback(async () => {
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
    setMobilePanelOpen(false)

    try {
      let fetchedPOIs = []
      let quizzesMap = {}
      let meta = { generatedAt: new Date(), quizMode }

      setLoadingStep('pois')
      let overpassResult = null
      try {
        overpassResult = await fetchPOIs(selectedLocation.lat, selectedLocation.lng, radius)
        fetchedPOIs = overpassResult.pois
      } catch (poiErr) {
        console.warn('[PathLearn] Overpass falló:', poiErr.message)
      }

      if (fetchedPOIs.length > 0) {
        meta.poiSource = 'overpass'
        meta.endpoint = overpassResult.endpointUsed
        meta.totalFound = overpassResult.totalFound
        meta.poisSelected = fetchedPOIs.length

        setPois(fetchedPOIs)
        fetchPOIImages(fetchedPOIs).then(imgs => setPoiImages(imgs))

        setLoadingStep('quizzes')
        const { quizzes: generated, modelUsed, prompt, rawResponse } =
          await generateQuizzes(fetchedPOIs, selectedLocation, locationName, quizMode)
        generated.forEach(q => {
          if (q.poi_id) quizzesMap[q.poi_id] = q
        })
        setQuizzes(quizzesMap)
        meta.model = modelUsed

        setDebugLog({
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
        })
      } else {
        setLoadingStep('ai-all')
        const result = await generatePOIsAndQuizzes(
          selectedLocation,
          locationName,
          radius,
          quizMode
        )
        fetchedPOIs = result.pois
        quizzesMap = result.quizzesMap

        meta.poiSource = 'ai'
        meta.poisSelected = fetchedPOIs.length
        meta.totalFound = fetchedPOIs.length
        meta.model = result.modelUsed

        setPois(fetchedPOIs)
        setQuizzes(quizzesMap)
        fetchPOIImages(fetchedPOIs).then(imgs => setPoiImages(imgs))

        setDebugLog({
          steps: [
            {
              type: 'gemini-all',
              model: result.modelUsed,
              prompt: result.prompt,
              rawResponse: result.rawResponse,
              poisGenerated: fetchedPOIs,
            },
          ],
        })
      }

      setGenerationMeta(meta)

      if (fetchedPOIs.length === 0) {
        setError(
          'No se encontraron puntos de interés. Prueba una ciudad o zona turística conocida.'
        )
      }
    } catch (err) {
      setError(err.message || 'Ha ocurrido un error inesperado.')
      setQuizFailed(true)
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }, [selectedLocation, loading, locationName, radius, quizMode])

  const handlePOIClick = useCallback(
    poi => {
      if (quizzes[poi.id]) {
        router.push({
          pathname: '/quiz/[poiId]',
          params: { poiId: String(poi.id), mode: 'explore' },
        })
      }
    },
    [quizzes, router]
  )

  const handleAnswer = useCallback(
    (poiId, selectedIndex) => {
      const quiz = quizzes[poiId]
      if (!quiz) return
      const isCorrect = selectedIndex === Number(quiz.correct_answer)
      setAnswers(prev => ({
        ...prev,
        [poiId]: { selected: selectedIndex, correct: isCorrect },
      }))

      if (joinedSession?.session?.code && joinedSession?.participant?.id) {
        recordAnswer(
          joinedSession.session.code,
          joinedSession.participant.id,
          poiId,
          selectedIndex,
          isCorrect
        )
      }
    },
    [quizzes, joinedSession]
  )

  const handleSaveQuiz = useCallback(
    async name => {
      const record = await saveQuizStorage({
        name,
        location: selectedLocation,
        locationName,
        radius,
        generationMeta,
        debugLog,
        pois,
        quizzes,
      })
      setSavedToast(`"${record.name}" guardado`)
      setTimeout(() => setSavedToast(''), 3000)
    },
    [selectedLocation, locationName, radius, generationMeta, debugLog, pois, quizzes]
  )

  const handleSaveRoute = useCallback(
    async name => {
      const record = await saveRouteStorage({
        name,
        route: selectedRoute,
        generationMeta: routeMeta,
        pois: routeWaypoints,
        quizzes: routeQuizzes,
      })
      setSavedToast(`"${record.name}" guardada`)
      setTimeout(() => setSavedToast(''), 3000)
    },
    [selectedRoute, routeMeta, routeWaypoints, routeQuizzes]
  )

  const handleLoadQuiz = useCallback(
    record => {
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
      router.replace('/(tabs)/explore')
    },
    [router]
  )

  const handleLoadRoute = useCallback(
    record => {
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
      router.replace('/(tabs)/discover')
    },
    [router]
  )

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

  const applyJoinedSession = useCallback(({ session, participant }) => {
    setJoinedSession({ session, participant })
    const activity = session.activity || {}
    const isRoute = activity.type === 'route'

    setError(null)
    setQuizFailed(false)

    if (isRoute) {
      setSelectedRoute(null)
      setRouteWaypoints(activity.pois ?? [])
      setRouteQuizzes(activity.quizzesByPoiId ?? {})
      setRouteAnswers({})
      setRouteImages({})
      setRouteError(null)
      setRouteMeta(activity.generationMeta ?? null)
      setRouteActive(true)
      router.replace('/(tabs)/discover')
    } else {
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
      router.replace('/(tabs)/explore')
    }
  }, [router])

  const leaveJoinedSession = useCallback(() => {
    setJoinedSession(null)

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

    setMobilePanelOpen(false)
    setSavedToast('')
  }, [])

  const score = Object.values(answers).filter(a => a.correct).length
  const total = Object.keys(quizzes).length
  const routeScore = Object.values(routeAnswers).filter(a => a.correct).length
  const routeTotal = Object.keys(routeQuizzes).length

  const exploreLocked = total > 0
  const studentHasGeneratedExplore = total > 0
  const studentHasGeneratedDiscover = routeTotal > 0

  const value = useMemo(
    () => ({
      mobilePanelOpen,
      setMobilePanelOpen,
      selectedRoute,
      setSelectedRoute,
      routeActive,
      routeWaypoints,
      routeQuizzes,
      routeAnswers,
      routeImages,
      routeLoading,
      routeLoadingStep,
      routeError,
      routeMeta,
      handleSelectRoute,
      handleGenerateRoute,
      handleRouteWaypointClick,
      handleRouteAnswer,
      selectedLocation,
      locationName,
      pois,
      quizzes,
      poiImages,
      answers,
      loading,
      loadingStep,
      radius,
      setRadius,
      quizMode,
      setQuizMode,
      error,
      quizFailed,
      generationMeta,
      debugLog,
      handleLocationSelect,
      handleGenerateQuiz,
      handlePOIClick,
      handleAnswer,
      handleResetExplore,
      handleSaveQuiz,
      handleSaveRoute,
      handleLoadQuiz,
      handleLoadRoute,
      score,
      total,
      routeScore,
      routeTotal,
      exploreLocked,
      studentHasGeneratedExplore,
      studentHasGeneratedDiscover,
      joinedSession,
      applyJoinedSession,
      leaveJoinedSession,
      savedToast,
      reverseGeocode,
    }),
    [
      mobilePanelOpen,
      selectedRoute,
      routeActive,
      routeWaypoints,
      routeQuizzes,
      routeAnswers,
      routeImages,
      routeLoading,
      routeLoadingStep,
      routeError,
      routeMeta,
      handleSelectRoute,
      handleGenerateRoute,
      handleRouteWaypointClick,
      handleRouteAnswer,
      selectedLocation,
      locationName,
      pois,
      quizzes,
      poiImages,
      answers,
      loading,
      loadingStep,
      radius,
      quizMode,
      error,
      quizFailed,
      generationMeta,
      debugLog,
      handleLocationSelect,
      handleGenerateQuiz,
      handlePOIClick,
      handleAnswer,
      handleResetExplore,
      handleSaveQuiz,
      handleSaveRoute,
      handleLoadQuiz,
      handleLoadRoute,
      score,
      total,
      routeScore,
      routeTotal,
      exploreLocked,
      studentHasGeneratedExplore,
      studentHasGeneratedDiscover,
      joinedSession,
      applyJoinedSession,
      leaveJoinedSession,
      savedToast,
      reverseGeocode,
    ]
  )

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  )
}

export function useStudent() {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudent debe usarse dentro de StudentProvider')
  return ctx
}
