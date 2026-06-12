import React from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Slider from '@react-native-community/slider'
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Compass,
  FlaskConical,
  MapPin,
  Save,
  SlidersHorizontal,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react-native'
import GenerationInfo from './GenerationInfo'

const MODES = [
  { id: 'explorer', label: 'Sencillo', icon: Compass, desc: 'Datos y hechos básicos del lugar' },
  { id: 'historian', label: 'Intermedio', icon: BookOpen, desc: 'Contexto histórico y causas' },
  { id: 'analyst', label: 'Razonamiento', icon: FlaskConical, desc: 'Razonamiento crítico' },
]

// Colores fijos por modo (NativeWind no admite className dinámico aquí)
const MODE_ACTIVE = {
  explorer: { icon: '#0284c7', text: '#0369a1' },
  historian: { icon: '#7c3aed', text: '#6d28d9' },
  analyst: { icon: '#d97706', text: '#b45309' },
}

const TYPE_META = {
  historic: { emoji: '🏛️', label: 'Histórico' },
  tourism: { emoji: '🗺️', label: 'Turístico' },
  amenity: { emoji: '⛪', label: 'Cultural' },
  building: { emoji: '🏰', label: 'Edificio' },
  leisure: { emoji: '🌿', label: 'Ocio' },
  other: { emoji: '📍', label: 'Otro' },
}

function PanelLabel({ children }) {
  return (
    <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 mb-2">{children}</Text>
  )
}

