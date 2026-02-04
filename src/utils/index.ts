// Utility functions exports
export * from './scale';
export { 
  isIOS, 
  isAndroid, 
  isSmallScreen, 
  isMediumScreen, 
  isLargeScreen, 
  isLandscape, 
  isPortrait, 
  deviceInfo, 
  getSafeAreaInsets 
} from './device';
// Note: isTablet is exported from scale.ts to avoid conflicts