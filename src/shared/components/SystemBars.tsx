import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useAppContext } from "../../providers/SermonProvider";

const SystemBars = () => {
  const { theme } = useAppContext();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const applyNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to apply navigation bar settings:", error);
        }
      }
    };

    applyNavigationBar();
  }, [theme.dark]);

  return (
    <StatusBar
      style={theme.dark ? "light" : "dark"}
      hidden
    />
  );
};

export default SystemBars;
