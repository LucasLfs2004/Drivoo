import theme from '@/theme';
import { LucideIcon } from 'lucide-react-native';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Typography } from '../primitives/Typography';

interface InfoDisplayProps {
  title: string;
  info: React.ReactNode;
  icon: LucideIcon;
  style?: StyleProp<ViewStyle>;
}

export const InfoDisplay = ({ title, info, icon: Icon, style }: InfoDisplayProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Icon color={theme.colors.primary[500]} size={18} />
        <Typography color="contrast" variant="body" weight={'medium'}>
          {title}
        </Typography>
      </View>
      {typeof info === 'string' || typeof info === 'number' ? (
        <Typography color="primary" variant="body" weight="normal" style={styles.infoText}>
          {info}
        </Typography>
      ) : (
        <View style={styles.infoContent}>{info}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    rowGap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  infoText: {
    marginLeft: 26,
  },
  infoContent: {
    marginLeft: 26,
  },
});
