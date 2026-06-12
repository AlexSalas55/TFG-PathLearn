import React, { useEffect, useMemo, useRef } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import MapView, { Circle, Marker, Polyline } from 'react-native-maps'

const BARCELONA = { latitude: 41.3851, longitude: 2.1734 }

function ringColor(answer, hasQuiz) {
  if (answer) return answer.correct ? '#10b981' : '#ef4444'
  if (hasQuiz) return '#2563eb'
  return '#94a3b8'
}

function RouteStopMarker({ poi, index, hasQuiz, answer, imageUrl, onPress }) {
  const ring = ringColor(answer, hasQuiz)
  return (
    <Marker
      coordinate={{ latitude: poi.lat, longitude: poi.lng }}
      onPress={() => hasQuiz && onPress?.(poi)}
      tracksViewChanges={false}
    >
      <View style={styles.markerWrap}>
        {imageUrl ? (
          <View style={[styles.imgRing, { borderColor: ring }]}>
            <Image source={{ uri: imageUrl }} style={styles.img} />
            <View style={styles.badgeOverlay}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.fallback, { borderColor: ring }]}>
            <Text style={styles.fallbackText}>{index + 1}</Text>
          </View>
        )}
      </View>
    </Marker>
  )
}

function POIMarkerView({ poi, hasQuiz, answer, imageUrl, onPress }) {
  const ring = ringColor(answer, hasQuiz)
  return (
    <Marker
      coordinate={{ latitude: poi.lat, longitude: poi.lng }}
      onPress={() => hasQuiz && onPress?.(poi)}
      tracksViewChanges={false}
    >
      <View style={styles.markerWrap}>
        {imageUrl ? (
          <View style={[styles.imgRing, { borderColor: ring }]}>
            <Image source={{ uri: imageUrl }} style={styles.img} />
          </View>
        ) : (
          <View style={[styles.fallback, { borderColor: ring }]}>
            <Text style={styles.fallbackSm}>{poi.name?.charAt(0) || '?'}</Text>
          </View>
        )}
      </View>
    </Marker>
  )
}

/** Mapa nativo del estudiante (explorar o ruta). */
export default function PathLearnMap({
  mode, // 'explore' | 'discover'
  selectedLocation,
  pois = [],
  quizzes = {},
  answers = {},
  poiImages = {},
  onLocationSelect,
  onPOIClick,
  radius = 500,
  routeWaypoints = [],
  routeQuizzes = {},
  routeAnswers = {},
  routeImages = {},
  onRouteWaypointClick,
  clickDisabled = false,
  showExploreCircle = true,
  showExploreMarker = true,
}) {
  const mapRef = useRef(null)
  const isRoute = mode === 'discover' && routeWaypoints.length > 0

  const initialRegion = useMemo(
    () => ({
      latitude: selectedLocation?.lat ?? BARCELONA.latitude,
      longitude: selectedLocation?.lng ?? BARCELONA.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    }),
    [selectedLocation]
  )

  useEffect(() => {
    if (!mapRef.current) return
    const list = isRoute ? routeWaypoints : pois
    if (list.length === 0) {
      if (selectedLocation?.lat) {
        mapRef.current.animateToRegion(
          {
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          500
        )
      }
      return
    }
    const coords = list.map(p => ({
      latitude: p.lat,
      longitude: p.lng,
    }))
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
      animated: true,
    })
  }, [isRoute, pois, routeWaypoints, selectedLocation])

  const handleMapPress = e => {
    if (clickDisabled) return
    const { latitude, longitude } = e.nativeEvent.coordinate
    onLocationSelect?.({ lat: latitude, lng: longitude })
  }

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      onPress={handleMapPress}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {!isRoute && selectedLocation && showExploreCircle && (
        <>
          {showExploreMarker && (
            <Marker
              coordinate={{ latitude: selectedLocation.lat, longitude: selectedLocation.lng }}
              pinColor="#2563eb"
            />
          )}
          <Circle
            center={{ latitude: selectedLocation.lat, longitude: selectedLocation.lng }}
            radius={radius}
            strokeColor="rgba(37,99,235,0.9)"
            fillColor="rgba(37,99,235,0.06)"
            strokeWidth={2}
          />
        </>
      )}

      {!isRoute &&
        pois.map(poi => (
          <POIMarkerView
            key={poi.id}
            poi={poi}
            hasQuiz={!!quizzes[poi.id]}
            answer={answers[poi.id]}
            imageUrl={poiImages[poi.id]}
            onPress={onPOIClick}
          />
        ))}

      {isRoute && (
        <>
          <Polyline
            coordinates={routeWaypoints.map(p => ({
              latitude: p.lat,
              longitude: p.lng,
            }))}
            strokeColor="rgba(37,99,235,0.75)"
            strokeWidth={3}
            lineDashPattern={[10, 7]}
          />
          {routeWaypoints.map((poi, index) => (
            <RouteStopMarker
              key={poi.id}
              poi={poi}
              index={index}
              hasQuiz={!!routeQuizzes[poi.id]}
              answer={routeAnswers[poi.id]}
              imageUrl={routeImages[poi.id]}
              onPress={onRouteWaypointClick}
            />
          ))}
        </>
      )}
    </MapView>
  )
}

const styles = StyleSheet.create({
  markerWrap: { alignItems: 'center', justifyContent: 'center' },
  imgRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  img: { width: '100%', height: '100%' },
  badgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37,99,235,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  fallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  fallbackSm: { fontSize: 12, fontWeight: '800', color: '#334155' },
})
