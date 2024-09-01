import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../Logic/theme';

function About({ navigation }) {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor:theme.colors.background}]}>
      <TouchableOpacity style={[styles.backButton, {}]} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={[styles.backButtonText, {color:theme.colors.text}]}>Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.section, {backgroundColor:theme.dark === true ? '#3d3d3d' : 'white'}]}>
          <Text style={[styles.title, {color:theme.colors.text}]}>About the App</Text>
          <Text style={[styles.text,{color:theme.colors.text}]}>
            Welcome to <Text style={{fontWeight:'800', fontFamily:'Roboto',color:'#3eb7ee',fontSize:18}}>His voice</Text> This app only contains audio sermons and transcribed sermons of the Prophet Robert Lambert Lee. A sermon may have both audio and text versions.
          </Text>
        </View>
        <View style={[styles.section, {backgroundColor:theme.dark === true ? '#3d3d3d' : 'white'}]}>
          <Text style={[styles.title, {color:theme.colors.text}]}>Apps</Text>
          <View style={[styles.relatedProducts, {color:theme.colors.text}]}>
           
            <TouchableOpacity style={styles.productLink} onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
              <Icon name='link' size={20} color="#007bff" />
              <Text style={styles.productText}>His voice App PC version</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.section, {backgroundColor:theme.dark === true ? '#3d3d3d' : 'white'}]}>
          <Text style={[styles.title, {color:theme.colors.text}]}>Visit site</Text>
          <TouchableOpacity onPress={() => handleLinkPress('https://hisvoice.tiiny.site')}>
            <Text style={styles.link}>https://hisvoice.tiiny.site</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/siteImg.jpg')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 40,
    marginLeft: 10,
  },
  backButtonText: {
    color: '#fafafa',
    fontSize: 16,
    marginLeft: 5,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    elevation:3,
    shadowColor:'#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fafafa',
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
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});

export default About;