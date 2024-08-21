import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer, ThemeProvider } from "@react-navigation/native";
import {useTheme} from "@react-navigation/native";

export default function App() {
  const {theme} = useTheme();
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator />
        <StatusBar barStyle="light-content"  />
      </NavigationContainer>
    </ThemeProvider>
  );
}
