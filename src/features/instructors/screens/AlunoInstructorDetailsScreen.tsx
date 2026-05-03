import { scale } from '@/utils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { MapPin, UserPlus } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../shared/ui/base/AppHeader';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import {
  AvailabilityCalendar,
  buildCalendarBaseCells,
  type AvailabilityCalendarCellModel,
} from '../components/AvailabilityCalendar';
import { useInstructorDetailsQuery } from '../hooks/useInstructorDetailsQuery';
import { useInstructorPublicAvailabilityCalendarQuery } from '../hooks/useInstructorPublicAvailabilityCalendarQuery';
import type {
  InstructorAvailabilityCalendarDayApiResponse,
  InstructorAvailabilityCalendarSlotApiResponse,
} from '../types/api';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'InstructorDetails'>;

export const AlunoInstructorDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { instructorId, instructorSummary } = route.params;
  const bookingLocationFallback = 'Local informado após aceite do instrutor';
  const tomorrow = useMemo(() => dayjs().add(1, 'day').startOf('day'), []);
  const currentMonth = useMemo(() => dayjs().startOf('month'), []);

  const formatDateToApi = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, []);

  const parseApiDate = useCallback((date: string) => {
    const parsedDate = dayjs(date).startOf('day');
    return parsedDate.toDate();
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(tomorrow.startOf('month'));
  const selectedDateApi = selectedDate ? formatDateToApi(selectedDate) : null;

  const formatSlotTime = useCallback((value: string) => {
    const parsed = dayjs(value);

    if (parsed.isValid()) {
      return parsed.format('HH:mm');
    }

    return value.slice(0, 5);
  }, []);

  const {
    data: instructor,
    isLoading: loading,
    error: instructorError,
  } = useInstructorDetailsQuery(instructorId);

  const {
    data: availabilityCalendar,
    isLoading: isLoadingAvailabilityCalendar,
    error: availabilityCalendarError,
  } = useInstructorPublicAvailabilityCalendarQuery(instructorId);

  useEffect(() => {
    if (selectedDate) {
      setSelectedTimeSlot(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (instructorError) {
      console.error('Error loading instructor details:', instructorError);
      Alert.alert('Erro', 'Erro ao carregar detalhes do instrutor');
    }
  }, [instructorError]);

  useEffect(() => {
    if (availabilityCalendarError) {
      console.error('Error loading availability calendar:', availabilityCalendarError);
      Alert.alert('Erro', 'Erro ao carregar calendário de disponibilidade');
    }
  }, [availabilityCalendarError]);

  const isSelectableCalendarDay = useCallback(
    (calendarDay?: InstructorAvailabilityCalendarDayApiResponse) =>
      Boolean(calendarDay?.horarios?.some(slot => slot.status === 'DISPONIVEL')),
    [],
  );

  useEffect(() => {
    if (!availabilityCalendar?.dias?.length) {
      return;
    }

    const currentSelectionIsValid = availabilityCalendar.dias.some(
      day => day.data === selectedDateApi && isSelectableCalendarDay(day),
    );

    if (currentSelectionIsValid) {
      return;
    }

    const firstAvailableDay = availabilityCalendar.dias.find(
      day =>
        isSelectableCalendarDay(day) &&
        (dayjs(day.data).isSame(tomorrow, 'day') || dayjs(day.data).isAfter(tomorrow, 'day')),
    );

    if (!firstAvailableDay) {
      setSelectedDate(null);
      return;
    }

    const nextSelectedDate = parseApiDate(firstAvailableDay.data);
    setSelectedDate(nextSelectedDate);
    setVisibleMonth(dayjs(firstAvailableDay.data).startOf('month'));
  }, [
    availabilityCalendar?.dias,
    isSelectableCalendarDay,
    parseApiDate,
    selectedDateApi,
    tomorrow,
  ]);

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(parseApiDate(date));
  };

  const calendarCells = useMemo<AvailabilityCalendarCellModel[]>(
    () =>
      buildCalendarBaseCells(visibleMonth).map(cell => {
        const cellDate = dayjs(cell.date);
        const isPastDate = cellDate.isBefore(dayjs().startOf('day'), 'day');
        const calendarDay = availabilityCalendar?.dias.find(day => day.data === cell.date);
        const isSelectable = isSelectableCalendarDay(calendarDay);
        const isPartial = calendarDay?.status_dia === 'OCUPADO_PARCIAL';
        const isBlocked = calendarDay?.status_dia === 'BLOQUEADO';
        const isUnavailable = calendarDay?.status_dia === 'SEM_DISPONIBILIDADE';

        return {
          ...cell,
          selected: selectedDateApi === cell.date,
          disabled: isPastDate || !isSelectable,
          tone: isPartial
            ? 'partial'
            : isSelectable
              ? 'available'
              : isBlocked
                ? 'blocked'
                : isUnavailable
                  ? 'default'
                  : 'default',
          marker: isPartial ? 'partial' : isSelectable ? 'available' : undefined,
        };
      }),
    [availabilityCalendar?.dias, isSelectableCalendarDay, selectedDateApi, visibleMonth],
  );

  const canGoToPreviousMonth = useMemo(() => {
    const minMonth = availabilityCalendar?.data_inicio
      ? dayjs(availabilityCalendar.data_inicio).startOf('month')
      : currentMonth;

    const boundedMinMonth = minMonth.isAfter(currentMonth) ? minMonth : currentMonth;
    return visibleMonth.startOf('month').isAfter(boundedMinMonth);
  }, [availabilityCalendar?.data_inicio, currentMonth, visibleMonth]);

  const canGoToNextMonth = useMemo(() => {
    if (!availabilityCalendar?.data_fim) {
      return true;
    }

    return visibleMonth
      .startOf('month')
      .isBefore(dayjs(availabilityCalendar.data_fim).startOf('month'));
  }, [availabilityCalendar?.data_fim, visibleMonth]);

  const handleBookLesson = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e horário');
      return;
    }

    const selectedDay = availabilityCalendar?.dias.find(day => day.data === selectedDateApi);
    const selectedSlot = selectedDay?.horarios.find(
      slot => slot.inicio === selectedTimeSlot && slot.status === 'DISPONIVEL',
    );

    if (!selectedSlot) {
      Alert.alert('Erro', 'Horário selecionado não encontrado');
      return;
    }

    // Create booking data
    const bookingData = {
      instructorId,
      instructorName: `${instructor?.primeiroNome} ${instructor?.ultimoNome}`,
      instructorAvatar: instructor?.avatar,
      date: selectedDate,
      timeSlot: formatSlotTime(selectedSlot.inicio),
      duration: availabilityCalendar?.duracao_minutos || 60,
      price: instructor?.precos.valorHora || 0,
      currency: 'BRL', // Código ISO para Real Brasileiro
      vehicleInfo: {
        marca: '',
        modelo: instructor?.veiculo.modelo || '',
        transmissao: instructor?.veiculo.transmissao || 'manual',
      },
      location: {
        endereco: bookingLocationFallback,
      },
      status: 'pending' as const,
    };

    // Navigate to booking confirmation screen
    navigation.navigate('BookingConfirmation', { bookingData });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }

    return stars.join('');
  };

  const renderAvatar = () => {
    if (instructor?.avatar) {
      return <Image source={{ uri: instructor.avatar }} style={styles.avatar} />;
    }

    const initials = instructor
      ? `${instructor.primeiroNome[0]}${instructor.ultimoNome[0]}`.toUpperCase()
      : '';

    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderTimeSlots = () => {
    const selectedDay = availabilityCalendar?.dias.find(day => day.data === selectedDateApi);
    const selectedDaySlots = selectedDay?.horarios ?? [];
    const availableSlots = selectedDaySlots.filter(slot => slot.status === 'DISPONIVEL');

    if (!selectedDateApi) {
      return (
        <Text style={styles.slotsFeedbackText}>
          Nenhuma disponibilidade encontrada no calendário do instrutor.
        </Text>
      );
    }

    if (isLoadingAvailabilityCalendar) {
      return (
        <View style={styles.slotsFeedbackContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
          <Text style={styles.slotsFeedbackText}>Buscando horários disponíveis...</Text>
        </View>
      );
    }

    if (!availableSlots.length) {
      return (
        <Text style={styles.slotsFeedbackText}>
          Nenhum horário disponível para a data selecionada.
        </Text>
      );
    }

    return (
      <View style={styles.slotsGrid}>
        {availableSlots.map((slot: InstructorAvailabilityCalendarSlotApiResponse, index) => {
          const slotId = slot.inicio;
          const slotLabel = `${formatSlotTime(slot.inicio)} - ${formatSlotTime(slot.fim)}`;

          return (
            <TouchableOpacity
              key={`${slot.inicio}-${slot.fim}-${index}`}
              style={[styles.timeSlot, selectedTimeSlot === slotId && styles.timeSlotSelected]}
              onPress={() => handleTimeSlotSelect(slotId)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slotId && styles.timeSlotTextSelected,
                ]}
              >
                {slotLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!instructor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Instrutor não encontrado</Text>
          <Button title="Voltar" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const distanceLabel =
    instructorSummary?.localizacao.distancia != null
      ? `${instructorSummary.localizacao.distancia.toFixed(1)} km • Atende na região`
      : 'Atende na região';

  const vehicleLabel = instructor.veiculo.modelo
    ? `🚗 ${instructor.veiculo.modelo} • ${instructor.veiculo.transmissao === 'automatico' ? 'Automático' : 'Manual'}`
    : `🚗 ${instructor.veiculo.transmissao === 'automatico' ? 'Automático' : 'Manual'}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Detalhes do instrutor" onBackPress={() => navigation.goBack()} />

        {/* Instructor Profile */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {renderAvatar()}
            <View style={styles.profileInfo}>
              <Text style={styles.instructorName}>
                {instructor.primeiroNome} {instructor.ultimoNome}
              </Text>
              {instructor.isNovoInstrutor ? (
                <View style={styles.iconTextView}>
                  <UserPlus width={scale(18)} color={theme.colors.text.tertiary} />
                  <Text style={styles.metaInfoText}>Novo instrutor</Text>
                </View>
              ) : (
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>{renderStars(instructor.avaliacoes.media)}</Text>
                  <Text style={styles.ratingText}>{instructor.avaliacoes.media}</Text>
                  <Text style={styles.reviewText}>
                    ({instructor.avaliacoes.quantidade} avaliações)
                  </Text>
                </View>
              )}
              <View style={styles.iconTextView}>
                <MapPin color={theme.colors.secondary[500]} width={scale(18)} />
                <Text style={styles.locationText}>{distanceLabel}</Text>
              </View>
            </View>
          </View>
          <View style={styles.classInfo}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>R$ {instructor.precos.valorHora}</Text>
              <Text style={styles.priceLabel}> / hora</Text>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleText}>{vehicleLabel}</Text>
            </View>
          </View>
          {instructor.especialidades.length > 0 ? (
            <View style={styles.specialtiesInfo}>
              <Text style={styles.sectionTitle}>Especialidades</Text>
              <View style={styles.specialtiesContainer}>
                {instructor.especialidades.map((specialty, index) => (
                  <View key={`${specialty}-${index}`} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        <Card style={styles.bookingCard}>
          <Text style={styles.sectionTitle}>Agendar Aula</Text>

          {isLoadingAvailabilityCalendar ? (
            <View style={styles.slotsFeedbackContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={styles.slotsFeedbackText}>Carregando calendário...</Text>
            </View>
          ) : (
            <AvailabilityCalendar
              title="Selecione a data"
              visibleMonth={visibleMonth}
              onChangeMonth={setVisibleMonth}
              canGoToPreviousMonth={canGoToPreviousMonth}
              canGoToNextMonth={canGoToNextMonth}
              cells={calendarCells}
              onSelectDate={handleDateSelect}
            />
          )}

          {selectedDate && (
            <View>
              <Text style={styles.timeSlotsTitle}>
                Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR')}
              </Text>
              {renderTimeSlots()}
            </View>
          )}

          <Button
            title={`Agendar Aula - R$ ${instructor.precos.valorHora}`}
            variant="primary"
            onPress={handleBookLesson}
            disabled={!selectedDate || !selectedTimeSlot}
            style={styles.bookButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
    rowGap: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(40),
    marginRight: theme.spacing.lg,
  },
  defaultAvatar: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(40),
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  classInfo: {
    gap: theme.spacing.md,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    // marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: theme.typography.fontSize.md,
    marginRight: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  reviewText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  iconTextView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.success,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  vehicleInfo: {
    gap: theme.spacing.sm,
  },
  vehicleText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  specialtiesInfo: {
    gap: theme.spacing.md,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  specialtyBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
  },
  specialtyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.normal,
  },
  bookingCard: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing['3xl'],
  },
  calendarHelperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  timeSlotsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  slotsFeedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  slotsFeedbackText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    // marginBottom: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.accent[200],
    minWidth: 80,

    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  timeSlotUnavailable: {
    backgroundColor: theme.colors.background.secondary,
    borderColor: theme.colors.border.light,
  },
  timeSlotText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  timeSlotTextSelected: {
    color: theme.colors.text.inverse,
  },
  timeSlotTextUnavailable: {
    color: theme.colors.text.disabled,
  },
  bookButton: {
    marginTop: theme.spacing.md,
  },
});
