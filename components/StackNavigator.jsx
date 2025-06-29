import React, { Suspense, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform, BackHandler } from "react-native";

// Import screens
import Menu from "../screens/menu/Menu";
import About from "../screens/About/About";
import Welcome from "../screens/Welcome/Welcome";
import UpdateScreen from "../screens/LoadingScreen";
import SermonList from "../screens/SermonList/AllSermons";
import RecentlyOpenedSermons from "../screens/RecentlyOpened/RecentSermons";
import SermonSearch from "../screens/Search/Search";
import Settings from "../screens/settings/Settings";
import CurrentSermon from "../screens/Home/CurrentSermon";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useScreens } from "react-native-screens";
import { useAppContext } from "../Logic/globalState";
import SermonAudioWebScreen from "../screens/SermonAudioWeb";
import BookmarksScreen from "../screens/Bookmarks/BookmarksScreen";
// useScreens();
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
  ({ navigation, route }) =>
    (
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    );

const TransitionScreen = {
  gestureDirection: "horizontal",
  // transitionSpec: {
  //   open: TransitionSpecs.TransitionIOSSpec,
  //   close: TransitionSpecs.TransitionIOSSpec,
  // },
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
  // useEffect(() => {
  //   const hideNavigationBar = async () => {
  //     try {
  //       console.log("Hiding navigation bar...");
  //       // await NavigationBar.setPositionAsync("absolute");
  //       await NavigationBar.setVisibilityAsync("hidden");
  //       await NavigationBar.setBehaviorAsync("overlay-swipe");
  //       console.log("Navigation bar hidden successfully.");
  //     } catch (error) {
  //       console.error("Error hiding navigation bar:", error);
  //     }
  //   };

  //   if (Platform.OS === "android") {
  //     hideNavigationBar();
  //   }
  // }, []);

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
          detachPreviousScreen: false,
        }}
        // detachInactiveScreens={true}
      >
        <Stack.Screen
          name="welcome"
          component={ScreenWithSuspense(Welcome)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            ...CardOptions,
          }}
        />
        <Stack.Screen
          name="Menu"
          component={ScreenWithSuspense(Menu)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            ...CardOptions,
          }}
        />
        <Stack.Screen
          name="currentsermon"
          component={ScreenWithSuspense(CurrentSermon)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,

            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="AllSermons"
          component={ScreenWithSuspense(SermonList)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="Recent"
          component={ScreenWithSuspense(RecentlyOpenedSermons)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="Search"
          component={ScreenWithSuspense(SermonSearch)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={ScreenWithSuspense(Settings)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="About"
          component={ScreenWithSuspense(About)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="updating"
          component={ScreenWithSuspense(UpdateScreen)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="audiowebscreen"
          component={ScreenWithSuspense(SermonAudioWebScreen)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
        <Stack.Screen
          name="bookmarks"
          component={ScreenWithSuspense(BookmarksScreen)}
          options={{
            navigationBarHidden: true,
            statusBarHidden: true,
            // ...CardOptions,
          }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default StackNavigator;
