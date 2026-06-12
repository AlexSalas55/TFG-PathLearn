import React, { useCallback } from 'react'
import { Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useStudent } from '../../context/StudentContext'

/** Banner de sesión unida; al pulsar va al tab correspondiente. */
export default function JoinedSessionBanner() {
  const router = useRouter()
  const { joinedSession } = useStudent()

  const goToSessionTab = useCallback(() => {
    if (!joinedSession?.session?.code) return
    const activity = joinedSession.session.activity || {}
    const isRoute = activity.type === 'route'
    const href = isRoute ? '/(tabs)/discover' : '/(tabs)/explore'
    router.navigate(href)
  }, [joinedSession, router])

  if (!joinedSession?.session?.code) return null

  return (
    <Pressable
      onPress={goToSessionTab}
      accessibilityRole="button"
      accessibilityLabel="Ir al tab de esta sesión"
      className="absolute top-3 left-3 right-3 z-[55] bg-blue-600/95 rounded-xl px-3 py-2 border border-blue-500 active:opacity-90"
    >
      <Text className="text-[10px] font-black text-white uppercase tracking-widest">Sesión</Text>
      <Text className="text-xs font-bold text-white">
        Código {joinedSession.session.code} · {joinedSession.participant?.name}
      </Text>
    </Pressable>
  )
}
