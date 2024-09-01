import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SermonContext } from '../Logic/globalState';
import { useAppTheme } from '../Logic/theme';

const DownloadSermon = () => {
  const { selectedSermon } = React.useContext(SermonContext);
  const { theme } = useAppTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [sound, setSound] = useState(null);

  const audioUrl = selectedSermon.type === 'mp3' ? selectedSermon.audioUrl : null;

  // Here, we disable all buttons by setting the disabled prop to true

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sermon Audio</Text>
      <Text style={styles.subtitle}>{selectedSermon.title}</Text>

      <TouchableOpacity 
       onPress={() => alert('Not availble yet')}
        style={[styles.playButton, styles.disabledButton]} 
        // disabled={true} // Disable the play button
      >
        {isLoadingAudio ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="white" />
            <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
      onPress={() => alert('Not availble yet')}
        style={[styles.downloadButton, styles.disabledButton]} 
        // disabled={true} // Disable the download button
      >
        {isDownloading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name="download-outline" size={48} color="white" />
            <Text style={styles.buttonText}>Download</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>{audioUrl}</Text>
      </TouchableOpacity>
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
    fontWeight: 'bold',
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
  disabledButton: {
    opacity: 4, // This visually indicates that the button is disabled
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
  linkButton: {
    paddingVertical: 10,
    marginTop: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#5eb7ee',
    fontStyle: 'italic',
  },
});

export default DownloadSermon;
