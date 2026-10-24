import React from "react";
import { StyleSheet, View } from "react-native";
import { Spinner } from "./Loader";

const LoaderScreen = () => {
  return (
    <View style={styles.container}>
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
});

export default LoaderScreen;

