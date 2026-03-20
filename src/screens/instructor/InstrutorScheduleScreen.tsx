import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Card } from '../../shared/ui/base/Card';
import { Button } from '../../shared/ui/base/Button';
import { WeeklyScheduleEditor } from '../../components/forms/WeeklyScheduleEditor';
import { theme } from '../../themes';
import { AgendaSemanal, SlotTempo } from '../../types/auth';
import { BookingData } from '../../types/booking';

dayjs.locale('pt-br');

// Mock de agendamentos para demonstração
const MOCK_BOOKINGS: BookingData[] = [
  {
    id: '1',
    instructorId: 'inst-1',
    instructorName: 'João Silva',
    date: dayjs().add(1, 'day').hour(10).minute(0).toDate(),
    timeSlot: '10:00 - 12:00',
    duration: 120,
    price: 150,
    currency: 'BRL',
    vehicleInfo: {
      marca: 'Volkswagen',
      modelo: 'Gol',
      transmissao: 'manual',
    },
    location: {
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    },
    status: 'confirmed',
  },
];

export const InstrutorScheduleScreen: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [schedule, setSchedule] = useState<AgendaSemanal | null>(null);
  const [bookings] = useState<BookingData[]>(MOCK_BOOKINGS);

  const handleSaveSchedule = (newSchedule: AgendaSemanal) => {
    setSchedule(newSchedule);
    setShowEditor(false);
    Alert.alert(
      'Sucesso',
      'Sua disponibilidade foi atualizada com sucesso!',
      [{ text: 'OK' }]
    );
  };

  const getBookingsForDay = (dayOffset: number): BookingData[] => {
    const targetDate = dayjs().add(dayOffset, 'day');
    return bookings.filter(booking =>
      dayjs(booking.date).isSame(targetDate, 'day')
    );
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
      const dayBookings = getBookingsForDay(day.offset);
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

          {dayBookings.length > 0 ? (
            <View style={styles.bookingsContainer}>
              {dayBookings.map(booking => (
                <View key={booking.id} style={styles.bookingItem}>
                  <View style={styles.bookingTime}>
                    <Text style={styles.bookingTimeText}>
                      {booking.timeSlot}
                    </Text>
                  </View>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingStudent}>
                      Aluno: {booking.instructorName}
                    </Text>
                    <Text style={styles.bookingLocation}>
                      {booking.location.endereco}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
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
                <Text style={styles.noLessons}>Nenhuma aula agendada</Text>
              )}
            </View>
          )}
        </Card>
      );
    });
  };

  if (showEditor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.editorHeader}>
          <Text style={styles.editorTitle}>Configurar Disponibilidade</Text>
        </View>
        <WeeklyScheduleEditor
          initialSchedule={schedule || undefined}
          onSave={handleSaveSchedule}
          onCancel={() => setShowEditor(false)}
        />
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
            {schedule
              ? 'Configure os horários em que você está disponível para dar aulas'
              : 'Você ainda não configurou sua disponibilidade. Defina seus horários para começar a receber agendamentos.'}
          </Text>
          <Button
            title={schedule ? 'Editar Horários' : 'Definir Horários'}
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
  bookingsContainer: {
    marginTop: theme.spacing.sm,
  },
  bookingItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bookingTime: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borders.radius.sm,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
  },
  bookingTimeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingStudent: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  bookingLocation: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
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
});