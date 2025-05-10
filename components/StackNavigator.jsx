import React, { Suspense,useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, BackHandler } from 'react-native';

// Import screens
import Menu from '../screens/menu/Menu';
import About from '../screens/About/About';
import Welcome from '../screens/Welcome/Welcome';
import UpdateScreen from '../screens/Updating';
import SermonList from '../screens/SermonList/AllSermons';
import RecentlyOpenedSermons from '../screens/RecentlyOpened/RecentSermons';
import SermonSearch from '../screens/Search/Search';
import Settings from '../screens/settings/Settings';
import CurrentSermon from '../screens/Home/CurrentSermon';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as NavigationBar from "expo-navigation-bar";
const Stack = createNativeStackNavigator();

// Custom loading component with transparent background
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

// Suspense wrapper for smooth loading
const ScreenWithSuspense = (Component) => ({ navigation, route }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component navigation={navigation} route={route} />
  </Suspense>
);

function StackNavigator() {

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

  const navigation = useNavigation();
   if (Platform.OS === 'android' && !BackHandler.removeEventListener) {
      BackHandler.removeEventListener = () => {
        navigation.navigate(AllSermons)
      };
    }
  return (
    <Stack.Navigator 
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        cardStyle: { backgroundColor: 'transparent' },
        animationDuration: 10,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          },
          overlayStyle: {
            opacity: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
          },
        }),
        presentation: 'card',
        detachPreviousScreen: false,
      }}
    >
      <Stack.Screen 
        name="welcome" 
        component={ScreenWithSuspense(Welcome)}
      />
      <Stack.Screen 
        name="Menu" 
        component={ScreenWithSuspense(Menu)}
      />
      <Stack.Screen 
        name="currentsermon" 
        component={ScreenWithSuspense(CurrentSermon)}
      />
      <Stack.Screen 
        name="AllSermons" 
        component={ScreenWithSuspense(SermonList)}
      />
      <Stack.Screen 
        name="Recent" 
        component={ScreenWithSuspense(RecentlyOpenedSermons)}
      />
      <Stack.Screen 
        name="Search" 
        component={ScreenWithSuspense(SermonSearch)}
      />
      <Stack.Screen 
        name="Settings" 
        component={ScreenWithSuspense(Settings)}
      />
      <Stack.Screen 
        name="About" 
        component={ScreenWithSuspense(About)}
      />
      <Stack.Screen 
        name="updating" 
        component={ScreenWithSuspense(UpdateScreen)}
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;