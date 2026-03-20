import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { Button, Card, Typography } from '../../../shared/ui/base';
import { theme } from '../../../theme';

interface TipCardProps {
  title?: string;
  tip: string;
  onViewMore?: () => void;
}

export const TipCard: React.FC<TipCardProps> = ({
  title = '💡 Dica do Dia',
  tip,
  onViewMore,
}) => {
  return (
    <Card variant="filled" padding="md" style={styles.container}>
      <View style={styles.header}>
        <Lightbulb color={theme.colors.warning[500]} size={24} />
        <Typography variant="h4" style={styles.title}>
          {title}
        </Typography>
      </View>

      <Typography variant="body" color="secondary" style={styles.tipText}>
        {tip}
      </Typography>

      {onViewMore && (
        <Button
          title="Ver mais dicas"
          variant="ghost"
          size="sm"
          onPress={onViewMore}
          style={styles.button}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    borderWidth: theme.borders.width.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
  },
  tipText: {
    lineHeight: theme.typography.lineHeight.lg,
    marginBottom: theme.spacing.sm,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
