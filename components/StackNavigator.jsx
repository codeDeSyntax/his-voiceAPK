import React, { Suspense, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform, BackHandler } from "react-native";

// Import screens
import About from "../screens/About/About";
import Welcome from "../screens/Welcome/Welcome";
import UpdateScreen from "../screens/LoadingScreen";
import SermonList from "../screens/SermonList/AllSermons";
import SermonSearch from "../screens/Search/Search";
import Settings from "../screens/settings/Settings";
import CurrentSermon from "../screens/Home/CurrentSermon";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppContext } from "../Logic/globalState";
import BookmarksScreen from "../screens/Bookmarks/BookmarksScreen";
import RecentsScreen from "../screens/Recents/RecentsScreen";
// Note: @react-navigation/native-stack uses react-native-screens natively by
// default — no manual enableScreens() call is needed with native-stack.

const Stack = createNativeStackNavigator();

// Custom loading component with transparent background
const LoadingFallback = () => {
  const { theme } = useAppContext();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.text} />
    </View>
  );
};

// Suspense wrapper for smooth loading
const ScreenWithSuspense =
  (Component) =>
  ({ navigation, route }) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component navigation={navigation} route={route} />
    </Suspense>
  );

// Pre-compute wrapped screen components at module level so React Navigation
// always receives a stable component reference and never unmounts/remounts screens.
const WrappedWelcome = ScreenWithSuspense(Welcome);
const WrappedCurrentSermon = ScreenWithSuspense(CurrentSermon);
const WrappedSermonList = ScreenWithSuspense(SermonList);
const WrappedSermonSearch = ScreenWithSuspense(SermonSearch);
const WrappedSettings = ScreenWithSuspense(Settings);
const WrappedAbout = ScreenWithSuspense(About);
const WrappedUpdateScreen = ScreenWithSuspense(UpdateScreen);
const WrappedBookmarks = ScreenWithSuspense(BookmarksScreen);
const WrappedRecents = ScreenWithSuspense(RecentsScreen);

const TransitionScreen = {
  gestureDirection: "horizontal",
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            translateX: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -layouts.screen.width],
                })
              : 1,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

const CardOptions = {
  cardStyle: { backgroundColor: "transparent" },
  ...TransitionScreen,
  headerShown: false,
  gestureEnabled: false,
};

const StackNavigator = () => {
  const navigation = useNavigation();
  if (Platform.OS === "android" && !BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => {
      navigation.navigate("AllSermons");
    };
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          presentation: "card",
          // detachPreviousScreen defaults to true — screens are released from
          // memory when navigated away, preventing all screens from staying
          // mounted simultaneously.
        }}
      >
        <Stack.Screen
          name="welcome"
          component={Welcome}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            ...CardOptions,
          }}
        />
        <Stack.Screen
          name="currentsermon"
          component={WrappedCurrentSermon}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="AllSermons"
          component={WrappedSermonList}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="Search"
          component={WrappedSermonSearch}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={WrappedSettings}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="About"
          component={WrappedAbout}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="updating"
          component={WrappedUpdateScreen}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="bookmarks"
          component={WrappedBookmarks}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
        <Stack.Screen
          name="Recents"
          component={WrappedRecents}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default StackNavigator;
