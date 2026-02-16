import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { theme } from '../../themes';
import { AgendaSemanal, AgendaDia, SlotTempo } from '../../types/auth';
import { Button } from '../common/Button';

interface WeeklyScheduleEditorProps {
  initialSchedule?: AgendaSemanal;
  onSave: (schedule: AgendaSemanal) => void;
  onCancel?: () => void;
}

const DIAS_SEMANA = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
] as const;

const HORARIOS_PADRAO: SlotTempo[] = [
  { horaInicio: '08:00', horaFim: '10:00', disponivel: false },
  { horaInicio: '10:00', horaFim: '12:00', disponivel: false },
  { horaInicio: '14:00', horaFim: '16:00', disponivel: false },
  { horaInicio: '16:00', horaFim: '18:00', disponivel: false },
  { horaInicio: '18:00', horaFim: '20:00', disponivel: false },
];

const createEmptySchedule = (): AgendaSemanal => ({
  segunda: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  terca: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  quarta: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  quinta: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  sexta: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  sabado: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
  domingo: { disponivel: false, horarios: [...HORARIOS_PADRAO] },
});

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  initialSchedule,
  onSave,
  onCancel,
}) => {
  const [schedule, setSchedule] = useState<AgendaSemanal>(
    initialSchedule || createEmptySchedule()
  );
  const [selectedDay, setSelectedDay] = useState<keyof AgendaSemanal | null>(
    null
  );

  const toggleDayAvailability = (day: keyof AgendaSemanal) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        disponivel: !prev[day].disponivel,
      },
    }));
  };

  const toggleTimeSlot = (
    day: keyof AgendaSemanal,
    slotIndex: number
  ) => {
    setSchedule(prev => {
      const daySchedule = prev[day];
      const updatedSlots = daySchedule.horarios.map((slot, idx) =>
        idx === slotIndex
          ? { ...slot, disponivel: !slot.disponivel }
          : slot
      );

      return {
        ...prev,
        [day]: {
          ...daySchedule,
          horarios: updatedSlots,
        },
      };
    });
  };

  const handleSave = () => {
    onSave(schedule);
  };

  const renderDayEditor = (day: keyof AgendaSemanal, label: string) => {
    const daySchedule = schedule[day];
    const availableSlotsCount = daySchedule.horarios.filter(
      slot => slot.disponivel
    ).length;

    return (
      <TouchableOpacity
        key={day}
        style={styles.dayCard}
        onPress={() => setSelectedDay(day)}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayLabel}>{label}</Text>
            {daySchedule.disponivel && (
              <Text style={styles.slotsCount}>
                {availableSlotsCount} horário{availableSlotsCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              daySchedule.disponivel && styles.toggleButtonActive,
            ]}
            onPress={() => toggleDayAvailability(day)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                daySchedule.disponivel && styles.toggleButtonTextActive,
              ]}
            >
              {daySchedule.disponivel ? 'Disponível' : 'Indisponível'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTimeSlotModal = () => {
    if (!selectedDay) return null;

    const daySchedule = schedule[selectedDay];
    const dayLabel = DIAS_SEMANA.find(d => d.key === selectedDay)?.label;

    return (
      <Modal
        visible={selectedDay !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{dayLabel}</Text>
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.slotsContainer}>
              {daySchedule.horarios.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.slotCard,
                    slot.disponivel && styles.slotCardActive,
                    !daySchedule.disponivel && styles.slotCardDisabled,
                  ]}
                  onPress={() => {
                    if (daySchedule.disponivel) {
                      toggleTimeSlot(selectedDay, index);
                    }
                  }}
                  disabled={!daySchedule.disponivel}
                >
                  <Text
                    style={[
                      styles.slotTime,
                      slot.disponivel && styles.slotTimeActive,
                    ]}
                  >
                    {slot.horaInicio} - {slot.horaFim}
                  </Text>
                  {slot.disponivel && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Concluído"
              variant="primary"
              onPress={() => setSelectedDay(null)}
              style={styles.doneButton}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.instructions}>
          Toque em um dia para configurar os horários disponíveis
        </Text>

        {DIAS_SEMANA.map(({ key, label }) => renderDayEditor(key, label))}
      </ScrollView>

      <View style={styles.actions}>
        {onCancel && (
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onCancel}
            style={styles.actionButton}
          />
        )}
        <Button
          title="Salvar Agenda"
          variant="primary"
          onPress={handleSave}
          style={styles.actionButton}
        />
      </View>

      {renderTimeSlotModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  instructions: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  dayCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  slotsCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[400],
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.sm,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  toggleButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  toggleButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borders.radius.lg,
    borderTopRightRadius: theme.borders.radius.lg,
    maxHeight: '80%',
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.text.secondary,
    padding: theme.spacing.sm,
  },
  slotsContainer: {
    padding: theme.spacing.lg,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotCardActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  slotCardDisabled: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  slotTimeActive: {
    color: theme.colors.primary[500],
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
  },
  doneButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
});
