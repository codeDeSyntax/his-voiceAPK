import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { responsiveFontSize, horizontalScale } from "../Utils/responsiveUtils";

const Logo = ({
  theme,
  size = "medium",
  showText = true,
  animated = false,
  style,
}) => {
  const sizes = {
    small: {
      logoSize: horizontalScale(40),
      textSize: responsiveFontSize(10),
      barHeight: 2,
      barWidth: 1,
    },
    medium: {
      logoSize: horizontalScale(80),
      textSize: responsiveFontSize(14),
      barHeight: 3,
      barWidth: 2,
    },
    large: {
      logoSize: horizontalScale(120),
      textSize: responsiveFontSize(18),
      barHeight: 4,
      barWidth: 2.5,
    },
  };

  const config = sizes[size];
  const primaryColor = theme.dark ? "#e6c3b8" : "#5d3211";
  const accentColor = theme.dark ? "#d4a574" : "#8b4513";

  // Waveform bars - varying heights to create wave effect
  const bars = [60, 40, 50, 35, 45, 30, 48, 28, 52, 25, 55];

  return (
    <View style={[styles.container, style]}>
      {/* Waveform Logo */}
      <View
        style={{
          width: config.logoSize,
          height: config.logoSize,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Background circle outline */}
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: config.logoSize / 2,
            borderWidth: 1,
            borderColor: primaryColor,
            opacity: 0.2,
          }}
        />

        {/* Waveform bars container */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: config.logoSize * 0.04,
            height: config.logoSize * 0.6,
          }}
        >
          {bars.map((barHeight, index) => (
            <View
              key={index}
              style={{
                width: config.barWidth,
                height: (config.logoSize * barHeight) / 100,
                backgroundColor:
                  index === 0 || index === bars.length - 1
                    ? primaryColor
                    : index === Math.floor(bars.length / 2)
                      ? accentColor
                      : primaryColor,
                borderRadius: config.barWidth / 2,
                opacity: index === 0 || index === bars.length - 1 ? 0.7 : 1,
              }}
            />
          ))}
        </View>

        {/* Center accent line */}
        <View
          style={{
            position: "absolute",
            width: "2%",
            height: "50%",
            backgroundColor: accentColor,
            borderRadius: 2,
            opacity: 0.4,
          }}
        />
      </View>

      {/* Text below logo */}
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.mainText,
              {
                fontSize: config.textSize,
                color: primaryColor,
                fontFamily: "ZillaSlab-Regular",
              },
            ]}
          >
            His Voice
          </Text>
          <View
            style={[
              styles.underline,
              {
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  mainText: {
    fontWeight: "300",
    letterSpacing: 1.5,
  },
  underline: {
    marginTop: 6,
    width: 50,
    height: 1.5,
  },
});

export default Logo;
