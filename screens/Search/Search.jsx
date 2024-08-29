import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";
import React, { useState , useContext} from 'react';
import { View, TextInput, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SermonContext } from "../../Logic/globalState";

const sermons = [
    ...earlySermons,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...lastSet,
  ];

const SermonSearch = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredSermons, setFilteredSermons] = useState([]);
  const {setSelectedSermon} = useContext(SermonContext)

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredSermons([]);
      return;
    }

    const filtered = sermons
      .map((sermon) => {
        const regex = new RegExp(`(${text})`, 'i');
        const match = sermon.sermon.match(regex);
        if (match) {
          // Get the sentence containing the match
          const sentence = sermon.sermon.slice(
            Math.max(0, match.index - 30), // Start a bit before the match
            match.index + match[0].length + 30 // End a bit after the match
          );
          return {
            title: sermon.title,
            location:sermon.location,
            sentence: sentence.replace(regex, `<highlight>${match[0]}</highlight>`),
            sermon:sermon.sermon
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null values

    setFilteredSermons(filtered);
    
  };

  const handleSermonClick = (sermon) => {
    setSelectedSermon(sermon)

    navigation.navigate('Home')
}

  return (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search sermons..."
        value={searchText}
        onChangeText={handleSearch}
      />
      <ScrollView>
        {filteredSermons.map((sermon, index) => (
          <Pressable key={index} style={styles.sermonContainer} onPress={() => handleSermonClick(sermon)}>
            <Text style={styles.sermonTitle}>{sermon.title}</Text>
            <Text>
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
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    padding: 10,
    margin: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop:60
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
  highlightedText: {
    backgroundColor: 'yellow',
  },
});

export default SermonSearch;
