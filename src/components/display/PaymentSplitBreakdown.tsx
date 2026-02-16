import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../themes';
import { PaymentSplitInfo } from '../../types/booking';
import { formatCurrency } from '../../utils/currency';

interface PaymentSplitBreakdownProps {
  splitInfo: PaymentSplitInfo;
  showDetails?: boolean;
}

export const PaymentSplitBreakdown: React.FC<PaymentSplitBreakdownProps> = ({
  splitInfo,
  showDetails = true,
}) => {
  const formatValue = (value: number): string => {
    return formatCurrency(value, splitInfo.currency);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(0)}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Pagamento</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Valor da Aula</Text>
        <Text style={styles.value}>{formatValue(splitInfo.total)}</Text>
      </View>

      {showDetails && (
        <>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.labelSecondary}>
              Taxa da Plataforma ({formatPercentage(splitInfo.platformFeePercentage)})
            </Text>
            <Text style={styles.valueSecondary}>
              {formatValue(splitInfo.platformFee)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.labelSecondary}>Valor para o Instrutor</Text>
            <Text style={styles.valueSecondary}>
              {formatValue(splitInfo.instructorAmount)}
            </Text>
          </View>

          <View style={styles.divider} />
        </>
      )}

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total a Pagar</Text>
        <Text style={styles.totalValue}>
          {formatValue(splitInfo.total)}
        </Text>
      </View>

      {showDetails && (
        <Text style={styles.infoText}>
          O pagamento será dividido automaticamente entre a plataforma e o
          instrutor.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  value: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  labelSecondary: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  valueSecondary: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.medium,
    marginVertical: theme.spacing.sm,
  },
  totalRow: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  infoText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    lineHeight: 16,
  },
});
