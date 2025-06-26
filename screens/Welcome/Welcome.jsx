import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../Logic/globalState";
import { responsiveFontSize, horizontalScale, verticalScale, spacing } from '../../Utils/responsiveUtils';

const Welcome = () => {
  const navigation = useNavigation();
  const { theme } = useAppContext();
  const [fontsLoaded] = useFonts({
    "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  });

  const handleGoToSermons = () => {
    navigation?.navigate("AllSermons");
  };

  // if (!fontsLoaded) {
  //   return null; // Or a loading component
  // }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor:"#1c1917"}}>
      <ImageBackground
        source={require("../../assets/cloud.png")} // Make sure to add your background image
        style={styles.backgroundImage}
        // tintColor={"#2f2f2f"}
        blurRadius={5}
        resizeMode=""
      >
        <LinearGradient
          colors={["#1c191730", "#1c191730", "#1c191730"]}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Image
                source={require("../../assets/roundedLam.jpg")}
                style={{ 
                  height: verticalScale(50), 
                  width: horizontalScale(50), 
                  alignSelf: "center" 
                }}
              />
              <Text style={styles.title}>
                Transcribed and audio versions of Robert Lambert Lee sermons
              </Text>
              <Text style={styles.subtitle}>1964 - 1973</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGoToSermons}
              >
                <Ionicons 
                  name="send-outline" 
                  style={styles.buttonText}
                  size={responsiveFontSize(50)}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  content: {
    // backgroundColor: "rgba(71, 69, 69, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
    borderRadius: horizontalScale(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: horizontalScale(3.84),
    // elevation: 5,
  },
  title: {
    fontFamily: "ZillaSlab-Regular",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    marginBottom: spacing.xl,
    color: "white",
    fontWeight: "thin",
  },
  subtitle: {
    fontFamily: "serif",
    fontSize: responsiveFontSize(18),
    textAlign: "center",
    marginBottom: spacing.xxl,
    color: "#b4afaf",
  },
  button: {
    // backgroundColor: "#4a4a4a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: horizontalScale(100),
    height: verticalScale(100),
    width: horizontalScale(100),
    borderWidth: 1,
    borderColor: "white",
    borderStyle: "dashed",
  },
  buttonText: {
    fontFamily: "Merienda-VariableFont",
    color: "#e6c3b8",
    fontSize: responsiveFontSize(50),
    textAlign: "center",
  },
});

export default Welcome;
