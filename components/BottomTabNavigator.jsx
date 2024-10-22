import React, { useState, useEffect, useContext } from "react";
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
import Home from "../screens/Home/CurrentSermon";
import Settings from "../screens/settings/Settings";
import About from "../screens/About/About";
import RecentOpenedSermons from "../screens/RecentlyOpened/RecentSermons";
import SermonSearch from "../screens/Search/Search";
import { useTheme } from "../Logic/theme";
import homeImage from "../assets/cloud.png";
import Ionicons from "react-native-vector-icons/Ionicons";
import SermonList from "../screens/SermonList/AllSermons";

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
                  <Ionicons name="list-outline" size={size} color="#fafafa" />
                );
                break;
              case "Recent":
                icon = (
                  <View>
                    <Ionicons name="time-outline" size={size} color="#fafafa" />
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
                    name="settings-outline"
                    size={size}
                    color="#fafafa"
                  />
                );
                break;
              case "Search":
                icon = <Ionicons name="search" size={size} color="#fafafa" />;
                break;
              default:
            }

            return icon;
          },
          tabBarActiveTintColor: "#427092",
          tabBarInactiveTintColor: "white",
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#202425",
            position: "absolute",
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            bottom: 0,
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingTop: 10,
            height: 70,
            bottom: 0,
            right: 0,
            left: 0,
            elevation: 0,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="All Sermons" component={SermonList} />
        <Tab.Screen name="Recent" component={RecentOpenedSermons} />
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2d2d2d",
                    height: Platform.OS == "ios" ? 50 : 60,
                    width: Platform.OS == "ios" ? 50 : 60,
                    top: Platform.OS == "ios" ? -10 : -20,
                    borderRadius: Platform.OS == "ios" ? 25 : 30,
                    shadowColor: "#fafafa",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={homeImage}
                    style={[styles.icon, { tintColor: "white" }]}
                  />
                </View>
              );
            },
          }}
        />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Search" component={SermonSearch} />
      </Tab.Navigator>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  badgeContainer: {
    backgroundColor: "#427092",
    borderRadius: 10,
    position: "absolute",
    top: -5,
    right: -5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
});

export default TabNavigator;
