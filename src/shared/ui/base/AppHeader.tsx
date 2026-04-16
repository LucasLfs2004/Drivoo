import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../theme';
import { Button } from './Button';

type Props = {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  titleAlign?: 'left' | 'center';
  safeAreaTop?: boolean;
  variant?: 'surface' | 'brand';
  style?: StyleProp<ViewStyle>;
};

export const AppHeader: React.FC<Props> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  rightContent,
  titleAlign = 'left',
  safeAreaTop = false,
  variant = 'surface',
  style,
}) => {
  const isBrand = variant === 'brand';
  const titleColor = isBrand ? theme.colors.text.inverse : theme.colors.text.primary;
  const subtitleColor = isBrand ? theme.colors.primary[100] : theme.colors.text.secondary;
  const backIconColor = isBrand ? theme.colors.text.inverse : theme.colors.text.primary;

  const content = (
    <View
      style={[styles.container, isBrand ? styles.containerBrand : styles.containerSurface, style]}
    >
      <View style={[styles.side]}>
        {showBackButton && onBackPress ? (
          <Button
            title="Voltar"
            variant="ghost"
            icon={<ArrowLeft color={theme.colors.primary[300]} size={16} />}
            size="sm"
            onPress={onBackPress}
          />
        ) : null}
      </View>
      <View style={styles.row}>
        <View style={[styles.copy, titleAlign === 'center' ? styles.copyCenter : styles.copyLeft]}>
          {title ? (
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: titleColor },
                titleAlign === 'center' ? styles.titleCenter : styles.titleLeft,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: subtitleColor },
                titleAlign === 'center' ? styles.subtitleCenter : styles.subtitleLeft,
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.sideRight]}>{rightContent}</View>
      </View>
    </View>
  );

  if (safeAreaTop) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    marginBottom: theme.spacing.lg,
    // paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.lg,
    borderWidth: theme.borders.width.base,
    ...theme.shadows.md,
  },
  containerSurface: {
    backgroundColor: theme.colors.coolGray[50],
    borderColor: theme.colors.coolGray[200],
  },
  containerBrand: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[600],
  },
  side: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    columnGap: theme.spacing.md,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSurface: {
    backgroundColor: theme.colors.background.elevated,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.coolGray[200],
    ...theme.shadows.sm,
  },
  backButtonBrand: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: theme.borders.width.base,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  copy: {
    flex: 1,
    // minHeight: 40,
    paddingHorizontal: theme.spacing.md,
    // justifyContent: 'center',
  },
  copyLeft: {
    alignItems: 'flex-start',
  },
  copyCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary[800],
  },
  titleLeft: {
    textAlign: 'left',
  },
  titleCenter: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  subtitleLeft: {
    textAlign: 'left',
  },
  subtitleCenter: {
    textAlign: 'center',
  },
});
