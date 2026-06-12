import { Tabs, Link, useRouter } from 'expo-router'
import { Compass, Map, BookmarkPlus, LogIn, LogOut } from 'lucide-react-native'
import { Alert, Pressable, Text, View } from 'react-native'
import { useStudent } from '../../src/context/StudentContext'

export default function TabsLayout() {
  const router = useRouter()
  const { joinedSession, leaveJoinedSession } = useStudent()

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 8 }}>
            {joinedSession?.session?.code ? (
              <Pressable
                hitSlop={8}
                accessibilityLabel="Salir de la sesión"
                onPress={() => {
                  Alert.alert('Salir de la sesión', '¿Estás seguro?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Salir',
                      style: 'destructive',
                      onPress: () => {
                        leaveJoinedSession()
                        router.navigate('/(tabs)/explore')
                      },
                    },
                  ])
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <LogOut size={22} color="#dc2626" />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#dc2626' }} numberOfLines={1}>
                    Salir
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Link href="/join" asChild>
                <Pressable hitSlop={8} accessibilityLabel="Unirse por código">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <LogIn size={22} color="#334155" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#334155' }} numberOfLines={1}>
                      Unirse
                    </Text>
                  </View>
                </Pressable>
              </Link>
            )}
            <Link href="/saved" asChild>
              <Pressable
                hitSlop={8}
                accessibilityLabel="Guardados"
              >
                <BookmarkPlus size={22} color="#334155" />
              </Pressable>
            </Link>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => <Compass size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Descubrir',
          tabBarIcon: ({ color, size }) => <Map size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  )
}
