import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';

import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import { useInstructorAvailabilityDraft } from '../store/InstructorAvailabilityDraftContext';
import type { AvailabilityInterval } from '../types/availability';
import {
  getDayLabel,
  getDayValidationErrors,
  maskTimeInput,
} from '../utils/availability';

type EditableInterval = AvailabilityInterval & {
  id: string;
};

const createEditableInterval = (
  interval: AvailabilityInterval = { start: '08:00', end: '12:00' }
): EditableInterval => ({
  ...interval,
  id: `interval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

type Props = {
  navigation: {
    goBack: () => void;
  };
  route: {
    params: {
      day: number;
    };
  };
};

export const EditInstructorAvailabilityDayScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { day } = route.params;
  const { draft, updateDay } = useInstructorAvailabilityDraft();
  const [enabled, setEnabled] = useState(draft.weekly[day].length > 0);
  const [intervals, setIntervals] = useState<EditableInterval[]>(
    draft.weekly[day].length
      ? draft.weekly[day].map(interval => createEditableInterval(interval))
      : [createEditableInterval()]
  );

  const normalizedIntervals = useMemo<AvailabilityInterval[]>(
    () => intervals.map(({ id: _id, ...interval }) => interval),
    [intervals]
  );
  const errors = useMemo(
    () => getDayValidationErrors(normalizedIntervals),
    [normalizedIntervals]
  );
  const hasErrors = errors.some(Boolean);

  const handleIntervalChange = (
    intervalId: string,
    field: keyof AvailabilityInterval,
    value: string
  ) => {
    setIntervals(current =>
      current.map(interval =>
        interval.id === intervalId
          ? { ...interval, [field]: maskTimeInput(value) }
          : interval
      )
    );
  };

  const handleSave = () => {
    if (enabled && hasErrors) {
      Alert.alert('Horários inválidos', 'Ajuste os intervalos destacados antes de salvar.');
      return;
    }

    updateDay(day, enabled ? normalizedIntervals : []);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.text.primary} size={20} />
          <Text style={styles.backLabel}>Disponibilidade</Text>
        </Pressable>

        <Text style={styles.title}>{getDayLabel(day)}</Text>
        <Text style={styles.subtitle}>
          Ajuste os intervalos desse dia e volte para revisar tudo antes do envio final.
        </Text>

        <Card style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleTitle}>Disponível neste dia</Text>
            <Text style={styles.toggleDescription}>
              Desligar esse controle remove os horários desse dia no draft.
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{
              false: theme.colors.border.medium,
              true: theme.colors.primary[300],
            }}
            thumbColor={enabled ? theme.colors.primary[500] : theme.colors.neutral[0]}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horários</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setIntervals(current => [...current, createEditableInterval({
              start: '13:00',
              end: '18:00',
            })])}
          >
            <Plus color={theme.colors.primary[500]} size={16} />
            <Text style={styles.addLabel}>Adicionar horário</Text>
          </Pressable>
        </View>

        {intervals.map((interval, index) => (
          <Card key={interval.id} style={styles.intervalCard}>
            <View style={styles.intervalFields}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Início</Text>
                <TextInput
                  value={interval.start}
                  onChangeText={value => handleIntervalChange(interval.id, 'start', value)}
                  style={styles.input}
                  placeholder="08:00"
                  editable={enabled}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fim</Text>
                <TextInput
                  value={interval.end}
                  onChangeText={value => handleIntervalChange(interval.id, 'end', value)}
                  style={styles.input}
                  placeholder="12:00"
                  editable={enabled}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <Pressable
                onPress={() =>
                  setIntervals(current => current.filter(item => item.id !== interval.id))
                }
                style={styles.removeButton}
              >
                <Trash2 color={theme.colors.semantic.error} size={16} />
              </Pressable>
            </View>

            {errors[index] ? <Text style={styles.errorText}>{errors[index]}</Text> : null}
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} style={styles.footerButton} />
        <Button title="Salvar dia" onPress={handleSave} style={styles.footerButton} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.sm,
  },
  toggleCard: {
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  toggleDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    maxWidth: 220,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addLabel: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  intervalCard: {
    marginBottom: theme.spacing.md,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
  },
  intervalFields: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    color: theme.colors.text.primary,
  },
  removeButton: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: theme.borders.width.base,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  footerButton: {
    flex: 1,
  },
});
