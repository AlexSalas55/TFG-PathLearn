import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StudentProvider } from '../src/context/StudentContext'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StudentProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#ffffff' },
              headerShadowVisible: false,
              headerTintColor: '#0f172a',
              headerTitleStyle: { fontWeight: '800' },
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Atrás' }} />
            <Stack.Screen name="join" options={{ title: 'Unirse por código', presentation: 'card' }} />
            <Stack.Screen name="saved" options={{ title: 'Guardados', presentation: 'card' }} />
            <Stack.Screen
              name="quiz/[poiId]"
              options={{
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </StudentProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
