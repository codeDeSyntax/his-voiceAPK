import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../styles/Allsermons'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const ListAppBar = ({theme}) => {
  const router = useNavigation();
  
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: theme.dark 
          ? "rgba(80, 61, 49, 0.25)" 
          : "rgba(255, 255, 255, 0.95)",
        borderBottomWidth: 1,
        borderBottomColor: theme.dark 
          ? "rgba(255, 255, 255, 0.1)" 
          : "rgba(93, 50, 17, 0.1)",
        shadowColor: theme.dark ? "#000" : "#5d3211",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.label,
            { 
              color: theme.dark ? theme.colors.text : "#5d3211", 
              fontFamily: "serif",
              fontSize: 18,
              fontWeight: "600",
              letterSpacing: 0.5,
            },
          ]}
        >
          R.L.L Sermons
        </Text>
        {/* <Text
          style={{
            color: theme.dark 
              ? "rgba(255, 255, 255, 0.6)" 
              : "rgba(93, 50, 17, 0.6)",
            fontSize: 12,
            fontFamily: "serif",
            marginTop: 2,
          }}
        >
          Collection Library
        </Text> */}
      </View>
      
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.dark 
              ? "rgba(255, 255, 255, 0.1)" 
              : "rgba(93, 50, 17, 0.1)",
          }}
        >
          <Ionicons
            name="library"
            size={20}
            color={theme.dark ? theme.colors.text : "#5d3211"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.dark 
              ? "rgba(255, 255, 255, 0.1)" 
              : "rgba(93, 50, 17, 0.1)",
          }}
          onPress={() => router?.navigate("Settings")}
        >
          <Ionicons
            name="settings"
            size={20}
            color={theme.dark ? theme.colors.text : "#5d3211"}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ListAppBar