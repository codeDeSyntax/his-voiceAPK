// import React, { useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Pressable,
// } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import { styles } from "../../styles/currentsermon";
// import { useNavigation } from "@react-navigation/native";
// import { useFonts } from "expo-font";

// const TopCardContent = ({
//   theme,
//   selectedSermon,
//   onScrollToTop,
//   onScrollToBottom,
//   onBack,
//   paragraphs,
//   paragraphLayouts,
//   scrollToParagraph,
//   isCardOpen,
// }) => {
//   const scrollViewRef = useRef(null);
//   const router = useNavigation();

//   // add ZillaSlab font family
//   const [fontsLoaded] = useFonts({
//     ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
//     ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
//   });

//   // Theme-aware colors
//   const cardBg = theme.dark ? "rgba(255,255,255,0.06)" : "rgba(93,50,17,0.04)";
//   const borderColor = theme.dark
//     ? "rgba(242,205,180,0.12)"
//     : "rgba(93,50,17,0.08)";
//   const accentColor = theme.dark ? "#f2cdb4" : "#5d3211";
//   const mutedText = theme.colors.text + "70";

//   // Action button component
//   const ActionButton = ({
//     icon,
//     label,
//     sublabel,
//     onPress,
//     variant = "default",
//   }) => {
//     const isPrimary = variant === "primary";
//     return (
//       <Pressable
//         onPress={onPress}
//         style={({ pressed }) => [
//           {
//             flexDirection: "row",
//             alignItems: "center",
//             padding: 16,
//             borderRadius: 16,
//             backgroundColor: pressed
//               ? theme.dark
//                 ? "rgba(255,255,255,0.1)"
//                 : "rgba(93,50,17,0.08)"
//               : cardBg,
//             borderWidth: 1,
//             borderColor: borderColor,
//             marginBottom: 10,
//           },
//         ]}
//         android_ripple={{
//           color: theme.dark ? "rgba(255,255,255,0.15)" : "rgba(93,50,17,0.1)",
//         }}
//       >
//         <View
//           style={{
//             width: 44,
//             height: 44,
//             borderRadius: 12,
//             backgroundColor: isPrimary
//               ? accentColor
//               : theme.dark
//                 ? "rgba(255,255,255,0.08)"
//                 : "rgba(93,50,17,0.06)",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <MaterialIcons
//             name={icon}
//             size={22}
//             color={isPrimary ? (theme.dark ? "#1a1512" : "#fff") : accentColor}
//           />
//         </View>
//         <View style={{ flex: 1, marginLeft: 14 }}>
//           <Text
//             style={{
//               fontSize: 15,
//               fontWeight: "600",
//               color: theme.colors.text,
//               fontFamily: "ZillaSlabsm",
//             }}
//           >
//             {label}
//           </Text>
//           {sublabel && (
//             <Text style={{ fontSize: 12, color: mutedText, marginTop: 2 }}>
//               {sublabel}
//             </Text>
//           )}
//         </View>
//         <MaterialIcons name="chevron-right" size={20} color={mutedText} />
//       </Pressable>
//     );
//   };

//   return (
//     <View
//       style={[
//         {
//           display: !isCardOpen && "none",
//           flex: 1,
//           paddingHorizontal: 16,
//           paddingTop: 8,
//         },
//       ]}
//     >
//       {/* Compact Hero Section - Current Sermon */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           backgroundColor: cardBg,
//           borderRadius: 16,
//           padding: 16,
//           marginBottom: 16,
//           borderWidth: 1,
//           borderColor: borderColor,
//         }}
//       >
//         {/* Compact Icon Badge */}
//         <View
//           style={{
//             width: 48,
//             height: 48,
//             borderRadius: 12,
//             backgroundColor: accentColor,
//             justifyContent: "center",
//             alignItems: "center",
//             marginRight: 12,
//           }}
//         >
//           <MaterialIcons
//             name="auto-stories"
//             size={24}
//             color={theme.dark ? "#1a1512" : "#fff"}
//           />
//         </View>

//         {/* Title and Meta */}
//         <View style={{ flex: 1 }}>
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "600",
//               color: theme.colors.text,
//               fontFamily: "ZillaSlabsm",
//               marginBottom: 4,
//               lineHeight: 20,
//             }}
//             numberOfLines={2}
//           >
//             {selectedSermon?.title || "No sermon selected"}
//           </Text>

