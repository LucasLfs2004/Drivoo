import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../themes';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { calculateBookingPaymentInfo } from '../utils/payment';
import { validateBookingData } from '../utils/validation';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingData } = route.params;

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const paymentInfo = calculateBookingPaymentInfo(bookingData);

  useEffect(() => {
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map(error => error.message));
    }
  }, [bookingData]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const renderInstructorAvatar = () => {
    if (bookingData.instructorAvatar) {
      return (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      );
    }
    
    const initials = bookingData.instructorName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const handleConfirmBooking = async () => {
    if (!termsAccepted) {
      Alert.alert('Atenção', 'Você deve aceitar os termos e condições para continuar.');
      return;
    }

    if (validationErrors.length > 0) {
      Alert.alert('Erro de Validação', validationErrors.join('\n'));
      return;
    }

    // Navigate to payment confirmation screen
    navigation.navigate('PaymentConfirmation', {
      bookingData: {
        ...bookingData,
        id: `booking_${Date.now()}`,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  };

  const handleEditBooking = () => {
    navigation.goBack();
  };

  if (validationErrors.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Dados Inválidos</Text>
          {validationErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
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
          <Text style={styles.headerTitle}>Confirmar Agendamento</Text>
        </View>

        {/* Instructor Summary */}
        <Card style={styles.instructorCard}>
          <View style={styles.instructorHeader}>
            {renderInstructorAvatar()}
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{bookingData.instructorName}</Text>
              <Text style={styles.vehicleInfo}>
                🚗 {bookingData.vehicleInfo.marca} {bookingData.vehicleInfo.modelo}
              </Text>
              <Text style={styles.transmissionInfo}>
                ⚙️ {bookingData.vehicleInfo.transmissao === 'automatico' ? 'Automático' : 'Manual'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Lesson Details */}
        <Card style={styles.lessonCard}>
          <Text style={styles.sectionTitle}>Detalhes da Aula</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Data e Horário</Text>
              <Text style={styles.detailValue}>
                {formatDate(bookingData.date)} às {bookingData.timeSlot}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duração</Text>
              <Text style={styles.detailValue}>{formatDuration(bookingData.duration)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Local de Encontro</Text>
              <Text style={styles.detailValue}>{bookingData.location.endereco}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Resumo do Pagamento</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Valor da aula</Text>
            <Text style={styles.paymentValue}>
              {paymentInfo.currency} {paymentInfo.subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxa da plataforma (15%)</Text>
            <Text style={styles.paymentValue}>
              {paymentInfo.currency} {paymentInfo.platformFee.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {paymentInfo.currency} {paymentInfo.total.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Terms and Conditions */}
        <Card style={styles.termsCard}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Eu aceito os{' '}
              <Text style={styles.termsLink}>termos e condições</Text>
              {' '}e a{' '}
              <Text style={styles.termsLink}>política de privacidade</Text>
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Editar Agendamento"
            variant="outline"
            onPress={handleEditBooking}
            style={styles.editButton}
          />
          
          <Button
            title="Continuar para Pagamento"
            variant="primary"
            onPress={handleConfirmBooking}
            disabled={!termsAccepted}
            style={styles.confirmButton}
          />
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
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  instructorCard: {
    marginBottom: theme.spacing.lg,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  vehicleInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  transmissionInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  lessonCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  detailIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.md,
    width: 24,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  paymentCard: {
    marginBottom: theme.spacing.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  paymentValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.semantic.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  termsCard: {
    marginBottom: theme.spacing.lg,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borders.radius.sm,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  termsText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  editButton: {
    marginBottom: theme.spacing.sm,
  },
  confirmButton: {
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'left',
  },
  errorButton: {
    marginTop: theme.spacing.lg,
  },
});
