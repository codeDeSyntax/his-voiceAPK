import React from 'react'
import { View ,Text, } from 'react-native'
import { styles } from '../styles/Allsermons'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
const ListAppBar = ({theme}) => {
  const router  = useRouter();
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
                { color: theme.colors.text, fontFamily: "serif" },
              ]}
            >
              R.L.L sermons
            </Text>
          <View style={{flexDirection: "row", gap: 10}}>
          <Ionicons
              name="book"
              size={20}
              color={theme.dark === true ? theme.colors.text : "gray"}
            />
            <Ionicons
              name="settings"
              size={20}
              color={theme.dark === true ? theme.colors.text : "gray"}
              onPress={() => router.push("screens/Settings")}
            />
          </View>
          </View>
  )
}

export default ListAppBar