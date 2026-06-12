import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

const LABELS = {
  pois: 'Buscando lugares…',
  quizzes: 'Generando preguntas…',
  'ai-all': 'Generando contenido con IA…',
  generating: 'Generando ruta…',
  verifying: 'Verificando coordenadas…',
  'route-gen': 'Generando ruta…',
  'route-verify': 'Verificando coordenadas…',
}

export default function LoadingOverlay({ step, poisCount = 0 }) {
  const label = LABELS[step] || 'Cargando…'
  return (
    <View style={styles.wrap} pointerEvents="auto">
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.title}>{label}</Text>
        {poisCount > 0 && (
          <Text style={styles.sub}>{poisCount} puntos en proceso</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  sub: { fontSize: 12, color: '#64748b' },
})
