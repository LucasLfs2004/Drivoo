import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

type ButtonIconComponent = React.ComponentType<{ color: string; size: number }>;
type ButtonIconElementType = React.ElementType<{ color: string; size: number }>;

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode | ButtonIconElementType;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconColor = disabled
    ? theme.colors.text.disabled
    : variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary[500]
      : variant === 'destructive'
        ? theme.colors.text.inverse
        : theme.colors.text.inverse;

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  } as const;

  const iconSize = iconSizeMap[size];
  const iconIsElement = React.isValidElement(icon);
  const iconIsComponent =
    Boolean(icon) &&
    !iconIsElement &&
    (typeof icon === 'function' || typeof icon === 'object');
  const iconElement = iconIsComponent
    ? React.createElement(icon as ButtonIconElementType, {
      color: iconColor,
      size: iconSize,
    })
    : (icon as React.ReactNode);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress || (() => {})}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary[500]
              : variant === 'destructive'
                ? theme.colors.semantic.error
                : theme.colors.text.inverse
          }
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{iconElement}</View>}
          <Text style={textStyleCombined}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{iconElement}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.sm,
  },
  // Variants
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  secondary: {
    backgroundColor: theme.colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.primary[300],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: theme.colors.semantic.error,
  },
  // Sizes
  sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    // minHeight: theme.scaleUtils.moderateScale(36),
  },
  md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md - theme.spacing.xs,
    // minHeight: theme.scaleUtils.moderateScale(48),
  },
  lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    // minHeight: theme.scaleUtils.moderateScale(56),
  },
  // States
  disabled: {
    backgroundColor: theme.colors.neutral[100],
    ...theme.shadows.md,
  },
  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryText: {
    color: theme.colors.text.inverse,
  },
  secondaryText: {
    color: theme.colors.text.inverse,
  },
  outlineText: {
    color: theme.colors.primary[300],
  },
  ghostText: {
    color: theme.colors.primary[300],
  },
  destructiveText: {
    color: theme.colors.text.inverse,
  },
  smText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
  },
  mdText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.md,
  },
  lgText: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});
