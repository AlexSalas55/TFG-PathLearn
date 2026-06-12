import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { joinSession } from '../src/services/sessionStorageService'
import { useStudent } from '../src/context/StudentContext'

export default function JoinScreen() {
  const { applyJoinedSession } = useStudent()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setErr('')
    setLoading(true)
    try {
      const res = await joinSession(code, name)
      applyJoinedSession(res)
    } catch (e) {
      setErr(e?.message || 'Error al unirse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 px-6 pt-6">
        <Text className="text-sm text-slate-500 leading-relaxed mb-6">
          Introduce el código que te ha dado el profesor y tu nombre para cargar la actividad publicada.
        </Text>

        <Text className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Código</Text>
        <TextInput
          value={code}
          onChangeText={t => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          placeholder="ABC123"
          placeholderTextColor="#94a3b8"
          className="border border-slate-200 rounded-xl px-4 py-3 text-lg font-mono font-bold text-slate-900 bg-white mb-4"
        />

        <Text className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Tu nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor="#94a3b8"
          className="border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white mb-6"
        />

        {err ? (
          <View className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <Text className="text-xs text-red-600">{err}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading || !code.trim() || !name.trim()}
          className="bg-blue-600 rounded-xl py-4 items-center disabled:bg-slate-200"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-black text-sm uppercase tracking-wide">Unirse</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
