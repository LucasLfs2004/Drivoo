import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../themes';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'md',
  backgroundColor = theme.colors.background.primary,
  style,
}) => {
  const containerStyle = [
    styles.base,
    {
      padding: theme.spacing[padding],
      backgroundColor,
    },
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});