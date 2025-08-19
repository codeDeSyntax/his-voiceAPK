import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useAppContext } from "../../Logic/globalState";
import DraggableFloatingButton from "../../components/FloatButton";

function About({ navigation }) {
  const { theme } = useAppContext();
  const [pressedCard, setPressedCard] = useState(null);

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const ModernCard = ({
    icon,
    title,
    subtitle,
    children,
    onPress,
    delay = 0,
    cardId,
  }) => {
    const scaleValue = useRef(useSharedValue(1)).current;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

    const handlePressIn = () => {
      scaleValue.value = withSpring(0.98);
      setPressedCard(cardId);
    };

    const handlePressOut = () => {
      scaleValue.value = withSpring(1);
      setPressedCard(null);
    };

    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            onPress={onPress}
            onPressIn={onPress ? handlePressIn : undefined}
            onPressOut={onPress ? handlePressOut : undefined}
            activeOpacity={onPress ? 0.9 : 1}
            disabled={!onPress}
            style={{
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(0, 0, 0, 0.02)",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.dark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Card Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: subtitle ? 8 : 16,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(93, 50, 17, 0.15)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={theme.dark ? theme.colors.hlight : "#5d3211"}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    fontFamily: "ZillaSlab",
                    color: theme.colors.text,
                    letterSpacing: 0.3,
                  }}
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.text + "80",
                      marginTop: 2,
                      fontFamily: "ZillaSlab",
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>

              {onPress && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.text + "60"}
                />
              )}
            </View>

            {children}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background */}
      <ImageBackground
        source={require("../../assets/gradbg.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={
            theme.dark
              ? [
                  "rgba(28, 25, 23, 0.95)",
                  "rgba(41, 37, 36, 0.9)",
                  "rgba(28, 25, 23, 0.95)",
                ]
              : [
                  "rgba(255, 251, 235, 0.95)",
                  "rgba(254, 249, 235, 0.9)",
                  "rgba(255, 251, 235, 0.95)",
                ]
          }
          style={{ flex: 1 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Modern Header */}
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: theme.dark
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.02)",
                borderBottomWidth: 1,
                borderBottomColor: theme.dark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.dark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  fontFamily: "ZillaSlab",
                  color: theme.colors.text,
                  flex: 1,
                }}
              >
                About
              </Text>
            </Animated.View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Section */}
              <Animated.View
                entering={FadeInUp.delay(100).duration(700)}
                style={{
                  alignItems: "center",
                  marginBottom: 32,
                }}
              >
                <View
                  style={{
                    // width: 80,
                    // height: 80,
                    borderRadius: 40,
                    // backgroundColor: theme.dark
                    //   ? "rgba(213, 122, 62, 0.2)"
                    //   : "rgba(93, 50, 17, 0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                 {/* image icon */}
                 <Image source={require("../../assets/splashicon.png")} alt="alt" width={20} height={4} style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                }}/>
                </View>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    fontFamily: "ZillaSlab",
                    color: theme.colors.text,
                    textAlign: "center",
                    marginBottom: 8,
                    letterSpacing: 0.5,
                  }}
                >
                  His Voice
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text + "90",
                    textAlign: "center",
                    fontFamily: "ZillaSlab",
                    lineHeight: 22,
                  }}
                >
                  Sermons & Teachings of Prophet Robert Lambert Lee
                </Text>
              </Animated.View>

              {/* About Card */}
              <ModernCard
                icon="information-circle-outline"
                title="About the App"
                delay={200}
                cardId="about"
              >
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: theme.colors.text,
                    fontFamily: "ZillaSlab",
                    letterSpacing: 0.2,
                  }}
                >
                  Welcome to{" "}
                  <Text
                    style={{
                      fontWeight: "700",
                      color: theme.dark ? theme.colors.hlight : "#5d3211",
                    }}
                  >
                    His Voice
                  </Text>
                  . This app contains audio sermons and transcribed sermons of
                  the Prophet Robert Lambert Lee. A sermon may have both audio
                  and text versions.
                </Text>
              </ModernCard>

              {/* Desktop Version Card */}
              <ModernCard
                icon="desktop-outline"
                title="Desktop Version"
                subtitle="Access the full web experience"
                onPress={() => handleLinkPress("https://hisvoice.vercel.app/")}
                delay={300}
                cardId="desktop"
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.dark
                      ? "rgba(213, 122, 62, 0.1)"
                      : "rgba(93, 50, 17, 0.1)",
                    padding: 12,
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={theme.dark ? theme.colors.hlight : "#5d3211"}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.dark ? theme.colors.hlight : "#5d3211",
                      marginLeft: 8,
                      fontFamily: "ZillaSlab",
                      fontWeight: "500",
                    }}
                  >
                    hisvoice.vercel.app
                  </Text>
                </View>
              </ModernCard>

              {/* Features Card */}
              <ModernCard
                icon="list-outline"
                title="Features"
                delay={400}
                cardId="features"
              >
                <View style={{ gap: 12 }}>
                  {[
                    { icon: "headset-outline", text: "Audio Sermons" },
                    { icon: "document-text-outline", text: "Transcribed Text" },
                    { icon: "search-outline", text: "Search Content" },
                    { icon: "bookmark-outline", text: "Save Favorites" },
                    { icon: "settings-outline", text: "Customize Experience" },
                  ].map((feature, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: theme.dark
                            ? "rgba(213, 122, 62, 0.1)"
                            : "rgba(93, 50, 17, 0.1)",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={feature.icon}
                          size={12}
                          color={theme.dark ? theme.colors.hlight : "#5d3211"}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.text,
                          fontFamily: "ZillaSlab",
                        }}
                      >
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </ModernCard>

              {/* Website Preview Card */}
              <ModernCard
                icon="image-outline"
                title="Website Preview"
                onPress={() => handleLinkPress("https://hisvoice.vercel.app/")}
                delay={500}
                cardId="preview"
              >
                <View
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    marginTop: 8,
                  }}
                >
                  <Image
                    source={require("../../assets/site.png")}
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      padding: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontWeight: "500",
                        fontFamily: "ZillaSlab",
                      }}
                    >
                      Visit Website
                    </Text>
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          marginRight: 4,
                        }}
                      >
                        Open
                      </Text>
                      <Ionicons name="open-outline" size={12} color="white" />
                    </View>
                  </View>
                </View>
              </ModernCard>

              {/* Contact Card */}
              <ModernCard
                icon="mail-outline"
                title="Contact & Support"
                delay={600}
                cardId="contact"
                
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 8,
                  }}
                >
                  {[
                    { icon: "logo-facebook", label: "Facebook" },
                    { icon: "logo-twitter", label: "Twitter" },
                    { icon: "logo-youtube", label: "YouTube" },
                    { icon: "mail-outline", label: "Email" },
                  ].map((social, index) => (
                    <TouchableOpacity
                    disabled={true}
                      key={index}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: theme.dark
                          ? "rgba(61, 61, 61, 0.73)"
                          : "rgba(193, 191, 191, 0.388)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.dark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Ionicons
                        name={social.icon}
                        size={20}
                        color={theme.dark ? theme.colors.hlight +"30" : "#5d321120"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ModernCard>

              {/* Footer */}
              <View
                style={{
                  alignItems: "center",
                  marginTop: 20,
                  marginBottom: 40,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text + "60",
                    fontFamily: "ZillaSlab",
                    textAlign: "center",
                  }}
                >
                  © 2025 His Voice App. All rights reserved.
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.colors.text + "40",
                    fontFamily: "ZillaSlab",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  Made with ♥ for the community
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>

      <DraggableFloatingButton />
    </View>
  );
}

export default About;