export default function PanelExplorar({
  selectedLocation,
  locationName,
  pois,
  quizzes,
  answers,
  radius,
  onRadiusChange,
  quizMode,
  onModeChange,
  onGenerate,
  onResetExplore,
  loading,
  error,
  onPOIClick,
  score,
  total,
  quizFailed,
  generationMeta,
  onShowDebug,
  hasDebug,
  onSaveQuiz,
  canSave,
  poiImages,
  onClosePanel,
}) {
  const hasLocation = !!selectedLocation
  const hasPOIs = pois.length > 0
  const hasQuizzes = total > 0
  const answeredCount = Object.keys(answers).length
  const progress = hasQuizzes ? (answeredCount / total) * 100 : 0
  const activeMode = MODES.find(m => m.id === quizMode)

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-5 border-b border-slate-100">
        {!hasLocation ? (
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-bold text-slate-800 mb-1">Selecciona una ubicación</Text>
              <Text className="text-xs text-slate-400 leading-relaxed">
                Toca el mapa para elegir un punto y explorar lugares cercanos.
              </Text>
            </View>
            <Pressable
              onPress={() => onClosePanel?.()}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white items-center justify-center"
            >
              <X size={20} color="#475569" />
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1 min-w-0">
              <Text className="text-base font-black text-slate-900 leading-tight" numberOfLines={2}>
                {locationName}
              </Text>
              <Text className="text-[11px] text-slate-400 font-mono mt-0.5">
                {selectedLocation.lat.toFixed(4)}° N, {selectedLocation.lng.toFixed(4)}° E
              </Text>
            </View>
            <Pressable
              onPress={() => onClosePanel?.()}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white items-center justify-center"
            >
              <X size={20} color="#475569" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
        {!hasQuizzes && (
          <View className="px-6 py-5 border-b border-slate-100">
            <View className="flex-row items-center justify-between mb-2.5">
              <PanelLabel>Rango de exploración</PanelLabel>
              <Text className="text-xs font-black text-blue-600">
                {radius >= 1000 ? `${(radius / 1000).toFixed(1)} KM` : `${radius} M`}
              </Text>
            </View>
            <Slider
              minimumValue={200}
              maximumValue={2000}
              step={100}
              value={radius}
              onValueChange={onRadiusChange}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor="#2563eb"
            />
            <View className="flex-row justify-between mt-1.5">
              <Text className="text-[10px] text-slate-400">200 M</Text>
              <Text className="text-[10px] text-slate-400">2 KM</Text>
            </View>
          </View>
        )}

        {!hasQuizzes ? (
          <View className="px-6 py-5 border-b border-slate-100">
            <PanelLabel>Modo de quiz</PanelLabel>
            <View style={styles.modeRow}>
              {MODES.map(mode => {
                const Icon = mode.icon
                const active = quizMode === mode.id
                const ac = MODE_ACTIVE[mode.id] || MODE_ACTIVE.explorer
                return (
                  <Pressable
                    key={mode.id}
                    onPress={() => onModeChange(mode.id)}
                    disabled={loading}
                    style={[styles.modeBtn, active ? styles.modeBtnActive : styles.modeBtnInactive]}
                  >
                    <Icon size={14} color={active ? ac.icon : '#94a3b8'} />
                    <Text style={[styles.modeLabel, { color: active ? ac.text : '#94a3b8' }]}>{mode.label}</Text>
                  </Pressable>
                )
              })}
            </View>
            <Text className="text-[10px] text-slate-400 mt-2 text-center leading-snug">{activeMode?.desc}</Text>
          </View>
        ) : (
          <View className="px-6 py-4 border-b border-slate-100">
            <View className="flex-row items-center justify-between">
              <PanelLabel>Quiz</PanelLabel>
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">
                {activeMode?.label || '—'}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Trophy size={16} color="#2563eb" />
                <Text className="text-xs text-slate-500 font-semibold">Progreso</Text>
              </View>
              <Text className="text-xs font-black text-slate-700">
                {answeredCount}/{total}
              </Text>
            </View>
            <View className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
          </View>
        )}

        {generationMeta && (
          <GenerationInfo meta={generationMeta} onShowDebug={onShowDebug} hasDebug={hasDebug} />
        )}

        <View className="px-6 py-5 border-b border-slate-100 gap-2">
          {!hasQuizzes ? (
            <Pressable
              onPress={() => {
                onClosePanel?.()
                onGenerate?.()
              }}
              disabled={!hasLocation || loading}
              className="w-full py-3 bg-blue-600 rounded-xl items-center justify-center flex-row gap-2 disabled:bg-slate-100"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Zap size={16} color="#fff" />}
              <Text className="text-white font-bold text-sm uppercase tracking-wide disabled:text-slate-400">
                {loading ? 'Generando…' : 'Generar quiz'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onResetExplore}
              disabled={loading}
              className="w-full py-2 border border-slate-200 rounded-xl flex-row items-center justify-center gap-2"
            >
              <SlidersHorizontal size={14} color="#475569" />
              <Text className="text-slate-600 font-semibold text-xs">Cambiar zona</Text>
            </Pressable>
          )}

          {canSave && (
            <Pressable
              onPress={onSaveQuiz}
              className="w-full py-2 border border-slate-200 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Save size={14} color="#475569" />
              <Text className="text-slate-600 font-semibold text-xs">Guardar quiz</Text>
            </Pressable>
          )}

          {error && (
            <View className="flex-row items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2 }} />
              <Text className="text-xs text-red-600 flex-1 leading-relaxed">{error}</Text>
            </View>
          )}
        </View>

        <View className="px-6 pb-8">
        {hasPOIs ? (
          <View className="pt-3">
            <PanelLabel>Nearby POIs ({pois.length})</PanelLabel>
            <View className="gap-2">
              {pois.map(poi => {
                const answer = answers[poi.id]
                const hasQuiz = !!quizzes[poi.id]
                const meta = TYPE_META[poi.type] || TYPE_META.other
                const imgUrl = poiImages?.[poi.id]

                return (
                  <Pressable
                    key={poi.id}
                    onPress={() => hasQuiz && onPOIClick(poi)}
                    disabled={!hasQuiz}
                    className={`flex-row items-center gap-3 p-2.5 rounded-xl ${hasQuiz ? 'active:bg-blue-50' : 'opacity-60'}`}
                  >
                    {imgUrl ? (
                      <Image source={{ uri: imgUrl }} className="w-12 h-12 rounded-xl bg-slate-100" />
                    ) : (
                      <View className="w-12 h-12 rounded-xl bg-slate-100 items-center justify-center">
                        <Text className="text-xl">{meta.emoji}</Text>
                      </View>
                    )}
                    <View className="flex-1 min-w-0">
                      <Text
                        className={`text-sm font-bold truncate ${hasQuiz ? 'text-slate-800' : 'text-slate-500'}`}
                        numberOfLines={2}
                      >
                        {poi.name}
                      </Text>
                      <Text className="text-[10px] text-slate-400 mt-0.5">
                        {meta.label}
                        {poi.subtype ? ` · ${String(poi.subtype).replace(/_/g, ' ')}` : ''}
                      </Text>
                    </View>
                    <View>
                      {answer ? (
                        answer.correct ? (
                          <CheckCircle size={16} color="#10b981" />
                        ) : (
                          <XCircle size={16} color="#f87171" />
                        )
                      ) : hasQuiz ? (
                        <ChevronRight size={16} color="#cbd5e1" />
                      ) : quizFailed ? (
                        <AlertCircle size={14} color="#fca5a5" />
                      ) : (
                        <ActivityIndicator size="small" color="#cbd5e1" />
                      )}
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ) : (
          !loading && (
            <View className="items-center justify-center py-10 px-4">
              <View className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mb-3">
                <MapPin size={20} color="#60a5fa" />
              </View>
              <Text className="text-xs text-slate-500 text-center leading-relaxed">
                {hasLocation ? 'Pulsa «Generar quiz» para descubrir lugares cercanos' : 'Selecciona un punto en el mapa'}
              </Text>
            </View>
          )
        )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  modeBtnInactive: {
    backgroundColor: 'transparent',
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
})
