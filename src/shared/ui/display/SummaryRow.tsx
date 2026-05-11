import theme from '@/theme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Typography } from '../primitives/Typography';

export type SummaryRowProps = {
  label: string;
  value: React.ReactNode;
  labelVariant?: React.ComponentProps<typeof Typography>['variant'];
  labelColor?: React.ComponentProps<typeof Typography>['color'];
  labelWeight?: React.ComponentProps<typeof Typography>['weight'];
  valueVariant?: React.ComponentProps<typeof Typography>['variant'];
  valueColor?: React.ComponentProps<typeof Typography>['color'];
  valueWeight?: React.ComponentProps<typeof Typography>['weight'];
  align?: React.ComponentProps<typeof Typography>['align'];
  style?: StyleProp<ViewStyle>;
  valueStyle?: React.ComponentProps<typeof Typography>['style'];
};

export const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  labelVariant = 'body',
  labelColor = 'primary',
  labelWeight = 'medium',
  valueVariant = 'body',
  valueColor = 'secondary',
  valueWeight = 'medium',
  align = 'right',
  style,
  valueStyle,
}) => {
  return (
    <View style={[styles.summaryRow, style]}>
      <Typography variant={labelVariant} color={labelColor} weight={labelWeight}>
        {label}
      </Typography>

      <Typography
        variant={valueVariant}
        color={valueColor}
        weight={valueWeight}
        align={align}
        style={valueStyle}
      >
        {value}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.spacing.md,
  },
});
