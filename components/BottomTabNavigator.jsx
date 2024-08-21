import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import Home from '../screens/Home/CurrentSermon';
import Settings from '../screens/settings/Settings';
import About from '../screens/About/About';
import RecentOpenedSermons from '../screens/RecentlyOpened/RecentSermons';


// Import your image
import homeImage from '../assets/cloud.png';

// Import Ionicons
import Ionicons from 'react-native-vector-icons/Ionicons';
import SermonList from '../screens/SermonList/AllSermons';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = <Image source={homeImage} style={[styles.icon, { tintColor: color }]} />;
              break;
            case 'All Sermons':
              icon = <Ionicons name="list-outline" size={size} color={color} />;
              break;
              case 'Recent':
                icon = <Ionicons name="time-outline" size={size} color={color} />;
                break;
            case 'Settings':
              icon = <Ionicons name="settings-outline" size={size} color={color} />;
              break;
            case 'About':
              icon = <Ionicons name="information-circle-outline" size={size} color={color} />;
              break;
            default:
          }

          return icon;
        },
        tabBarActiveTintColor: '#6200ee', 
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true, 
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          position: 'absolute', bottom: 0, 
          paddingBottom:10,
          paddingTop:10,
          height:60
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="All Sermons" component={SermonList} />
      <Tab.Screen name="Recent" component={RecentOpenedSermons} />
      <Tab.Screen name="Settings" component={Settings} />
      {/* <Tab.Screen name="About" component={About} /> */}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

export default TabNavigator;
