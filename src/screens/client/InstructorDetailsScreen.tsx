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
import { InstrutorDisponivel } from '../../types/search';
import { mockInstructors } from '../../mock/instructors';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'InstructorDetails'>;

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
}

export const InstructorDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { instructorId } = route.params;
  
  const [instructor, setInstructor] = useState<InstrutorDisponivel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<DaySchedule[]>([]);

  const loadInstructorDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - in real app this would be an API request
      const foundInstructor = mockInstructors.find(i => i.id === instructorId);
      
      if (foundInstructor) {
        setInstructor(foundInstructor);
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
      } else {
        Alert.alert('Erro', 'Instrutor não encontrado');
        navigation.goBack();
      }
    } catch (_error) {
      Alert.alert('Erro', 'Erro ao carregar detalhes do instrutor');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [instructorId, navigation]);

  useEffect(() => {
    loadInstructorDetails();
  }, [loadInstructorDetails]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: Date) => {
    // Simulate API call to get available time slots for the selected date
    const slots: TimeSlot[] = [
      { id: '1', time: '08:00', available: true },
      { id: '2', time: '09:00', available: false },
      { id: '3', time: '10:00', available: true },
      { id: '4', time: '11:00', available: true },
      { id: '5', time: '14:00', available: true },
      { id: '6', time: '15:00', available: false },
      { id: '7', time: '16:00', available: true },
      { id: '8', time: '17:00', available: true },
    ];

    setAvailableSlots([{ date, slots }]);
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleBookLesson = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e horário');
      return;
    }

    const selectedSlot = availableSlots[0]?.slots.find(slot => slot.id === selectedTimeSlot);
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
      currency: 'R$',
      vehicleInfo: {
        marca: instructor?.veiculo.marca || '',
        modelo: instructor?.veiculo.modelo || '',
        transmissao: instructor?.veiculo.transmissao || 'manual',
      },
      location: {
        endereco: instructor?.localizacao.endereco || '',
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
    if (availableSlots.length === 0) {
      return (
        <Text style={styles.noSlotsText}>
          Selecione uma data para ver os horários disponíveis
        </Text>
      );
    }

    const daySchedule = availableSlots[0];
    
    return (
      <View style={styles.slotsGrid}>
        {daySchedule.slots.map((slot) => (
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
              <View style={styles.ratingContainer}>
                <Text style={styles.stars}>{renderStars(instructor.avaliacoes.media)}</Text>
                <Text style={styles.ratingText}>{instructor.avaliacoes.media}</Text>
                <Text style={styles.reviewText}>({instructor.avaliacoes.quantidade} avaliações)</Text>
              </View>
              <Text style={styles.locationText}>
                📍 {instructor.localizacao.endereco} • {instructor.localizacao.distancia} km
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Valor por hora</Text>
            <Text style={styles.priceValue}>
              R$ {instructor.precos.valorHora}
            </Text>
          </View>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.vehicleCard}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleText}>
              🚗 {instructor.veiculo.marca} {instructor.veiculo.modelo}
            </Text>
            <Text style={styles.vehicleText}>
              ⚙️ {instructor.veiculo.transmissao === 'automatico' ? 'Automático' : 'Manual'}
            </Text>
          </View>
        </Card>

        {/* Specialties */}
        <Card style={styles.specialtiesCard}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.specialtiesContainer}>
            {instructor.especialidades.map((specialty, index) => (
              <View key={index} style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Availability */}
        <Card style={styles.availabilityCard}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Text style={styles.availabilityInfo}>
            {instructor.disponibilidade.slotsDisponiveis} horários disponíveis nos próximos 7 dias
          </Text>
          {instructor.disponibilidade.proximoSlot && (
            <Text style={styles.nextSlotText}>
              Próximo horário: {instructor.disponibilidade.proximoSlot.toLocaleDateString('pt-BR')}
            </Text>
          )}
        </Card>

        {/* Booking Section */}
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
            <View style={styles.timeSlotsSection}>
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
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
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
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.lg,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  priceContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  priceValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.success,
  },
  vehicleCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  vehicleInfo: {
    gap: theme.spacing.sm,
  },
  vehicleText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  specialtiesCard: {
    marginBottom: theme.spacing.lg,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  specialtyBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
  },
  specialtyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  availabilityCard: {
    marginBottom: theme.spacing.lg,
  },
  availabilityInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  nextSlotText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  bookingCard: {
    marginBottom: theme.spacing.xl,
  },
  timeSlotsSection: {
    marginTop: theme.spacing.lg,
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
    marginBottom: theme.spacing.lg,
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
  noSlotsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  bookButton: {
    marginTop: theme.spacing.md,
  },
});