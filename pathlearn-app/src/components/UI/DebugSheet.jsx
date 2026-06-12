import React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'

export default function DebugSheet({ visible, debugLog, onClose }) {
  const text = debugLog ? JSON.stringify(debugLog, null, 2) : ''

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white rounded-t-3xl border border-slate-200 max-h-[70%]">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
            <Text className="text-sm font-black text-slate-900">Debug / trazabilidad</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView className="px-4 py-3" keyboardShouldPersistTaps="handled">
            <Text selectable className="text-[10px] font-mono text-slate-700 leading-snug">
              {text || 'Sin datos'}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
