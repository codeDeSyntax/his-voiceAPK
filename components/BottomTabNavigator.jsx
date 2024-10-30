import React, { useContext, Suspense } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
} from "react-native";
import { SermonContext } from "../Logic/globalState";
import Settings from "../screens/settings/Settings";
import homeImage from "../assets/cloud.png";
import Ionicons from "react-native-vector-icons/Ionicons";
import LoadingScreen from "./Loader";

// Lazy load components
const SermonList = React.lazy(() => import("../screens/SermonList/AllSermons"));
const RecentlyOpenedSermons = React.lazy(() =>
  import("../screens/RecentlyOpened/RecentSermons")
);
const SermonSearch = React.lazy(() => import("../screens/Search/Search"));
const Home = React.lazy(() => import("../screens/Home/CurrentSermon"));

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { recentlyOpened } = useContext(SermonContext);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Tab.Navigator
        initialRouteName="All Sermons"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon;

            switch (route.name) {
              case "Home":
                icon = (
                  <Image
                    source={homeImage}
                    style={[styles.icon, { tintColor: color }]}
                  />
                );
                break;
              case "All Sermons":
                icon = (
                  <Ionicons 
                    name={focused ? "library" : "library-outline"} 
                    size={size} 
                    color={color}
                    style={styles.tabIcon} 
                  />
                );
                break;
              case "Recent":
                icon = (
                  <View>
                    <Ionicons 
                      name={focused ? "time" : "time-outline"} 
                      size={size} 
                      color={color}
                      style={styles.tabIcon} 
                    />
                    {recentlyOpened.length > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>
                          {recentlyOpened.length}
                        </Text>
                      </View>
                    )}
                  </View>
                );
                break;
              case "Settings":
                icon = (
                  <Ionicons
                    name={focused ? "settings" : "settings-outline"}
                    size={size}
                    color={color}
                    style={styles.tabIcon}
                  />
                );
                break;
              case "Search":
                icon = (
                  <Ionicons 
                    name={focused ? "search" : "search-outline"} 
                    size={size} 
                    color={color}
                    style={styles.tabIcon}
                  />
                );
                break;
              default:
            }

            return icon;
          },
          tabBarActiveTintColor: "#60A5FA",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#202425",
            position: "absolute",
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            bottom: 0,
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingTop: 10,
            height: 75,
            bottom: 0,
            right: 0,
            left: 0,
            elevation: 0,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            marginTop: 4,
          },
          headerShown: false,
        })}
      >
        {/* Wrap each screen with Suspense for lazy loading */}
        <Tab.Screen name="All Sermons">
          {() => (
            <Suspense fallback={<LoadingScreen />}>
              <SermonList />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen name="Recent">
          {() => (
            <Suspense fallback={<LoadingScreen />}>
              <RecentlyOpenedSermons />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return (
                <View style={styles.homeIconContainer}>
                  <Image
                    source={homeImage}
                    style={[styles.icon, { tintColor: "white" }]}
                  />
                </View>
              );
            },
          }}
        >
          {
          () => (
            <Suspense fallback={<LoadingScreen />}>
              <Home />
            </Suspense>
          )
          }
        </Tab.Screen>
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Search">
          {() => (
            <Suspense fallback={<LoadingScreen />}>
              <SermonSearch />
            </Suspense>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  tabIcon: {
    marginTop: 4,
  },
  badgeContainer: {
    backgroundColor: "#494d50",
    borderRadius: 12,
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 10,
    textAlign: 'center',
  },
  homeIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202425",
    height: Platform.OS == "ios" ? 54 : 64,
    width: Platform.OS == "ios" ? 54 : 64,
    top: Platform.OS == "ios" ? -12 : -22,
    borderRadius: Platform.OS == "ios" ? 27 : 32,
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TabNavigator;