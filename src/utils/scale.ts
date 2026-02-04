import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 6/7/8)
const baseWidth = 375;
const baseHeight = 667;

// Scale functions
export const scale = (size: number): number => {
  return (screenWidth / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  return (screenHeight / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  const newSize = moderateScale(size);
  return Math.max(newSize, PixelRatio.roundToNearestPixel(newSize));
};

// Screen dimensions
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
};

// Responsive breakpoints
export const breakpoints = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
};

// Check if device is tablet
export const isTablet = (): boolean => {
  return screenWidth >= breakpoints.tablet;
};