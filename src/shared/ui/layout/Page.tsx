import React from 'react';
import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
};

/**
 * Base layout wrapper for app screens.
 *
 * Handles:
 * - Safe area
 * - Default background color
 * - Optional fixed header/footer
 * - Optional scrollable content
 * - Default horizontal spacing
 *
 * Usage:
 *
 * <Screen
 *   header={<AppHeader title="Profile" />}
 *   footer={<Button title="Save" />}
 *   scrollable
 * >
 *   <Content />
 * </Screen>
 */

export const Page = ({
  children,
  header,
  footer,
  scrollable = false,
  style,
  contentContainerStyle,
  scrollProps,
}: ScreenProps) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {header}
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, styles.flex, contentContainerStyle]}>
          {children}
        </View>
      )}

      {footer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  flex: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.bottomTabPadding,
  },
});
