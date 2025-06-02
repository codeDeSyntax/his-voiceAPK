import React from 'react'
import { View ,Text, } from 'react-native'
import { styles } from '../styles/Allsermons'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
const ListAppBar = ({theme}) => {
  const router  = useNavigation();
  return (
     <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={[
                styles.label,
                { color: theme.dark ? theme.colors.text : "white", fontFamily: "serif" },
              ]}
            >
              R.L.L sermons
            </Text>
          <View style={{flexDirection: "row", gap: 10}}>
          <Ionicons
              name="book"
              size={20}
              color={theme.dark === true ? theme.colors.text : "white"}
            />
            <Ionicons
              name="settings"
              size={20}
              color={theme.dark === true ? theme.colors.text : "white"}
              onPress={() => router?.navigate("Settings")}
              android_ripple={{
                color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              }}
            />
          </View>
          </View>
  )
}

export default ListAppBar