//           {/* Compact Meta Row */}
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               flexWrap: "wrap",
//               gap: 8,
//             }}
//           >
//             {selectedSermon?.date && (
//               <Text
//                 style={{
//                   fontSize: 11,
//                   color: mutedText,
//                   fontFamily: "ZillaSlab",
//                 }}
//               >
//                 {selectedSermon.date}
//               </Text>
//             )}
//             {selectedSermon?.location && (
//               <Text
//                 style={{
//                   fontSize: 11,
//                   color: mutedText,
//                   fontFamily: "ZillaSlab",
//                 }}
//               >
//                 {selectedSermon.location}
//               </Text>
//             )}
//             <Text
//               style={{
//                 fontSize: 11,
//                 color: mutedText,
//                 fontFamily: "ZillaSlab",
//               }}
//             >
//               {paragraphs?.length || 0} paragraphs
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Compact Action Grid */}
//       <View style={{ flex: 1 }}>
//         {/* Primary Actions Row */}
//         <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
//           <Pressable
//             onPress={onScrollToTop}
//             style={({ pressed }) => [
//               {
//                 flex: 1,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 padding: 14,
//                 borderRadius: 12,
//                 backgroundColor: pressed
//                   ? theme.dark
//                     ? "rgba(255,255,255,0.1)"
//                     : "rgba(93,50,17,0.12)"
//                   : accentColor,
//                 borderWidth: pressed ? 1 : 0,
//                 borderColor: borderColor,
//               },
//             ]}
//             android_ripple={{
//               color: theme.dark
//                 ? "rgba(255,255,255,0.2)"
//                 : "rgba(255,255,255,0.2)",
//             }}
//           >
//             <MaterialIcons
//               name="vertical-align-top"
//               size={20}
//               color={theme.dark ? "#1a1512" : "#fff"}
//             />
//             <Text
//               style={{
//                 fontSize: 14,
//                 fontWeight: "600",
//                 color: theme.dark ? "#1a1512" : "#fff",
//                 fontFamily: "ZillaSlabsm",
//                 marginLeft: 8,
//               }}
//             >
//               To Top
//             </Text>
//           </Pressable>

//           <Pressable
//             onPress={onScrollToBottom}
//             style={({ pressed }) => [
//               {
//                 flex: 1,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 padding: 14,
//                 borderRadius: 12,
//                 backgroundColor: pressed
//                   ? theme.dark
//                     ? "rgba(255,255,255,0.1)"
//                     : "rgba(93,50,17,0.08)"
//                   : cardBg,
//                 borderWidth: 1,
//                 borderColor: borderColor,
//               },
//             ]}
//             android_ripple={{
//               color: theme.dark
//                 ? "rgba(255,255,255,0.15)"
//                 : "rgba(93,50,17,0.1)",
//             }}
//           >
//             <MaterialIcons
//               name="vertical-align-bottom"
//               size={20}
//               color={accentColor}
//             />
//             <Text
//               style={{
//                 fontSize: 14,
//                 fontWeight: "600",
//                 color: theme.colors.text,
//                 fontFamily: "ZillaSlabsm",
//                 marginLeft: 8,
//               }}
//             >
//               To End
//             </Text>
//           </Pressable>
//         </View>

//         {/* Secondary Actions Row */}
//         <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
//           <Pressable
//             onPress={onBack}
//             style={({ pressed }) => [
//               {
//                 flex: 1,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 padding: 14,
//                 borderRadius: 12,
//                 backgroundColor: pressed
//                   ? theme.dark
//                     ? "rgba(255,255,255,0.1)"
//                     : "rgba(93,50,17,0.08)"
//                   : cardBg,
//                 borderWidth: 1,
//                 borderColor: borderColor,
//               },
//             ]}
//             android_ripple={{
//               color: theme.dark
//                 ? "rgba(255,255,255,0.15)"
//                 : "rgba(93,50,17,0.1)",
//             }}
//           >
//             <MaterialIcons name="library-books" size={20} color={accentColor} />
//             <Text
//               style={{
//                 fontSize: 14,
//                 fontWeight: "600",
//                 color: theme.colors.text,
//                 fontFamily: "ZillaSlabsm",
//                 marginLeft: 8,
//               }}
//             >
//               All Sermons
//             </Text>
//           </Pressable>

//           <Pressable
//             onPress={() => router.push("Settings")}
//             style={({ pressed }) => [
//               {
//                 flex: 1,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 padding: 14,
//                 borderRadius: 12,
//                 backgroundColor: pressed
//                   ? theme.dark
//                     ? "rgba(255,255,255,0.1)"
//                     : "rgba(93,50,17,0.08)"
//                   : cardBg,
//                 borderWidth: 1,
//                 borderColor: borderColor,
//               },
//             ]}
//             android_ripple={{
//               color: theme.dark
//                 ? "rgba(255,255,255,0.15)"
//                 : "rgba(93,50,17,0.1)",
//             }}
//           >
//             <MaterialIcons name="settings" size={20} color={accentColor} />
//             <Text
//               style={{
//                 fontSize: 14,
//                 fontWeight: "600",
//                 color: theme.colors.text,
//                 fontFamily: "ZillaSlabsm",
//                 marginLeft: 8,
//               }}
//             >
//               Settings
//             </Text>
//           </Pressable>
//         </View>

//         {/* Bottom spacer */}
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "flex-end",
//             alignItems: "center",
//             paddingBottom: 16,
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 11,
//               color: theme.colors.text + "40",
//               fontFamily: "ZillaSlab",
//             }}
//           >
//             Swipe down to close
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default TopCardContent;
