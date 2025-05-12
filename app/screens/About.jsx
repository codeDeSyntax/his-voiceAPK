import React, { useContext } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SermonContext } from '../../Logic/globalState';
import DraggableFloatingBackButton from '../../components/FloatButton';

function About({ navigation }) {
  const { theme } = useContext(SermonContext);
  
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DraggableFloatingBackButton />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.appName}>His Voice</Text>
            <Text style={styles.appTagline}>Robert Lambert Lee </Text>
          </View>
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About the App</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Welcome to <Text style={[styles.highlightText, { color: '#3eb7ee' }]}>His Voice</Text>. 
              This app contains audio sermons and transcribed sermons of the Prophet Robert Lambert Lee. 
              Access meaningful spiritual content anytime, anywhere through both audio and text versions.
            </Text>
          </View>
        </View>

        {/* Apps section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Platforms</Text>
          <TouchableOpacity 
            style={styles.platformButton} 
            onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}
          >
            <Icon name="desktop-outline" size={22} color="white" style={styles.buttonIcon} />
            <Text style={styles.platformButtonText}>His Voice for Desktop</Text>
            <Icon name="open-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Website section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Official Website</Text>
          <TouchableOpacity 
            style={[styles.websiteCard, { backgroundColor: theme.colors.secondary }]}
            onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}
          >
            <View style={styles.websiteContent}>
              <Icon name="globe-outline" size={24} color="#3eb7ee" />
              <Text style={[styles.websiteText, { color: theme.colors.text }]}>hisvoice.tiiny.site</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#3eb7ee" />
          </TouchableOpacity>
        </View>

        {/* Gallery section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Gallery</Text>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={require('../../assets/hv.png')}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageWrapper}>
              <Image
                source={require('../../assets/hv.png')}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </View>
          </ScrollView>
        </View>

        {/* Version info */}
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: theme.colors.text + '80' }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContainer: {
    paddingTop: 10,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  heroCard: {
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
     fontFamily:"serif"
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
     fontFamily:"serif"
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
     fontFamily:"serif"
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
     fontFamily:"serif"
  },
  highlightText: {
    fontWeight: '700',
     fontFamily:"serif",
    fontSize: 18,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3eb7ee',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformButtonText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily:"serif"
  },
  buttonIcon: {
    marginRight: 12,
  },
  websiteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  websiteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  websiteText: {
    fontSize: 16,
    marginLeft: 12,
     fontFamily:"serif"
  },
  galleryContainer: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryImage: {
    width: 250,
    height: 150,
    borderRadius: 16,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
     fontFamily:"serif"
  },
});

export default About;