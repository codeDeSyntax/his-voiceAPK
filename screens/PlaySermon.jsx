import { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Modal from 'react-native-modal';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SermonContext } from '../Logic/globalState';


const DownloadSermon = () => {
  const { selectedSermon } = useContext(SermonContext)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [text, setText] = useState(selectedSermon?.audioUrl);

  // Function to copy text with feedback
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(text);
      setIsCopied(true);
      Alert.alert('Success', 'URL copied to clipboard');
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const audioUrl = selectedSermon?.audioUrl;

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const showModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
    setTimeout(() => {
      setIsModalVisible(false);
    }, 2000);
  };

  return (
    <ImageBackground
      source={require('../assets/icon.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient 
        colors={['rgba(0,0,0,0.1)', '#2f2f2f', '#2f2f2f']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.urlContainer}>
            <Text style={styles.urlText}  >
              {audioUrl || 'No URL available'}
            </Text>
            <TouchableOpacity
              style={[
                styles.copyButton,
                isCopied && styles.copyButtonSuccess,
                { backgroundColor: "#202425" }
              ]}
              onPress={copyToClipboard}
              activeOpacity={0.7}
            >
              <FontAwesome5 
                name={isCopied ? "check" : "copy"} 
                size={16} 
                color="white"
                style={styles.copyIcon}
              />
              <Text style={styles.copyButtonText}>
                {isCopied ? 'Copied!' : 'Copy URL'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{selectedSermon.title}</Text>

          <TouchableOpacity 
            onPress={() => showModal('upcoming in newer versions')} 
            style={[styles.playButton, {backgroundColor: "#202425"}]} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <>
                <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="white" />
                <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => showModal('upcoming in newer versions')} 
            style={[styles.downloadButton, {backgroundColor: "#202425"}]} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <>
                <Ionicons name="download-outline" size={48} color="white" />
                <Text style={styles.buttonText}>Download</Text>
              </>
            )}
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
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    // width: '90%',
    maxWidth: 400,
  },
  urlText: {
    // flex: 1,
    color: '#ffffff',
    fontSize: 30,
    marginRight: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  copyButtonSuccess: {
    backgroundColor: '#34C759',
  },
  copyIcon: {
    marginRight: 6,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  playButton: {
    padding: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
    justifyContent: 'center',
  },
  downloadButton: {
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