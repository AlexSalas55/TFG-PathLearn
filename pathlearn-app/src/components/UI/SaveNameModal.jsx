import React, { useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

export default function SaveNameModal({
  visible,
  title = 'Nombre',
  placeholder = 'Mi quiz…',
  confirmLabel = 'Guardar',
  onConfirm,
  onCancel,
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (visible) setName('')
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-black/40 justify-center px-6"
      >
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <View className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xl">
          <Text className="text-sm font-black text-slate-900 mb-3">{title}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            className="border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-4"
            autoFocus
          />
          <View className="flex-row gap-3 justify-end">
            <Pressable onPress={onCancel} className="px-4 py-2 rounded-xl border border-slate-200">
              <Text className="text-slate-600 font-semibold text-sm">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => name.trim() && onConfirm?.(name.trim())}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 disabled:bg-slate-200"
            >
              <Text className="text-white font-bold text-sm">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
