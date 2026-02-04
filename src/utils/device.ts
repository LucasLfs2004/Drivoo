import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device type detection
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Screen size detection
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 414;
export const isLargeScreen = width >= 414 && width < 768;
export const isTablet = width >= 768;

// Orientation detection
export const isLandscape = width > height;
export const isPortrait = height > width;

// Device info
export const deviceInfo = {
  width,
  height,
  isIOS,
  isAndroid,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isTablet,
  isLandscape,
  isPortrait,
};

// Safe area helpers (basic implementation)
export const getSafeAreaInsets = () => {
  // This is a basic implementation
  // In a real app, you'd use react-native-safe-area-context
  return {
    top: isIOS ? 44 : 0,
    bottom: isIOS ? 34 : 0,
    left: 0,
    right: 0,
  };
};