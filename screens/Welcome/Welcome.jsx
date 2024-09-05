import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

const Welcome = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Merienda-VariableFont': require('../../assets/fonts/Merienda-VariableFont_wght.ttf'),
    'Philosopher-Regular': require('../../assets/fonts/Philosopher-Regular.ttf'),
  });

  const handleGoToSermons = () => {
    navigation.navigate('MainTabs');
  };

  if (!fontsLoaded) {
    return null; // Or a loading component
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Transcribed and audio versions of Robert Lambert Lee sermons
        </Text>
        <Text style={styles.subtitle}>1964 - 1973</Text>
        <TouchableOpacity style={styles.button} onPress={handleGoToSermons}>
          <Text style={styles.buttonText}>Go to Sermons</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2d2d2d', // Light gray background
  },
  content: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 10,
    shadowColor: "#fAFAFA",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontFamily: 'Merienda-VariableFont',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  subtitle: {
    fontFamily: 'Merienda-VariableFont',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666666',
  },
  button: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontFamily: 'Merienda-VariableFont',
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Welcome;