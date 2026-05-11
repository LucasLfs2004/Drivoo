import { User } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

import { Typography } from '../primitives';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'circle' | 'rounded' | 'square';

type AvatarProps = {
  source?: ImageSourcePropType | string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  variant = 'circle',
  style,
  onPress,
}) => {
  const sizeValue = sizeMap[size];
  const iconSize = iconSizeMap[size];
  const fontSize = fontSizeMap[size];

  const containerStyle = [
    styles.container,
    { width: sizeValue, height: sizeValue },
    variant === 'circle' && styles.circle,
    variant === 'rounded' && styles.rounded,
    variant === 'square' && styles.square,
    style,
  ];

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  const content = imageSource ? (
    <Image source={imageSource} style={styles.image} />
  ) : name ? (
    <Typography style={[styles.initials, { fontSize }]}>{getInitials(name)}</Typography>
  ) : (
    <User color={theme.colors.primary[500]} size={iconSize} />
  );

  if (onPress) {
    return (
      <Pressable
        style={containerStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={name ? `Avatar de ${name}` : 'Avatar'}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0 || !parts[0]) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const sizeMap = {
  xs: theme.scaleUtils.moderateScale(24),
  sm: theme.scaleUtils.moderateScale(32),
  md: theme.scaleUtils.moderateScale(40),
  lg: theme.scaleUtils.moderateScale(56),
  xl: theme.scaleUtils.moderateScale(80),
};

const iconSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 40,
};

const fontSizeMap = {
  xs: theme.typography.fontSize.xs,
  sm: theme.typography.fontSize.sm,
  md: theme.typography.fontSize.md,
  lg: theme.typography.fontSize.xl,
  xl: theme.typography.fontSize['3xl'],
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    borderRadius: theme.borders.radius.full,
  },
  rounded: {
    borderRadius: theme.borders.radius.md,
  },
  square: {
    borderRadius: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
