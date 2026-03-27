import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { SermonProvider } from "./Logic/globalState";
import { BackHandler, Platform } from "react-native";
import AppStatusBar from "./components/StatusBar";
import { useFonts } from "expo-font";
import UpdateScreen from "./components/Update";
import LoaderScreen from "./screens/LoadingScreen";

// Prevent auto hide of splash screen until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    ZillaSlab: require("./assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("./assets/fonts/ZillaSlab-SemiBold.ttf"),
    "ZillaSlab-Regular": require("./assets/fonts/ZillaSlab-Regular.ttf"),
    "ZillaSlab-SemiBold": require("./assets/fonts/ZillaSlab-SemiBold.ttf"),
    Merriweather: require("./assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf"),
    Philosopher: require("./assets/fonts/Philosopher-Regular.ttf"),
    Lora: require("./assets/fonts/Lora-VariableFont_wght.ttf"),
    "Merienda-VariableFont_wght": require("./assets/fonts/Merienda-VariableFont_wght.ttf"),
  });

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
        <AppStatusBar />
        <UpdateScreen />
        <StackNavigator />
      </NavigationContainer>
    </SermonProvider>
  );
}
