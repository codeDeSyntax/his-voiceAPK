import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, View,Platform } from "react-native";
import StackNavigator from "./components/StackNavigator";
import { NavigationContainer, ThemeProvider } from "@react-navigation/native";
import {useTheme} from "@react-navigation/native";
import { SermonProvider } from "./Logic/globalState";


export default function App() {
  const {theme} = useTheme();
  return (
    <ThemeProvider>
     <SermonProvider>
     <NavigationContainer>
       {/* <KeyboardAvoidingView style={{flex:1,} }  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} > */}
        <StackNavigator />
        <StatusBar style="light" backgroundColor="#22272a"/>
       {/* </KeyboardAvoidingView> */}
      </NavigationContainer>
     </SermonProvider>
    </ThemeProvider>
  );
}
