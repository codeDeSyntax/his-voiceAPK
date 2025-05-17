import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { SermonProvider } from "./Logic/globalState";
import { Text, BackHandler, Platform } from "react-native";
import UpdateScreen from "./screens/Updating";
import AppStatusBar from "./components/StatusBar";
import * as Font from "expo-font";
import { useFonts } from "expo-font";

// Prevent auto hide of splash screen until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'MyFont': require('./assets/fonts/ZillaSlab-Regular.ttf'),
   
  });

  useEffect(() => {
    async function prepareApp() {
      try {
        if (fontsLoaded) {
          // Set default global font
          Text.defaultProps = Text.defaultProps || {};
          Text.defaultProps.style = { fontFamily: 'MyFont' };

          // Artificial delay (optional)
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
    return <UpdateScreen />; // or Splash screen
  }

  return (
    <SermonProvider>
      <NavigationContainer>
        <AppStatusBar />
        <StackNavigator />
      </NavigationContainer>
    </SermonProvider>
  );
}
