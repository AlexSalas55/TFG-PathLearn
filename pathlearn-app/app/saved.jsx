import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Trash2, BookMarked, MapPinned } from 'lucide-react-native'
import {
  deleteSaved,
  deleteSavedRoute,
  getAllSaved,
  getAllSavedRoutes,
} from '../src/services/storageService'
import { useStudent } from '../src/context/StudentContext'

export default function SavedScreen() {
  const { handleLoadQuiz, handleLoadRoute } = useStudent()
  const [quizzes, setQuizzes] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [q, r] = await Promise.all([getAllSaved(), getAllSavedRoutes()])
      setQuizzes(q)
      setRoutes(r)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

  function confirmDeleteQuiz(item) {
    Alert.alert('Eliminar', `¿Borrar «${item.name}»?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteSaved(item.id)
          refresh()
        },
      },
    ])
  }

  function confirmDeleteRoute(item) {
    Alert.alert('Eliminar', `¿Borrar «${item.name}»?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedRoute(item.id)
          refresh()
        },
      },
    ])
  }

  if (loading && quizzes.length === 0 && routes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  const empty = quizzes.length === 0 && routes.length === 0

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {empty ? (
        <Text className="text-center text-slate-500 text-sm py-10">No hay elementos guardados.</Text>
      ) : (
        <>
          {quizzes.length > 0 && (
            <>
              <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 mt-2">
                Quizzes guardados
              </Text>
              {quizzes.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleLoadQuiz(item)}
                  className="bg-white border border-slate-200 rounded-xl p-4 mb-3 flex-row items-center justify-between active:bg-blue-50"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <BookMarked size={20} color="#2563eb" />
                    <View className="flex-1 min-w-0">
                      <Text className="font-bold text-slate-900" numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text className="text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                        {item.locationName || 'Ubicación guardada'}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => confirmDeleteQuiz(item)} hitSlop={8}>
                    <Trash2 size={18} color="#94a3b8" />
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}

          {routes.length > 0 && (
            <>
              <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 mt-6">
                Rutas guardadas
              </Text>
              {routes.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleLoadRoute(item)}
                  className="bg-white border border-slate-200 rounded-xl p-4 mb-3 flex-row items-center justify-between active:bg-blue-50"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <MapPinned size={20} color="#2563eb" />
                    <View className="flex-1 min-w-0">
                      <Text className="font-bold text-slate-900" numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text className="text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                        {item.route?.title || 'Ruta'}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => confirmDeleteRoute(item)} hitSlop={8}>
                    <Trash2 size={18} color="#94a3b8" />
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  )
}
