import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import QuizScreen from '../../src/components/Quiz/QuizScreen'
import { useStudent } from '../../src/context/StudentContext'

function findQuiz(map, id) {
  if (!map) return null
  const s = String(id)
  return map[s] ?? map[id] ?? null
}

export default function QuizRoute() {
  const { poiId, mode } = useLocalSearchParams()
  const router = useRouter()
  const {
    pois,
    quizzes,
    answers,
    poiImages,
    handleAnswer,
    routeWaypoints,
    routeQuizzes,
    routeAnswers,
    routeImages,
    handleRouteAnswer,
  } = useStudent()

  const isDiscover = mode === 'discover'

  const { poi, quiz, answer, imageUrl, onAnswer } = useMemo(() => {
    const list = isDiscover ? routeWaypoints : pois
    const qMap = isDiscover ? routeQuizzes : quizzes
    const aMap = isDiscover ? routeAnswers : answers
    const imgMap = isDiscover ? routeImages : poiImages

    const p = list.find(x => String(x.id) === String(poiId))
    const q = p ? findQuiz(qMap, p.id) : findQuiz(qMap, poiId)
    const a = p ? findQuiz(aMap, p.id) : findQuiz(aMap, poiId)
    const img = p ? imgMap?.[p.id] ?? imgMap?.[String(p.id)] : null

    return {
      poi: p,
      quiz: q,
      answer: a,
      imageUrl: img,
      onAnswer: isDiscover ? handleRouteAnswer : handleAnswer,
    }
  }, [
    isDiscover,
    routeWaypoints,
    pois,
    routeQuizzes,
    quizzes,
    routeAnswers,
    answers,
    routeImages,
    poiImages,
    poiId,
    handleAnswer,
    handleRouteAnswer,
  ])

  if (!poi || !quiz) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-center text-slate-600 mb-6">No se encontró el quiz para este punto.</Text>
        <Pressable onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Volver</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <QuizScreen
      poi={poi}
      quiz={quiz}
      answer={answer ?? undefined}
      imageUrl={imageUrl}
      onAnswer={onAnswer}
      onClose={() => router.back()}
    />
  )
}
