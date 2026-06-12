import React, { useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { CheckCircle, ChevronRight, MapPin, X, XCircle } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

const TYPE_LABELS = {
  historic: 'Histórico',
  tourism: 'Turístico',
  amenity: 'Cultural',
  building: 'Edificio',
  leisure: 'Ocio',
  other: 'Punto de interés',
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizScreen({ poi, quiz, answer, imageUrl, onAnswer, onClose }) {
  const [selected, setSelected] = useState(answer?.selected ?? null)
  const [imgError, setImgError] = useState(false)

  const isAnswered = answer !== undefined && answer !== null
  const hasImage = !!imageUrl && !imgError
  const correctIndex = Number(quiz.correct_answer)

  const handleSubmit = () => {
    if (selected === null) return
    onAnswer(poi.id, selected)
  }

  const getState = index => {
    if (!isAnswered) return selected === index ? 'selected' : 'idle'
    if (index === correctIndex) return 'correct'
    if (index === answer.selected && !answer.correct) return 'wrong'
    return 'dim'
  }

  const optionStyles = useMemo(
    () => ({
      idle: [
        styles.optionBase,
        { borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
      ],
      selected: [
        styles.optionBase,
        { borderColor: '#2563eb', backgroundColor: '#eff6ff', borderWidth: 2 },
      ],
      correct: [
        styles.optionBase,
        { borderColor: '#6ee7b7', backgroundColor: '#d1fae5' },
      ],
      wrong: [
        styles.optionBase,
        { borderColor: '#fca5a5', backgroundColor: '#fee2e2' },
      ],
      dim: [styles.optionBase, { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', opacity: 0.55 }],
    }),
    []
  )

  const optionTextColor = state => {
    if (state === 'idle') return '#334155'
    if (state === 'selected') return '#1e40af'
    if (state === 'correct') return '#065f46'
    if (state === 'wrong') return '#991b1b'
    return '#94a3b8'
  }

  return (
    <View className="flex-1 bg-white">
      {hasImage ? (
        <View className="h-52 w-full overflow-hidden relative bg-white">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']}
            start={{ x: 0.5, y: 0.1 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="absolute top-5 left-5 flex-row items-center gap-2 px-3 py-1 bg-white/90 rounded-full border border-slate-200">
            <MapPin size={12} color="#2563eb" />
            <Text className="text-[10px] uppercase tracking-widest font-semibold text-slate-700">
              {poi.lat?.toFixed(4)}° N, {poi.lng?.toFixed(4)}° E
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-lg border border-slate-200 bg-white/90 items-center justify-center"
          >
            <X size={18} color="#475569" />
          </Pressable>
          <View className="absolute bottom-5 left-8 right-8">
            <Text className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">Expedición actual</Text>
            <Text className="text-2xl font-bold text-slate-900 mt-1" numberOfLines={2}>
              {poi.name}
            </Text>
          </View>
          <Text className="absolute bottom-2 right-3 text-[9px] text-white/70">© Wikipedia</Text>
        </View>
      ) : (
        <View className="border-b border-slate-200 px-5 pt-6 pb-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 min-w-0">
              <Text className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">Expedición actual</Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1" numberOfLines={2}>
                {poi.name}
              </Text>
              <View className="mt-2 flex-row items-center gap-2 flex-wrap">
                <MapPin size={14} color="#2563eb" />
                <Text className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                  {poi.lat?.toFixed(4)}° N, {poi.lng?.toFixed(4)}° E
                </Text>
                <Text className="text-slate-300">•</Text>
                <Text className="text-[10px] uppercase font-semibold text-slate-500">
                  {TYPE_LABELS[poi.type] || 'Punto de interés'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white items-center justify-center"
            >
              <X size={18} color="#475569" />
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1 bg-white px-4 pt-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {quiz.context && (
          <View className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Text className="text-[10px] uppercase tracking-[0.2rem] text-slate-500 font-bold">Contexto</Text>
            <Text className="mt-2 text-sm text-slate-700 leading-relaxed">{quiz.context}</Text>
          </View>
        )}

        <View className="rounded-2xl border border-slate-200 p-5 bg-white">
          <Text className="text-slate-900 text-base leading-relaxed mb-5 font-semibold">{quiz.question}</Text>

          <View className="gap-3">
            {quiz.options.map((option, index) => {
              const state = getState(index)
              return (
                <Pressable
                  key={index}
                  onPress={() => !isAnswered && setSelected(index)}
                  disabled={isAnswered}
                  style={optionStyles[state]}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-start gap-3 flex-1 min-w-0 pr-2">
                    <Text className="text-xs font-bold text-slate-400 pt-0.5">{LETTERS[index]}</Text>
                    <Text style={{ color: optionTextColor(state) }} className="text-sm font-bold leading-snug flex-1">
                      {option}
                    </Text>
                  </View>
                  {!isAnswered && <ChevronRight size={20} color="#1d4ed8" style={{ opacity: 0.6 }} />}
                  {isAnswered && index === correctIndex && (
                    <CheckCircle size={16} color="#059669" style={styles.cornerIcon} />
                  )}
                  {isAnswered && index === answer.selected && !answer.correct && (
                    <XCircle size={16} color="#ef4444" style={styles.cornerIcon} />
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>

        {isAnswered && (
          <View
            className={`mt-6 p-4 rounded-xl border-l-4 ${
              answer.correct ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'
            }`}
          >
            <Text className={`text-sm font-bold mb-1.5 ${answer.correct ? 'text-emerald-700' : 'text-amber-700'}`}>
              {answer.correct ? '¡Correcto!' : 'No era esa…'}
            </Text>
            <Text className="text-xs text-slate-600 leading-relaxed">{quiz.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 border-t border-slate-100 bg-white">
        {!isAnswered ? (
          <Pressable
            onPress={handleSubmit}
            disabled={selected === null}
            className="w-full py-3 bg-blue-600 rounded-xl items-center disabled:bg-slate-100"
          >
            <Text className="text-white font-bold text-sm uppercase tracking-wide disabled:text-slate-400">
              Confirmar respuesta
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={onClose} className="w-full py-3 border border-slate-200 rounded-xl items-center">
            <Text className="text-slate-700 font-semibold text-sm">Volver al mapa</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  optionBase: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  cornerIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
})
