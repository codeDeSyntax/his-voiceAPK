import  { useState,useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet,ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { SermonContext } from '../Logic/globalState';
import { useAppTheme } from '../Logic/theme';

const DownloadSermon = () => {
  const { selectedSermon } = useContext(SermonContext);
  const { theme } = useAppTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const audioUrl =  selectedSermon?.audioUrl;

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const showModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
    setTimeout(() => {
      setIsModalVisible(false);
    }, 2000); // Automatically close modal after 2 seconds
  };

  return (
   <ImageBackground
   source={require('../assets/icon.png')} // Make sure to add your background image
      style={styles.backgroundImage}
   >
    <LinearGradient 
     colors={['rgba(0,0,0,0.1)', '#2f2f2f', '#2f2f2f']}
     locations={[0, 0.5, 1]}
     style={styles.gradient}
    >
    <View style={[styles.container,]}>
      <Text style={[styles.title, { color: "#fafafa", textAlign:'center' }]}>Sermon Audio{audioUrl}</Text>
      <Text style={styles.subtitle}>{selectedSermon.title}</Text>

      <TouchableOpacity onPress={() => showModal('upcomming in newer versions')} style={[styles.playButton, {backgroundColor:theme.colors.secondary}]} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="white" />
            <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => showModal('upcoming in newer versions')} style={[styles.downloadButton, {backgroundColor:theme.colors.secondary}]} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name="download-outline" size={48} color="white" />
            <Text style={styles.buttonText}>Download</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleLinkPress(audioUrl)} style={{ paddingVertical: 10 }}>
        <Text style={[{ textDecorationLine: 'underline', color: '#5eb7ee', fontStyle: 'italic' }]}>{audioUrl || selectedSermon?.audioUrl}</Text>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{modalMessage}</Text>
        </View>
      </Modal>
    </View>
    </LinearGradient>
   </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '50%',
    // paddingTop:20
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  playButton: {
    // backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
    justifyContent: 'center',
  },
  downloadButton: {
    // backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DownloadSermon;
