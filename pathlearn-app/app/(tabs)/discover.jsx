import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { LayoutPanelLeft, Zap } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PathLearnMap from '../../src/components/Map/PathLearnMap'
import LoadingOverlay from '../../src/components/UI/LoadingOverlay'
import PanelDescubrir from '../../src/components/UI/PanelDescubrir'
import SaveNameModal from '../../src/components/UI/SaveNameModal'
import DebugSheet from '../../src/components/UI/DebugSheet'
import JoinedSessionBanner from '../../src/components/UI/JoinedSessionBanner'
import { useStudent } from '../../src/context/StudentContext'

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets()
  const [saveRouteOpen, setSaveRouteOpen] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)

  const {
    mobilePanelOpen,
    setMobilePanelOpen,
    selectedRoute,
    routeActive,
    routeWaypoints,
    routeQuizzes,
    routeAnswers,
    routeImages,
    routeLoading,
    routeLoadingStep,
    routeError,
    routeMeta,
    handleSelectRoute,
    handleGenerateRoute,
    handleRouteWaypointClick,
    handleSaveRoute,
    routeTotal,
    routeScore,
    savedToast,
    debugLog,
  } = useStudent()

  const routeDebugPayload =
    routeMeta && (routeMeta.prompt || routeMeta.rawResponse)
      ? { tipo: 'ruta', ...routeMeta }
      : null

  const loading = routeLoading
  const canSaveRoute = routeTotal > 0 && routeActive && !loading
  const showGenerateFab = !routeActive

  return (
    <View className="flex-1 bg-slate-100">
      <PathLearnMap
        mode="discover"
        selectedLocation={null}
        pois={[]}
        quizzes={{}}
        answers={{}}
        routeWaypoints={routeWaypoints}
        routeQuizzes={routeQuizzes}
        routeAnswers={routeAnswers}
        routeImages={routeImages}
        onRouteWaypointClick={handleRouteWaypointClick}
        clickDisabled={!routeActive}
      />

      {loading && (
        <LoadingOverlay
          step={routeLoadingStep === 'verifying' ? 'route-verify' : 'route-gen'}
          poisCount={routeWaypoints.length}
        />
      )}

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
            <PanelDescubrir
              selectedRoute={selectedRoute}
              onSelectRoute={handleSelectRoute}
              onGenerate={handleGenerateRoute}
              onSaveRoute={() => setSaveRouteOpen(true)}
              canSaveRoute={canSaveRoute}
              loading={loading}
              loadingStep={routeLoadingStep}
              error={routeError}
              routeActive={routeActive}
              routeWaypoints={routeWaypoints}
              routeQuizzes={routeQuizzes}
              routeAnswers={routeAnswers}
              onWaypointClick={handleRouteWaypointClick}
              score={routeScore}
              total={routeTotal}
              routeMeta={routeMeta}
              onShowDebug={() => {
                setDebugOpen(true)
                setMobilePanelOpen(false)
              }}
              hasDebug={!!routeDebugPayload || !!debugLog}
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
              onPress={() => setMobilePanelOpen(true)}
              className="bg-blue-600 rounded-2xl px-5 py-3.5 flex-row items-center gap-2 shadow-lg active:opacity-90"
            >
              <Zap size={20} color="#fff" />
              <Text className="text-white font-black text-[11px] uppercase tracking-wide">Generar ruta</Text>
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
        visible={saveRouteOpen}
        title="Guardar ruta"
        placeholder="Mi ruta…"
        onConfirm={async name => {
          await handleSaveRoute(name)
          setSaveRouteOpen(false)
        }}
        onCancel={() => setSaveRouteOpen(false)}
      />

      <DebugSheet
        visible={debugOpen}
        debugLog={routeDebugPayload || debugLog}
        onClose={() => setDebugOpen(false)}
      />
    </View>
  )
}
