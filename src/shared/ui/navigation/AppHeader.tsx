import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../theme';
import { IconButton } from '../primitives/IconButton';
import { Typography } from '../primitives/Typography';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  onBackPress,
  rightSlot,
  subtitle,
  title,
}) => {
  return (
    <View style={styles.container}>
      {onBackPress && <IconButton icon={ArrowLeft} onPress={onBackPress} />}
      <View style={styles.titleContainer}>
        {title && (
          <Typography variant="h4" weight="semibold">
            {title}
          </Typography>
        )}

        {subtitle && (
          <Typography variant="caption" color="secondary">
            {subtitle}
          </Typography>
        )}
      </View>

      {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  rightSlot: {
    marginLeft: theme.spacing.sm,
  },
});
