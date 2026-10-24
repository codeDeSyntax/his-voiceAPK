import React from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../../providers/SermonProvider";
import WelcomeLibraryAction from "../components/WelcomeLibraryAction";
import { useWelcomeLibrary } from "../hooks/useWelcomeLibrary";
import { getWelcomePalette, welcomeStyles as styles } from "../styles";

const Welcome = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { theme, settings, updateSettings } = useAppContext();
  const library = useWelcomeLibrary();
  const colors = getWelcomePalette(theme);
  const heroHeight = Math.min((width - 44) * 0.78, height < 740 ? 200 : 280);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}>
        <View style={styles.frame}>
          <View style={styles.header}>
            <Text style={[styles.wordmark, { color: colors.ink }]}>HisVoice</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={theme.dark ? "Use light theme" : "Use dark theme"}
              onPress={() => updateSettings({ darkMode: !settings.darkMode })}
              style={({ pressed }) => [styles.themeButton, { backgroundColor: pressed ? colors.surface : "transparent" }]}>
              <MaterialCommunityIcons name="theme-light-dark" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <View style={[styles.hero, { minHeight: heroHeight }]}>
            <View pointerEvents="none" style={styles.heroArtwork}>
              <Image accessible={false} source={require("../../../../assets/browntrees.jpg")}
                resizeMode="cover" style={styles.heroImage} />
              <LinearGradient
                colors={["rgba(22,15,10,0)", "rgba(22,15,10,0.16)", "rgba(22,15,10,0.55)"]}
                locations={[0, 0.35, 1]} style={styles.heroArtwork} />
              <LinearGradient
                colors={[colors.background, `${colors.background}00`, `${colors.background}00`, colors.background]}
                locations={[0, 0.09, 0.91, 1]} style={styles.heroArtwork} />
              <LinearGradient
                colors={[colors.background, `${colors.background}00`, `${colors.background}00`, colors.background]}
                locations={[0, 0.055, 0.945, 1]}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.heroArtwork} />
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.eyebrow}>THE SERMONS OF</Text>
              <Text accessibilityRole="header" style={styles.title}>Robert{"\n"}Lambert Lee</Text>
            </View>
          </View>

          <View style={styles.metadata}>
            <View style={styles.formats}>
              <Feather name="book-open" size={13} color={colors.muted} />
              <Text style={[styles.metadataText, { color: colors.muted }]}>Transcribed</Text>
              <Text style={[styles.metadataText, { color: colors.muted }]}>·</Text>
              <Feather name="headphones" size={13} color={colors.muted} />
              <Text style={[styles.metadataText, { color: colors.muted }]}>Audio</Text>
            </View>
            <Text style={[styles.years, { color: colors.muted }]}>1964–1973</Text>
          </View>

          <View style={styles.quote}>
            <View style={[styles.quoteBody, { borderLeftColor: colors.border }]}>
              <Text style={[styles.quoteText, { color: colors.ink }]}>
                And I saw another mighty angel come down from heaven, clothed with a cloud: and a rainbow was upon his head.
              </Text>
              <Text style={[styles.quoteReference, { color: colors.muted }]}>REVELATION 10:1</Text>
            </View>
          </View>

          <WelcomeLibraryAction
            {...library}
            theme={theme}
            onOpen={() => router.replace("/sermons")}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Welcome;
