import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FormDatePicker } from '../../components/forms/FormDatePicker';
import { theme } from '../../themes';
import { AlunoSearchStackParamList } from '../../types/navigation';
import type { InstructorDetails, InstructorAvailableSlot } from '../../types/instructor';
import { instructorService } from '../../services/instructorService';
import { MapPin, UserPlus } from 'lucide-react-native';
import { scale } from '@/utils';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'InstructorDetails'>;

export const InstructorDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { instructorId, instructorSummary } = route.params;
  const bookingLocationFallback = 'Local informado após aceite do instrutor';

  const formatDateToApi = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, []);

  const [instructor, setInstructor] = useState<InstructorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<InstructorAvailableSlot[]>([]);

  const loadAvailableSlots = useCallback(async (date: Date) => {
    const dateString = formatDateToApi(date);
    const slots = await instructorService.getAvailableSlots(instructorId, dateString);
    setAvailableSlots(slots);
    setSelectedTimeSlot(null);
  }, [formatDateToApi, instructorId]);

  const loadInstructorDetails = useCallback(async () => {
    try {
      setLoading(true);
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
      const foundInstructor = await instructorService.getDetails(instructorId);
      setInstructor(foundInstructor);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    } catch (error) {
      console.error('Error loading instructor details:', error);
      Alert.alert('Erro', 'Erro ao carregar detalhes do instrutor');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    loadInstructorDetails();
  }, [loadInstructorDetails]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate).catch(error => {
        console.error('Error loading available slots:', error);
        Alert.alert('Erro', 'Erro ao carregar horários disponíveis');
      });
    }
  }, [selectedDate, loadAvailableSlots]);

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleBookLesson = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e horário');
      return;
    }

    const selectedSlot = availableSlots.find(slot => slot.id === selectedTimeSlot);
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
      timeSlot: selectedSlot.time,
      duration: 60, // Default 1 hour
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
    return (
      <View style={styles.slotsGrid}>
        {availableSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              !slot.available && styles.timeSlotUnavailable,
              selectedTimeSlot === slot.id && styles.timeSlotSelected,
            ]}
            onPress={() => slot.available && handleTimeSlotSelect(slot.id)}
            disabled={!slot.available}
          >
            <Text
              style={[
                styles.timeSlotText,
                !slot.available && styles.timeSlotTextUnavailable,
                selectedTimeSlot === slot.id && styles.timeSlotTextSelected,
              ]}
            >
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
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
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const distanceLabel = instructorSummary?.localizacao.distancia != null
    ? `${instructorSummary.localizacao.distancia.toFixed(1)} km • Atende na região`
    : 'Atende na região';

  const vehicleLabel = instructor.veiculo.modelo
    ? `🚗 ${instructor.veiculo.modelo} • ${instructor.veiculo.transmissao === 'automatico' ? 'Automático' : 'Manual'}`
    : `🚗 ${instructor.veiculo.transmissao === 'automatico' ? 'Automático' : 'Manual'}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Instructor Profile */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {renderAvatar()}
            <View style={styles.profileInfo}>
              <Text style={styles.instructorName}>
                {instructor.primeiroNome} {instructor.ultimoNome}
              </Text>
              {
                instructor.isNovoInstrutor ?
                  (
                    <View style={styles.iconTextView}>
                      <UserPlus width={scale(18)} color={theme.colors.text.tertiary} />
                      <Text style={styles.metaInfoText}>
                        Novo instrutor
                      </Text>
                    </View>
                  ) :
                  <View style={styles.ratingContainer}>
                    <Text style={styles.stars}>{renderStars(instructor.avaliacoes.media)}</Text>
                    <Text style={styles.ratingText}>{instructor.avaliacoes.media}</Text>
                    <Text style={styles.reviewText}>({instructor.avaliacoes.quantidade} avaliações)</Text>
                  </View>

              }
              <View style={styles.iconTextView}>
                <MapPin color={theme.colors.secondary[500]} width={scale(18)} />
                <Text style={styles.locationText}>{distanceLabel}</Text>
              </View>
            </View>
          </View>
          <View style={styles.classInfo}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>
                R$ {instructor.precos.valorHora}
              </Text>
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

          <FormDatePicker
            label="Selecione a data"
            value={selectedDate || undefined}
            onDateChange={setSelectedDate}
            placeholder="Escolha uma data"
            minimumDate={new Date()}
          />

          {selectedDate && (
            <View>
              {/* <Text style={styles.timeSlotsTitle}>
                Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR')}
              </Text> */}
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
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
    rowGap: theme.spacing.md
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
  },
  timeSlotsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
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
    backgroundColor: theme.colors.background.primary,
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
