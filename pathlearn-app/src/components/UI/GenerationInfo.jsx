import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Filter,
  FlaskConical,
  ScrollText,
  Server,
  Compass,
  BookOpen,
} from 'lucide-react-native'

const SOURCE_CONFIG = {
  overpass: { label: 'OpenStreetMap', badge: 'bg-emerald-100 border-emerald-200 text-emerald-700', icon: Database },
  ai:       { label: 'IA Generativa', badge: 'bg-violet-100 border-violet-200 text-violet-700', icon: Brain },
}

const MODE_CONFIG = {
  explorer:  { label: 'Sencillo',     badge: 'bg-sky-100 border-sky-200 text-sky-700', icon: Compass },
  historian: { label: 'Intermedio',   badge: 'bg-violet-100 border-violet-200 text-violet-700', icon: BookOpen },
  analyst:   { label: 'Razonamiento', badge: 'bg-amber-100 border-amber-200 text-amber-700', icon: FlaskConical },
}

export default function GenerationInfo({ meta, onShowDebug, hasDebug }) {
  const [open, setOpen] = useState(false)
  if (!meta) return null

  const srcCfg = SOURCE_CONFIG[meta.poiSource] || SOURCE_CONFIG.ai
  const SrcIcon = srcCfg.icon

  const shortEndpoint = meta.endpoint
    ? meta.endpoint.replace('https://', '').split('/')[0]
    : null

  const poisLabel =
    meta.poiSource === 'overpass' && meta.totalFound > meta.poisSelected
      ? `${meta.poisSelected} / ${meta.totalFound} POIs`
      : `${meta.poisSelected} POIs`

  const time = meta.generatedAt
    ? new Date(meta.generatedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null

  return (
    <View className="mx-6 mt-3 mb-1 rounded-xl border border-slate-200/70 bg-white/80 overflow-hidden">
      <Pressable
        onPress={() => setOpen(v => !v)}
        className="flex-row items-center justify-between px-3 py-2"
      >
        <View className="flex-row items-center gap-2">
          <Brain size={14} color="#2563eb" />
          <Text className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
            Detalles de generación
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {hasDebug && (
            <Pressable
              onPress={e => {
                e?.stopPropagation?.()
                onShowDebug?.()
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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <SrcIcon size={12} color="#94a3b8" />
              <Text className="text-[11px] text-slate-400">Fuente</Text>
            </View>
            <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${srcCfg.badge}`}>
              {srcCfg.label}
            </Text>
          </View>

          {meta.model && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Brain size={12} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400">Modelo</Text>
              </View>
              <Text className="text-[10px] font-mono text-slate-600 font-semibold max-w-[140px]" numberOfLines={1}>
                {meta.model}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Filter size={12} color="#94a3b8" />
              <Text className="text-[11px] text-slate-400">POIs</Text>
            </View>
            <Text className="text-[11px] font-bold text-slate-600">{poisLabel}</Text>
          </View>

          {shortEndpoint && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Server size={12} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400">Servidor</Text>
              </View>
              <Text className="text-[10px] font-mono text-slate-500 max-w-[160px]" numberOfLines={1}>
                {shortEndpoint}
              </Text>
            </View>
          )}

          {meta.quizMode && MODE_CONFIG[meta.quizMode] && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                {React.createElement(MODE_CONFIG[meta.quizMode].icon, { size: 12, color: '#94a3b8' })}
                <Text className="text-[11px] text-slate-400">Modo</Text>
              </View>
              <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${MODE_CONFIG[meta.quizMode].badge}`}>
                {MODE_CONFIG[meta.quizMode].label}
              </Text>
            </View>
          )}

          {time && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400">Hora</Text>
              </View>
              <Text className="text-[11px] text-slate-500">{time}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
