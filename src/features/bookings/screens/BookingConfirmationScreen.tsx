import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Car, Gauge } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../shared/ui/base/AppHeader';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../utils/currency';
import { calculateBookingPaymentInfo } from '../utils/payment';
import { validateBookingData } from '../utils/validation';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingData } = route.params;

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const paymentInfo = calculateBookingPaymentInfo(bookingData);
  const formatPaymentValue = (value: number) => formatCurrency(value, paymentInfo.currency);

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
            <Text key={index} style={styles.errorText}>
              • {error}
            </Text>
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
        <AppHeader
          title="Confirmar Agendamento"
          subtitle="Revise os detalhes antes de seguir para o pagamento"
          onBackPress={() => navigation.goBack()}
        />

        {/* Instructor Summary */}
        <Card style={styles.instructorCard}>
          <View style={styles.instructorHeader}>
            {renderInstructorAvatar()}
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{bookingData.instructorName}</Text>
              <View style={styles.vehicleMetaRow}>
                <Car color={theme.colors.text.secondary} size={18} />
                <Text style={styles.vehicleInfo}>
                  {bookingData.vehicleInfo.marca} {bookingData.vehicleInfo.modelo}
                </Text>
              </View>
              <View style={styles.vehicleMetaRow}>
                <Gauge color={theme.colors.text.secondary} size={18} />
                <Text style={styles.transmissionInfo}>
                  {bookingData.vehicleInfo.transmissao === 'automatico' ? 'Automático' : 'Manual'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Lesson Details */}
        <Card style={styles.lessonCard}>
          <Text style={styles.sectionTitle}>Detalhes da Aula</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Data e Horário</Text>
              <Text style={styles.detailValue}>
                {formatDate(bookingData.date)} às {bookingData.timeSlot}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duração</Text>
              <Text style={styles.detailValue}>{formatDuration(bookingData.duration)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Local de Encontro</Text>
              <Text style={styles.detailValue}>{bookingData.location.endereco}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.paymentCard}>
          <Text style={styles.paymentSectionTitle}>Resumo do pagamento</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Valor da aula</Text>
            <Text style={styles.paymentValue}>{formatPaymentValue(paymentInfo.subtotal)}</Text>
          </View>

          <View style={styles.paymentSplitBox}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Valor para o professor</Text>
              <Text style={styles.paymentValue}>
                {formatPaymentValue(paymentInfo.instructorAmount)}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Taxa plataforma ({Math.round(paymentInfo.platformFeeRate * 100)}%)
              </Text>
              <Text style={styles.paymentValue}>{formatPaymentValue(paymentInfo.platformFee)}</Text>
            </View>

            <Text style={styles.paymentDescription}>
              Taxa já incluída no valor da aula. O restante é repassado ao professor.
            </Text>
          </View>

          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPaymentValue(paymentInfo.total)}</Text>
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
              Eu aceito os <Text style={styles.termsLink}>termos e condições</Text> e a{' '}
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
    flex: 1,
  },
  transmissionInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
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
    marginBottom: theme.spacing.sm,
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
  paymentSectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  paymentSplitBox: {
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
    columnGap: theme.spacing.sm,
  },
  paymentLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
    color: theme.colors.text.secondary,
  },
  paymentValue: {
    flexShrink: 0,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  paymentDescription: {
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.success,
    fontWeight: theme.typography.fontWeight.semibold,
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
