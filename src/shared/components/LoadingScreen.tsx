import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Spinner } from "./Loader";

const LoaderScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/splashimg.png")}
        resizeMode="contain"
        style={styles.logo}
        accessibilityLabel="His Voice"
      />
      <Spinner compact size={88} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a130e",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 18,
  },
});

export default LoaderScreen;
