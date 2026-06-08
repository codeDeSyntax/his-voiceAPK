import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { SermonProvider } from "./Logic/globalState";
import { BackHandler, Platform } from "react-native";
import SystemBars from "./components/SystemBars";
import { useFonts } from "expo-font";
import UpdateScreen from "./components/Update";
import LoaderScreen from "./screens/LoadingScreen";
import { CORE_FONTS } from "./Utils/fontLoader";

// Prevent auto hide of splash screen until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts(CORE_FONTS);

  useEffect(() => {
    async function prepareApp() {
      try {
        if (fontsLoaded) {
          // Fonts are loaded — nothing else to prepare synchronously
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, [fontsLoaded]);

  if (Platform.OS === "android" && !BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => {};
  }

  if (!appIsReady || !fontsLoaded) {
    return <LoaderScreen />;
  }

  return (
    <SermonProvider>
      <NavigationContainer>
        <SystemBars />
        <UpdateScreen />
        <StackNavigator />
      </NavigationContainer>
    </SermonProvider>
  );
}
