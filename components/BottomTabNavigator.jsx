import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import Home from "../screens/Home/CurrentSermon";
import Settings from "../screens/settings/Settings";
import About from "../screens/About/About";
import RecentOpenedSermons from "../screens/RecentlyOpened/RecentSermons";
import { View } from "react-native";
import { useTheme } from "../Logic/theme";

// Import your image
import homeImage from "../assets/cloud.png";

// Import Ionicons
import Ionicons from "react-native-vector-icons/Ionicons";
import SermonList from "../screens/SermonList/AllSermons";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  // const { theme } = useTheme();
  return (
   <KeyboardAvoidingView style={{flex:1,} }  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
     <Tab.Navigator
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
              icon = <Ionicons name="list-outline" size={size} color={color} />;
              break;
            case "Recent":
              icon = <Ionicons name="time-outline" size={size} color={color} />;
              break;
            case "Settings":
              icon = (
                <Ionicons name="settings-outline" size={size} color={color} />
              );
              break;
            case "About":
              icon = (
                <Ionicons
                  name="information-circle-outline"
                  size={size}
                  color={color}
                />
              );
              break;
            default:
          }

          return icon;
        },
        tabBarActiveTintColor: "#9183f9",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: true,
        // tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#f8f8f8",
          position: "absolute",
          bottom: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 60,
          bottom: 0,
          right: 0,
          left: 0,
          elevation: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="All Sermons" component={SermonList} />
      <Tab.Screen name="Home" component={Home} />

      <Tab.Screen
        name="Saved"
        component={About}
        options={{
          tabBarIcon: ({ focused,color, size }) => {
            return (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  height: Platform.OS == "ios" ? 50 : 60,
                  width: Platform.OS == "ios" ? 50 : 60,
                  top: Platform.OS == "ios" ? -10 : -20,
                  borderRadius: Platform.OS == "ios" ? 25 : 30,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 2,
                  elevation: 5,
                
                }}
              >
                <Image
                  source={homeImage}
                  style={[styles.icon, { tintColor: color }]}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen name="Recent" component={RecentOpenedSermons} />
      <Tab.Screen name="Settings" component={Settings} />
      {/* <Tab.Screen name="About" component={About} /> */}
    </Tab.Navigator>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

export default TabNavigator;
