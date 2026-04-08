import dayjs from 'dayjs';
import { ArrowLeft, CalendarPlus2, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { DatePickerCalendar } from '../../../shared/ui/forms';
import { theme } from '../../../theme';
import { useInstructorAvailabilityDraft } from '../store/InstructorAvailabilityDraftContext';
import type { AvailabilityException } from '../types/availability';
import {
  formatIntervalsSummary,
  isPastDate,
  isValidTimeValue,
  maskTimeInput,
} from '../utils/availability';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export const InstructorAvailabilityExceptionsScreen: React.FC<Props> = ({ navigation }) => {
  const { draft, upsertException, removeException } = useInstructorAvailabilityDraft();
  const currentMonth = React.useMemo(() => dayjs().startOf('month'), []);
  const nextMonthLimit = React.useMemo(() => currentMonth.add(1, 'month'), [currentMonth]);
  const [visibleMonth, setVisibleMonth] = useState(currentMonth);
  const [date, setDate] = useState('');
  const [type, setType] = useState<'available' | 'blocked'>('blocked');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('12:00');

  const dateError = useMemo(() => {
    if (!date) {
      return null;
    }

    if (isPastDate(date)) {
      return 'Escolha uma data futura.';
    }

    return null;
  }, [date]);
  const timeError = useMemo(() => {
    if (type !== 'available') {
      return null;
    }

    if (!isValidTimeValue(start) || !isValidTimeValue(end)) {
      return 'Use horários válidos no formato HH:mm.';
    }

    if (start >= end) {
      return 'O horário de início deve ser antes do fim.';
    }

    return null;
  }, [type, start, end]);

  const handleSave = () => {
    if (!date || dateError || timeError) {
      return;
    }

    const exception: AvailabilityException =
      type === 'blocked'
        ? {
            id: `exception-${Date.now()}`,
            type: 'blocked',
            date,
          }
        : {
            id: `exception-${Date.now()}`,
            type: 'available',
            date,
            intervals: [{ start, end }],
          };

    upsertException(exception);
    setDate('');
    setStart('09:00');
    setEnd('12:00');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.text.primary} size={20} />
          <Text style={styles.backLabel}>Disponibilidade</Text>
        </Pressable>

        <Text style={styles.title}>Exceções</Text>
        <Text style={styles.subtitle}>
          Adicione bloqueios pontuais ou disponibilidades extras sem enviar nada ainda.
        </Text>

        <Card style={styles.formCard}>
          <View style={styles.formHeader}>
            <CalendarPlus2 color={theme.colors.primary[500]} size={18} />
            <Text style={styles.formTitle}>Nova exceção</Text>
          </View>

          <DatePickerCalendar
            title="Selecionar data"
            value={date}
            visibleMonth={visibleMonth}
            onChangeMonth={setVisibleMonth}
            onChange={setDate}
            minDate={dayjs().format('YYYY-MM-DD')}
            maxDate={nextMonthLimit.endOf('month').format('YYYY-MM-DD')}
            disablePastDates
          />
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

          <View style={styles.typeRow}>
            <Pressable
              onPress={() => setType('blocked')}
              style={[styles.typeChip, type === 'blocked' && styles.typeChipActive]}
            >
              <Text style={[styles.typeChipText, type === 'blocked' && styles.typeChipTextActive]}>
                Bloqueio
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('available')}
              style={[styles.typeChip, type === 'available' && styles.typeChipActive]}
            >
              <Text
                style={[styles.typeChipText, type === 'available' && styles.typeChipTextActive]}
              >
                Disponível
              </Text>
            </Pressable>
          </View>

          {type === 'available' ? (
            <View style={styles.intervalRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Início</Text>
                <TextInput
                  value={start}
                  onChangeText={value => setStart(maskTimeInput(value))}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="09:00"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fim</Text>
                <TextInput
                  value={end}
                  onChangeText={value => setEnd(maskTimeInput(value))}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="12:00"
                />
              </View>
            </View>
          ) : null}
          {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

          <Button
            title="Adicionar exceção"
            onPress={handleSave}
            disabled={!date || !!dateError || !!timeError}
          />
        </Card>

        <Text style={styles.sectionTitle}>Exceções cadastradas</Text>

        {draft.exceptions.map(item => (
          <Card key={item.id} style={styles.exceptionCard}>
            <View style={styles.exceptionInfo}>
              <Text style={styles.exceptionDate}>{dayjs(item?.date).format('DD/MM/YYYY')}</Text>
              <Text style={styles.exceptionType}>
                {item.type === 'blocked'
                  ? 'Bloqueio total'
                  : `Disponível: ${formatIntervalsSummary(item.intervals)}`}
              </Text>
            </View>
            <Pressable onPress={() => removeException(item.id)} style={styles.deleteButton}>
              <Trash2 color={theme.colors.semantic.error} size={16} />
            </Pressable>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
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
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
    flexDirection: 'column',
    gap: theme.spacing.lg - theme.spacing.xs,
    // padding: theme.spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
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
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error,
    marginBottom: theme.spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  typeChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    alignItems: 'center',
  },
  typeChipActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  typeChipText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  typeChipTextActive: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  field: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  exceptionCard: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exceptionInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  exceptionDate: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  exceptionType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});
