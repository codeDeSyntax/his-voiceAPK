import { Stack } from "expo-router";
import { SermonProvider } from "../Logic/globalState";
import AppStatusBar from "../components/StatusBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
// import "react-native-gesture-handler";
const RootLayout = () => {
  useEffect(() => {
    if (Platform.OS === "android" && !BackHandler.removeEventListener) {
      BackHandler.removeEventListener = () => {};
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SermonProvider>
        {/* <AppStatusBar /> */}
        {/* <SysBars/> */}
        <Stack initialRouteName="screens/Welcome">
          <Stack.Screen
            name="screens/Welcome"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/Menu"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/CurrentSermon"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/AllSermons"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/RecentSermons"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/Search"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/Settings"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/About"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
          <Stack.Screen
            name="screens/Updating"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
        </Stack>
      </SermonProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
