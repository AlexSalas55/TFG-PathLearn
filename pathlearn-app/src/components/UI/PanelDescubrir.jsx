import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  MapPin,
  Save,
  ScrollText,
  Server,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native'
import { ROUTES, CATEGORY_COLORS } from '../../data/routesData'
import { fetchPOIImage } from '../../services/wikipediaService'

function RouteThumbnail({ query, title }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!query) return
    fetchPOIImage(query).then(u => u && setUrl(u))
  }, [query])

  if (!url) {
    return (
      <View className="w-full h-full bg-slate-200 items-center justify-center">
        <Text className="text-3xl opacity-30">🗺️</Text>
      </View>
    )
  }
  return <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
}

function PanelLabel({ children }) {
  return (
    <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 mb-2">{children}</Text>
  )
}

function RouteGenerationInfo({ meta, onShowLog, hasLog }) {
  const [open, setOpen] = useState(false)
  if (!meta) return null

  const time = new Date(meta.generatedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const allVerified = meta.aiCount === 0

  return (
    <View className="mx-5 mt-3 mb-1 rounded-xl border border-slate-200/70 bg-white/80 overflow-hidden">
      <Pressable onPress={() => setOpen(v => !v)} className="flex-row items-center justify-between px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Brain size={14} color="#2563eb" />
          <Text className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">AI Model Core</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {hasLog && (
            <Pressable
              onPress={e => {
                e?.stopPropagation?.()
                onShowLog?.()
              }}
              hitSlop={8}
            >
              <View className="flex-row items-center gap-1">
                <ScrollText size={12} color="#94a3b8" />
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Log</Text>
              </View>
            </Pressable>
          )}
          {open ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
        </View>
      </Pressable>

      {open && (
        <View className="border-t border-slate-200/60 px-3 pt-3 pb-3 gap-1.5">
          {meta.model && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Brain size={12} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400">Modelo</Text>
              </View>
              <Text className="text-[10px] font-mono text-slate-600 font-semibold max-w-[150px]" numberOfLines={1}>
                {meta.model}
              </Text>
            </View>
          )}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Server size={12} color="#94a3b8" />
              <Text className="text-[11px] text-slate-400">Coords.</Text>
            </View>
            <Text
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                allVerified ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {allVerified
                ? `${meta.nominatimCount} vía Nominatim`
                : `${meta.nominatimCount} OSM · ${meta.aiCount} IA`}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={12} color="#94a3b8" />
              <Text className="text-[11px] text-slate-400">Paradas</Text>
            </View>
            <Text className="text-[11px] font-bold text-slate-600">{meta.totalPOIs}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Clock size={12} color="#94a3b8" />
              <Text className="text-[11px] text-slate-400">Hora</Text>
            </View>
            <Text className="text-[11px] text-slate-500">{time}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

function RouteCard({ route, selected, onSelect }) {
  const categoryColor = CATEGORY_COLORS[route.category] || 'bg-slate-100 text-slate-600'

  return (
    <Pressable
      onPress={() => onSelect(route)}
      className={`w-full rounded-xl overflow-hidden border-2 mb-3 ${selected ? 'border-blue-500' : 'border-slate-200'}`}
    >
      <View className="h-28 relative overflow-hidden bg-slate-100">
        <RouteThumbnail query={route.thumbnailQuery} title={route.title} />
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute bottom-2 left-3 right-3">
          <Text className="text-sm font-black text-white leading-tight">{route.title}</Text>
        </View>
        {selected && (
          <View className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        )}
      </View>
      <View className="px-3 py-2.5 bg-white">
        <Text className="text-[11px] text-slate-500 leading-snug mb-2" numberOfLines={2}>
          {route.description}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor}`}>{route.category}</Text>
          <Text className="text-[10px] text-slate-400 flex-row items-center">
            {route.stops} paradas · {route.duration}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function PanelDescubrir({
  selectedRoute,
  onSelectRoute,
  onGenerate,
  onSaveRoute,
  canSaveRoute,
  loading,
  loadingStep,
  error,
  routeActive,
  routeWaypoints,
  routeQuizzes,
  routeAnswers,
  onWaypointClick,
  score,
  total,
  routeMeta,
  onShowDebug,
  hasDebug,
  onClosePanel,
}) {
  const hasWaypoints = routeWaypoints.length > 0
  const answeredCount = Object.keys(routeAnswers).length
  const progress = total > 0 ? (answeredCount / total) * 100 : 0
  const allAnswered = total > 0 && answeredCount === total

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-5 pb-4 border-b border-slate-100 flex-row items-start justify-between gap-2">
        <View className="flex-1 min-w-0">
          <PanelLabel>Rutas de aprendizaje</PanelLabel>
          <Text className="text-xs text-slate-400 leading-relaxed">
            Selecciona una ruta temática y genera las preguntas para recorrerla.
          </Text>
        </View>
        <Pressable onPress={() => onClosePanel?.()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white items-center justify-center">
          <X size={20} color="#475569" />
        </Pressable>
      </View>

      {selectedRoute && (
        <View className="px-5 py-4 border-b border-slate-100 gap-2">
          {!routeActive ? (
            <Pressable
              onPress={() => {
                onClosePanel?.()
                onGenerate?.()
              }}
              disabled={loading}
              className="w-full py-3 bg-blue-600 rounded-xl items-center justify-center flex-row gap-2 disabled:bg-slate-100"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Zap size={16} color="#fff" />
                  <Text className="text-white font-bold text-sm uppercase tracking-wide">Generar ruta</Text>
                </>
              )}
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onGenerate}
                disabled={loading}
                className="w-full py-3 bg-blue-600 rounded-xl items-center justify-center flex-row gap-2 disabled:bg-slate-100"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Zap size={16} color="#fff" />
                    <Text className="text-white font-bold text-sm uppercase tracking-wide">Regenerar ruta</Text>
                  </>
                )}
              </Pressable>

              {canSaveRoute && (
                <Pressable
                  onPress={onSaveRoute}
                  disabled={loading}
                  className="w-full py-2 border border-slate-200 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Save size={14} color="#475569" />
                  <Text className="text-slate-600 font-semibold text-xs">Guardar ruta</Text>
                </Pressable>
              )}

              <View className="flex-row items-center justify-between mb-1 mt-1">
                <View className="flex-row items-center gap-1.5">
                  <Trophy size={14} color="#3b82f6" />
                  <PanelLabel>Progreso de la ruta</PanelLabel>
                </View>
                <Text className="text-[10px] font-bold text-slate-500">
                  {answeredCount}/{total}
                </Text>
              </View>
              <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
              </View>
              {allAnswered && (
                <View className="flex-row items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-1">
                  <Text className="text-xs font-bold text-blue-800">¡Ruta completada!</Text>
                  <Text className="text-xs font-black text-blue-600">
                    {score}/{total}
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => onSelectRoute(null)}
                className="w-full py-2 border border-slate-200 rounded-xl"
              >
                <Text className="text-center text-xs font-semibold text-slate-500">Cambiar ruta</Text>
              </Pressable>
            </>
          )}

          {Boolean(loading) && loadingStep === 'verifying' && (
            <Text className="text-center text-[10px] text-slate-400">Verificando coordenadas…</Text>
          )}

          {error && (
            <View className="flex-row items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2 }} />
              <Text className="text-xs text-red-600 flex-1 leading-relaxed">{error}</Text>
            </View>
          )}
        </View>
      )}

      {routeActive && <RouteGenerationInfo meta={routeMeta} onShowLog={onShowDebug} hasLog={hasDebug} />}

      {routeActive && hasWaypoints && (
        <ScrollView className="flex-1 px-5 py-3">
          <PanelLabel>Paradas ({routeWaypoints.length})</PanelLabel>
          <View className="gap-1.5 pb-8">
            {routeWaypoints.map((poi, index) => {
              const answer = routeAnswers[poi.id]
              const hasQuiz = !!routeQuizzes[poi.id]

              return (
                <Pressable
                  key={poi.id}
                  onPress={() => hasQuiz && onWaypointClick(poi)}
                  disabled={!hasQuiz}
                  className={`flex-row items-center gap-3 p-2.5 rounded-xl ${hasQuiz ? 'active:bg-blue-50' : 'opacity-60'}`}
                >
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center border-2 border-white ${
                      answer
                        ? answer.correct
                          ? 'bg-emerald-500'
                          : 'bg-red-400'
                        : hasQuiz
                          ? 'bg-blue-500'
                          : 'bg-slate-200'
                    }`}
                  >
                    <Text className="text-xs font-black text-white">
                      {answer ? (answer.correct ? '✓' : '✗') : index + 1}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className={`text-sm font-bold truncate ${hasQuiz ? 'text-slate-800' : 'text-slate-400'}`}>
                      {poi.name}
                    </Text>
                    <Text className="text-[10px] text-slate-400 capitalize mt-0.5">
                      {poi.subtype?.replace(/_/g, ' ') || poi.type}
                    </Text>
                  </View>
                  {hasQuiz && !answer && <ChevronRight size={16} color="#cbd5e1" />}
                  {!hasQuiz && <ActivityIndicator size="small" color="#cbd5e1" />}
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      )}

      {!routeActive && (
        <ScrollView className="flex-1 px-5 py-4">
          {ROUTES.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              selected={selectedRoute?.id === route.id}
              onSelect={onSelectRoute}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
