import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { SermonContext } from '../Logic/globalState';
import { useAppTheme } from '../Logic/theme';

const DownloadSermon = () => {
  const { selectedSermon } = React.useContext(SermonContext);
  const { theme } = useAppTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const audioUrl = selectedSermon.type === 'mp3' && selectedSermon.audioUrl;

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Sermon Audio</Text>
      <Text style={styles.subtitle}>{selectedSermon.title}</Text>

      <TouchableOpacity onPress={() => showModal('Play functionality not available yet')} style={styles.playButton} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="white" />
            <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => showModal('Download functionality not available yet')} style={styles.downloadButton} disabled={isLoading}>
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
        <Text style={[{ textDecorationLine: 'underline', color: '#5eb7ee', fontStyle: 'italic' }]}>{audioUrl}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    padding: 20,
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
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
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
