import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borders.radius.lg,
    backgroundColor: theme.colors.background.primary,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
  },
  filled: {
    backgroundColor: theme.colors.background.secondary,
  },
});
