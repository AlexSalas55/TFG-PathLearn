import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import * as Location from 'expo-location'
import { LayoutPanelLeft, LocateFixed, MapPin, Zap } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PathLearnMap from '../../src/components/Map/PathLearnMap'
import LoadingOverlay from '../../src/components/UI/LoadingOverlay'
import PanelExplorar from '../../src/components/UI/PanelExplorar'
import SaveNameModal from '../../src/components/UI/SaveNameModal'
import DebugSheet from '../../src/components/UI/DebugSheet'
import JoinedSessionBanner from '../../src/components/UI/JoinedSessionBanner'
import { useStudent } from '../../src/context/StudentContext'

export default function ExploreScreen() {
  const insets = useSafeAreaInsets()
  const [saveQuizOpen, setSaveQuizOpen] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [manualPick, setManualPick] = useState(false)

  const {
    mobilePanelOpen,
    setMobilePanelOpen,
    selectedLocation,
    locationName,
    pois,
    quizzes,
    poiImages,
    answers,
    loading,
    loadingStep,
    radius,
    setRadius,
    quizMode,
    setQuizMode,
    error,
    quizFailed,
    generationMeta,
    debugLog,
    handleLocationSelect,
    handleGenerateQuiz,
    handlePOIClick,
    handleResetExplore,
    handleSaveQuiz,
    exploreLocked,
    total,
    savedToast,
    score,
  } = useStudent()

  useEffect(() => {
    if (selectedLocation) return
    let cancelled = false
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted' || cancelled) return
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (cancelled) return
        handleLocationSelect({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        })
      } catch (e) {
        console.warn('[PathLearn] ubicación:', e?.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedLocation, handleLocationSelect])

  const canSave = total > 0 && !!selectedLocation && !loading
  const canManualToggle = total === 0 && !loading

  const mapClickDisabled = useMemo(() => {
    if (exploreLocked) return true
    if (!manualPick) return true
    return false
  }, [exploreLocked, manualPick])

  const showGenerateFab = total === 0

  return (
    <View className="flex-1 bg-slate-100">
      <PathLearnMap
        mode="explore"
        selectedLocation={selectedLocation}
        pois={pois}
        quizzes={quizzes}
        answers={answers}
        poiImages={poiImages}
        onLocationSelect={manualPick ? handleLocationSelect : undefined}
        onPOIClick={handlePOIClick}
        radius={radius}
        clickDisabled={mapClickDisabled}
        showExploreMarker={manualPick}
      />

      {loading && <LoadingOverlay step={loadingStep} poisCount={pois.length} />}

      {/* Toggle: GPS (default) vs manual pin */}
      <View className="absolute top-3 left-3 z-[70] flex-row gap-2">
        <Pressable
          onPress={async () => {
            if (!canManualToggle) return
            const next = !manualPick
            setManualPick(next)
            if (!next) {
              try {
                const loc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                })
                handleLocationSelect({
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                })
              } catch (e) {
                console.warn('[PathLearn] ubicación:', e?.message)
              }
            }
          }}
          disabled={!canManualToggle}
          className={`bg-white rounded-2xl p-3 border border-slate-200 shadow-lg active:opacity-90 ${
            manualPick ? 'bg-blue-50 border-blue-200' : ''
          } ${!canManualToggle ? 'opacity-50' : ''}`}
          accessibilityLabel="Alternar selección manual"
        >
          {manualPick ? <MapPin size={20} color="#2563eb" /> : <LocateFixed size={20} color="#334155" />}
        </Pressable>
      </View>

      <JoinedSessionBanner />

      {savedToast ? (
        <View
          className="absolute left-4 right-4 bg-slate-900/92 rounded-xl py-3 px-4 z-[60]"
          style={{ bottom: Math.max(insets.bottom, 12) + 100 }}
          pointerEvents="none"
        >
          <Text className="text-white text-center text-sm font-semibold">{savedToast}</Text>
        </View>
      ) : null}

      {mobilePanelOpen && (
        <>
          <Pressable
            className="absolute inset-0 bg-white z-[890]"
            onPress={() => setMobilePanelOpen(false)}
          />
          <View
            className="absolute left-0 right-0 top-0 z-[900] bg-white"
            style={{ bottom: 0 }}
          >
            <PanelExplorar
              selectedLocation={selectedLocation}
              locationName={locationName}
              pois={pois}
              quizzes={quizzes}
              answers={answers}
              radius={radius}
              onRadiusChange={setRadius}
              quizMode={quizMode}
              onModeChange={setQuizMode}
              onGenerate={handleGenerateQuiz}
              onResetExplore={handleResetExplore}
              loading={loading}
              error={error}
              onPOIClick={handlePOIClick}
              score={score}
              total={total}
              quizFailed={quizFailed}
              generationMeta={generationMeta}
              onShowDebug={() => {
                setDebugOpen(true)
                setMobilePanelOpen(false)
              }}
              hasDebug={!!debugLog}
              onSaveQuiz={() => setSaveQuizOpen(true)}
              canSave={canSave}
              poiImages={poiImages}
              onClosePanel={() => setMobilePanelOpen(false)}
            />
          </View>
        </>
      )}

      {!loading && (
        <View
          className="absolute left-4 right-4 flex-row items-end z-[850]"
          style={{ bottom: Math.max(insets.bottom, 12) + 8 }}
          pointerEvents="box-none"
        >
          <View style={{ flex: 1 }} />
          {showGenerateFab ? (
            <Pressable
              onPress={handleGenerateQuiz}
              disabled={!selectedLocation}
              className="bg-blue-600 rounded-2xl px-5 py-3.5 flex-row items-center gap-2 shadow-lg active:opacity-90 disabled:bg-slate-300"
            >
              <Zap size={20} color="#fff" />
              <Text className="text-white font-black text-[11px] uppercase tracking-wide">Generar quiz</Text>
            </Pressable>
          ) : null}
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Pressable
              onPress={() => setMobilePanelOpen(true)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-lg active:opacity-90"
            >
              <LayoutPanelLeft size={22} color="#334155" />
            </Pressable>
          </View>
        </View>
      )}

      <SaveNameModal
        visible={saveQuizOpen}
        title="Guardar quiz"
        placeholder="Mi exploración…"
        onConfirm={async name => {
          await handleSaveQuiz(name)
          setSaveQuizOpen(false)
        }}
        onCancel={() => setSaveQuizOpen(false)}
      />

      <DebugSheet visible={debugOpen} debugLog={debugLog} onClose={() => setDebugOpen(false)} />
    </View>
  )
}
