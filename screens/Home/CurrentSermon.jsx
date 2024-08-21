// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SermonContext } from '../../Logic/globalState';
function Home() {

    const {selectedSermon} = React.useContext(SermonContext);
  return (
    <View style={styles.container}>
      <Text>{selectedSermon.sermon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
