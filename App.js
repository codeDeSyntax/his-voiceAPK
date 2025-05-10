import React, { useContext, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { SermonContext, SermonProvider } from "./Logic/globalState";
import { Alert, Text } from "react-native";
import UpdateScreen from "./screens/Updating";
import { useAppTheme } from "./Logic/theme";
import AppStatusBar from "./components/StatusBar";
import { BackHandler, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const visibility = NavigationBar.useVisibility();

  useEffect(() => {
    async function prepareApp() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();

        // Simulate any startup tasks (e.g., setting up context, state, etc.)
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 3 seconds delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Mark the app as ready and hide the splash screen
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  if (Platform.OS === "android" && !BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => {};
  }

  useEffect(() => {
    const hideNavigationBar = async () => {
      try {
        console.log("Hiding navigation bar...");
        // await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        console.log("Navigation bar hidden successfully.");
      } catch (error) {
        console.error("Error hiding navigation bar:", error);
      }
    };

    if (Platform.OS === "android") {
      hideNavigationBar();
    }
  }, []);

  if (!appIsReady) {
    return <UpdateScreen />; // Prevent rendering the app until it's fully ready
  }

  return (
    <>
      <SermonProvider>
        <NavigationContainer>
          {/* <StatusBar style="light" backgroundColor="#22272a" /> */}
          <AppStatusBar />
          <StackNavigator />
        </NavigationContainer>
      </SermonProvider>
    </>
  );
}
