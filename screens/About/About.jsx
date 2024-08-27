import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

function About() {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>About the App</Text>
        <Text style={styles.text}>
          Welcome to our app! This application is designed to help you manage your tasks effectively and efficiently. 
          With a user-friendly interface and a variety of features, you'll find it easy to stay organized and on top of your responsibilities.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Related Products</Text>
        <View style={styles.relatedProducts}>
          <TouchableOpacity style={styles.productLink} onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
            <Icon name='link' size={20} color="#007bff" />
            <Text style={styles.productText}>Product 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.productLink} onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
            <Icon name='link' size={20} color="#007bff" />
            <Text style={styles.productText}>Product 2</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Visit Our Website</Text>
        <TouchableOpacity onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
          <Text style={styles.link}>https://hisvoice.tiiny.site</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop:50,
    backgroundColor: '#2d2d2d',
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#fafafa'
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fafafa',
  },
  relatedProducts: {
    marginTop: 10,
  },
  productLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  productText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 10,
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default About;
