import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { SermonContext } from '../Logic/globalState';

const DownloadSermon = () => {
  const { selectedSermon } = React.useContext(SermonContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState(null);

  const audioUrl = selectedSermon.type === 'mp3' && selectedSermon.audioUrl;

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const uri = await FileSystem.downloadAsync(
        audioUrl,
        FileSystem.documentDirectory + `${selectedSermon.title}.mp3`
      );
      setIsLoading(false);
      alert('Sermon downloaded successfully!');
    } catch (error) {
      console.log('Error downloading audio', error);
      setIsLoading(false);
      alert('Failed to download sermon. Please try again.');
    }
  };

  const playSound = async () => {
    if (audioUrl) {
      setIsLoading(true);
      try {
        if (sound) {
          if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        } else {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('Error playing audio', error);
        alert('Failed to play sermon. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sermon Audio</Text>
      <Text style={styles.subtitle}>{selectedSermon.title}</Text>

      <TouchableOpacity onPress={playSound} style={styles.playButton} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="white" />
            <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDownload} style={styles.downloadButton} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name="download-outline" size={48} color="white" />
            <Text style={styles.buttonText}>Download</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = {
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
};

export default DownloadSermon;