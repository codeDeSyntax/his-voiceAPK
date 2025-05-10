import React from 'react'
import { View ,Text, } from 'react-native'
import { styles } from '../styles/Allsermons'
import { Ionicons } from '@expo/vector-icons'
const ListAppBar = ({theme}) => {
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
            <Ionicons
              name="book"
              size={20}
              color={theme.dark === true ? theme.colors.text : "gray"}
            />
          </View>
  )
}

export default ListAppBar