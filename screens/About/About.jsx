import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useContext } from 'react';
import { SermonContext } from '../../Logic/globalState';
import { useAppTheme } from '../../Logic/theme';

function About({ navigation }) {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const { theme } = useContext(SermonContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.dark ? '#3d3d3d' : 'white' }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>About the App</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Welcome to <Text style={styles.highlightText}>His voice</Text>. This app only contains audio sermons and transcribed sermons of the Prophet Robert Lambert Lee. A sermon may have both audio and text versions.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.dark ? '#3d3d3d' : 'white' }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Apps</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}
            >
              <Text style={styles.buttonText}>His voice App PC version</Text>
              <Icon name="open-outline" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: theme.dark ? '#3d3d3d' : 'white' }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Visit site</Text>
            <TouchableOpacity onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
              <Text style={styles.link}>https://hisvoice.tiiny.site</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/siteImg.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40
  },
  header: {
    height: 60,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  highlightText: {
    fontWeight: '800',
    fontFamily: 'Roboto',
    color: '#3eb7ee',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  imageContainer: {
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default About;