import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";
import React, { useState, useContext } from 'react';
import { View, TextInput, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SermonContext } from "../../Logic/globalState";
import { useAppTheme } from "../../Logic/theme";
import { ActivityIndicator } from "react-native-paper";

const sermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const SermonSearch = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredSermons, setFilteredSermons] = useState([]);
  const { setSelectedSermon } = useContext(SermonContext);
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    setLoading(true);
    setSearchText(text);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API delay

      if (text.trim() === '') {
        setFilteredSermons([]);
        setLoading(false);
        return;
      }

      const filtered = sermons
        .map((sermon) => {
          const regex = new RegExp(`(${text})`, 'i');
          const match = sermon.sermon.match(regex);
          if (match) {
            const sentence = sermon.sermon.slice(
              Math.max(0, match.index - 30),
              match.index + match[0].length + 30
            );
            return {
              title: sermon.title,
              location: sermon.location,
              sentence: sentence.replace(regex, `<highlight>${match[0]}</highlight>`),
              sermon: sermon.sermon,
              type: sermon.type
            };
          }
          return null;
        })
        .filter(Boolean);

      setFilteredSermons(filtered);
    } catch (error) {
      console.log('Could not fetch sermons', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSermonClick = (sermon) => {
    const searchPhrase = searchText;
    setSelectedSermon(sermon);
    navigation.navigate('Home', { sermon, searchPhrase });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search sermons..."
        value={searchText}
        onChangeText={handleSearch}
        placeholderTextColor={theme.colors.text}
      />
      <ScrollView>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color='blue' />
            <Text style={[styles.loaderText, { color: theme.colors.text }]}>
              Searching sermons...
            </Text>
          </View>
        ) : filteredSermons.length > 0 ? (
          filteredSermons.map((sermon, index) => (
            <Pressable key={index} style={styles.sermonContainer} onPress={() => handleSermonClick(sermon)}>
              <Text style={[styles.sermonTitle, { color: theme.colors.text }]}>{sermon.title}</Text>
              <Text style={[styles.sermonContent, { color: theme.colors.text }]}>
                {sermon.sentence.split(/(<highlight>.*?<\/highlight>)/g).map((part, i) => (
                  <Text
                    key={i}
                    style={part.startsWith('<highlight>') && part.endsWith('</highlight>')
                      ? styles.highlightedText
                      : undefined
                    }
                  >
                    {part.replace(/<\/?highlight>/g, '')}
                  </Text>
                ))}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.noResultsText, { color: theme.colors.text }]}>
            {searchText.trim() !== '' ? 'No sermons found' : 'Search quotes from all sermons'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    padding: 10,
    margin: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 60,
  },
  sermonContainer: {
    padding: 10,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  },
  sermonTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  sermonContent: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  highlightedText: {
    backgroundColor: 'green',
    color: '#14f39d',
    fontFamily: 'monospace',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'green',
    padding: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default SermonSearch;