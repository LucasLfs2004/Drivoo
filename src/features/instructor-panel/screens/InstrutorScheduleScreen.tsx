import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { WeeklyScheduleEditor } from '../../../shared/ui/forms/WeeklyScheduleEditor';
import { theme } from '../../../theme';
import { AgendaSemanal, SlotTempo } from '../../../types/auth';
import {
  useCreateInstructorAvailabilityMutation,
  useDeleteInstructorAvailabilityMutation,
  useInstructorScheduleQuery,
  useUpdateInstructorAvailabilityMutation,
} from '../../instructors';

dayjs.locale('pt-br');

const DAY_KEYS = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo',
] as const;

const dayKeyToIndex: Record<(typeof DAY_KEYS)[number], number> = {
  segunda: 0,
  terca: 1,
  quarta: 2,
  quinta: 3,
  sexta: 4,
  sabado: 5,
  domingo: 6,
};

const EMPTY_AVAILABILITIES: {
  id: string;
  dayIndex: number;
  dayName: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  active: boolean;
}[] = [];

const buildSlotKey = (dayIndex: number, startTime: string, endTime: string) =>
  `${dayIndex}-${startTime}-${endTime}`;

export const InstrutorScheduleScreen: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const {
    data: scheduleData,
    isLoading,
    isError,
    refetch,
  } = useInstructorScheduleQuery();
  const createAvailabilityMutation = useCreateInstructorAvailabilityMutation();
  const updateAvailabilityMutation = useUpdateInstructorAvailabilityMutation();
  const deleteAvailabilityMutation = useDeleteInstructorAvailabilityMutation();

  const schedule = scheduleData?.agenda ?? null;
  const availabilities = scheduleData?.availabilities ?? EMPTY_AVAILABILITIES;

  const hasConfiguredAvailability = useMemo(
    () => availabilities.some(availability => availability.active),
    [availabilities]
  );

  const handleSaveSchedule = async (newSchedule: AgendaSemanal) => {
    const selectedSlots = new Map<
      string,
      { dayIndex: number; startTime: string; endTime: string }
    >();

    for (const dayKey of DAY_KEYS) {
      const daySchedule = newSchedule[dayKey];
      if (!daySchedule.disponivel) {
        continue;
      }

      const dayIndex = dayKeyToIndex[dayKey];
      for (const slot of daySchedule.horarios) {
        if (!slot.disponivel) {
          continue;
        }

        selectedSlots.set(buildSlotKey(dayIndex, slot.horaInicio, slot.horaFim), {
          dayIndex,
          startTime: `${slot.horaInicio}:00`,
          endTime: `${slot.horaFim}:00`,
        });
      }
    }

    const existingSlots = new Map(
      availabilities.map(availability => [
        buildSlotKey(availability.dayIndex, availability.startTime, availability.endTime),
        availability,
      ])
    );

    const createPromises: Promise<unknown>[] = [];
    const updatePromises: Promise<unknown>[] = [];
    const deletePromises: Promise<unknown>[] = [];

    for (const [slotKey, slot] of selectedSlots.entries()) {
      const existingAvailability = existingSlots.get(slotKey);

      if (!existingAvailability) {
        createPromises.push(
          createAvailabilityMutation.mutateAsync({
            dia_semana: slot.dayIndex,
            hora_inicio: slot.startTime,
            hora_fim: slot.endTime,
            intervalo_inicio: null,
            intervalo_fim: null,
          })
        );
        continue;
      }

      if (!existingAvailability.active) {
        updatePromises.push(
          updateAvailabilityMutation.mutateAsync({
            availabilityId: existingAvailability.id,
            payload: { ativo: true },
          })
        );
      }
    }

    for (const [slotKey, availability] of existingSlots.entries()) {
      if (selectedSlots.has(slotKey)) {
        continue;
      }

      deletePromises.push(deleteAvailabilityMutation.mutateAsync(availability.id));
    }

    try {
      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);
      setShowEditor(false);
      Alert.alert(
        'Sucesso',
        'Sua disponibilidade foi atualizada com sucesso!',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert(
        'Erro',
        'Nao foi possível atualizar sua disponibilidade. Tente novamente.'
      );
    }
  };

  const getDaySchedule = (dayKey: keyof AgendaSemanal): SlotTempo[] => {
    if (!schedule) return [];
    return schedule[dayKey].horarios.filter(slot => slot.disponivel);
  };

  const renderWeekView = () => {
    const weekDays = [
      { name: 'Segunda', key: 'segunda' as keyof AgendaSemanal, offset: 0 },
      { name: 'Terça', key: 'terca' as keyof AgendaSemanal, offset: 1 },
      { name: 'Quarta', key: 'quarta' as keyof AgendaSemanal, offset: 2 },
      { name: 'Quinta', key: 'quinta' as keyof AgendaSemanal, offset: 3 },
      { name: 'Sexta', key: 'sexta' as keyof AgendaSemanal, offset: 4 },
      { name: 'Sábado', key: 'sabado' as keyof AgendaSemanal, offset: 5 },
      { name: 'Domingo', key: 'domingo' as keyof AgendaSemanal, offset: 6 },
    ];

    return weekDays.map(day => {
      const date = dayjs().add(day.offset, 'day');
      const availableSlots = getDaySchedule(day.key);

      return (
        <Card key={day.name} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.dayName}>{day.name}</Text>
              <Text style={styles.dayDate}>{date.format('DD/MM')}</Text>
            </View>
            {schedule && schedule[day.key].disponivel && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>Disponível</Text>
              </View>
            )}
          </View>

          <View style={styles.emptyState}>
            {availableSlots.length > 0 ? (
              <>
                <Text style={styles.availableSlotsText}>
                  Horários disponíveis:
                </Text>
                {availableSlots.map((slot, idx) => (
                  <Text key={idx} style={styles.slotText}>
                    • {slot.horaInicio} - {slot.horaFim}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.noLessons}>Nenhuma disponibilidade configurada</Text>
            )}
          </View>
        </Card>
      );
    });
  };

  const isSaving =
    createAvailabilityMutation.isPending ||
    updateAvailabilityMutation.isPending ||
    deleteAvailabilityMutation.isPending;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando disponibilidade...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !schedule) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nao foi possível carregar sua agenda.</Text>
          <Button title="Tentar novamente" variant="outline" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (showEditor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.editorHeader}>
          <Text style={styles.editorTitle}>Configurar Disponibilidade</Text>
        </View>
        <WeeklyScheduleEditor
          initialSchedule={schedule}
          onSave={handleSaveSchedule}
          onCancel={() => setShowEditor(false)}
        />
        {isSaving ? (
          <View style={styles.savingBanner}>
            <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            <Text style={styles.savingText}>Salvando disponibilidade...</Text>
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Minha Agenda</Text>
          <Text style={styles.subtitle}>
            Gerencie sua disponibilidade e aulas agendadas
          </Text>
        </View>

        <Card style={styles.availabilityCard}>
          <Text style={styles.sectionTitle}>Disponibilidade Semanal</Text>
          <Text style={styles.availabilityText}>
            {hasConfiguredAvailability
              ? 'Configure os horários em que você está disponível para dar aulas'
              : 'Você ainda não configurou sua disponibilidade. Defina seus horários para começar a receber agendamentos.'}
          </Text>
          <Button
            title={hasConfiguredAvailability ? 'Editar Horários' : 'Definir Horários'}
            variant="primary"
            onPress={() => setShowEditor(true)}
            style={styles.setAvailabilityButton}
          />
        </Card>

        <View style={styles.weekView}>
          <Text style={styles.sectionTitle}>Esta Semana</Text>
          {renderWeekView()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  availabilityCard: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  availabilityText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  setAvailabilityButton: {
    minWidth: 200,
  },
  weekView: {
    flex: 1,
  },
  dayCard: {
    marginBottom: theme.spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dayName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  dayDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  availableBadge: {
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.sm,
  },
  availableBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyState: {
    marginTop: theme.spacing.sm,
  },
  availableSlotsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  slotText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
  },
  noLessons: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  editorHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  editorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  savingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  savingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});
