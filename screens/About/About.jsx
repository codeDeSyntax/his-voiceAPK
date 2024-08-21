// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function About() {
  return (
    <View style={styles.container}>
      <Text>About screen Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default About;
