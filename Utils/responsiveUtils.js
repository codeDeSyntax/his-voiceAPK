import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions where we designed our app (you can adjust these based on your design device)
const baseWidth = 375; // Standard iPhone width
const baseHeight = 812; // Standard iPhone height

// Scales
const wScale = SCREEN_WIDTH / baseWidth;
const hScale = SCREEN_HEIGHT / baseHeight;

// Use this for elements that should scale with screen width
export const horizontalScale = (size) => {
  return PixelRatio.roundToNearestPixel(size * wScale);
};

// Use this for elements that should scale with screen height
export const verticalScale = (size) => {
  return PixelRatio.roundToNearestPixel(size * hScale);
};

// Use this for font sizes
export const responsiveFontSize = (size) => {
  // We'll use a combination of width and height to scale font size
  const scale = Math.min(wScale, hScale);
  const newSize = size * scale;

  // Ensure font size doesn't get too small or too large
  const minSize = size * 0.8; // Minimum 80% of original size
  const maxSize = size * 1.4; // Maximum 140% of original size

  return Math.min(Math.max(newSize, minSize), maxSize);
};

// For consistent spacing throughout the app
export const spacing = {
  xs: horizontalScale(4),
  sm: horizontalScale(8),
  md: horizontalScale(12),
  lg: horizontalScale(16),
  xl: horizontalScale(24),
  xxl: horizontalScale(32),
}; 