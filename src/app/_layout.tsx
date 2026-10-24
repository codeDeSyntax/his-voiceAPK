import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SermonProvider, useAppContext } from '@/providers/SermonProvider';
import UpdateScreen from '@/shared/components/Update';
import SystemBars from '@/shared/components/SystemBars';
import { CORE_FONTS } from '@/shared/theme/fontLoader';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync().catch(console.warn);

function Navigation() {
  const { theme } = useAppContext();
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SystemBars />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sermons" />
        <Stack.Screen name="reader" />
        <Stack.Screen name="search" />
        <Stack.Screen name="bookmarks" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="recents" />
        <Stack.Screen name="about" />
      </Stack>
      <UpdateScreen />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(CORE_FONTS);

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (error) throw error;
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SermonProvider><Navigation /></SermonProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
