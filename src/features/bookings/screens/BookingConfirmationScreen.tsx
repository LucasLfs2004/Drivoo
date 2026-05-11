import { formatDate } from '@/shared/lib/formatters/date';
import { formatDuration } from '@/shared/lib/formatters/duration';
import {
  AppHeader,
  Button,
  Divider,
  FormCheckbox,
  InfoDisplay,
  Page,
  Typography,
} from '@/shared/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, Car, Clock, MapPin, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../utils/currency';
import { calculateBookingPaymentInfo } from '../lib/payment';
import { validateBookingData } from '../lib/validation';

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
    <Page
      header={
        <AppHeader
          title="Confirmar Agendamento"
          subtitle="Revise os detalhes antes de seguir para o pagamento"
          onBackPress={() => navigation.goBack()}
        />
      }
      scrollable
    >
      <View style={styles.instructorHeader}>
        <View style={styles.instructorHeaderInfo}>
          {renderInstructorAvatar()}
          <View>
            <Typography variant="body" weight="bold">
              {bookingData.instructorName}
            </Typography>
            <View style={styles.rating}>
              <Star color={theme.colors.accent[500]} size={18} />
              <Typography variant="label" color="tertiary">
                4.5
              </Typography>
            </View>
          </View>
        </View>
        <View style={styles.vehicleMetaRow}>
          <Car color={theme.colors.text.secondary} size={18} />
          <Text style={styles.vehicleInfo}>{bookingData.vehicleInfo.marca}</Text>
        </View>
      </View>

      <Divider />
      <View style={styles.detailContent}>
        <Typography variant="h4" weight="semibold" style={styles.sectionTitle}>
          Detalhes da Aula
        </Typography>
        <InfoDisplay
          icon={Calendar}
          title="Data e horário"
          info={`${formatDate(bookingData.date)} às ${bookingData.timeSlot}`}
        />
        <InfoDisplay icon={Clock} title="Duração" info={formatDuration(bookingData.duration)} />
        <InfoDisplay icon={MapPin} title="Local de Encontro" info={bookingData.location.endereco} />
        <InfoDisplay
          icon={Car}
          title="Veículo"
          info={`${bookingData.vehicleInfo.marca} ${bookingData.vehicleInfo.modelo} (${bookingData.vehicleInfo.transmissao})`}
        />
      </View>
      <Divider />

      <View style={styles.paymentCard}>
        <Typography variant="h4" weight="semibold">
          Resumo do pagamento
        </Typography>

        <View style={styles.paymentRow}>
          <Typography>Valor da aula</Typography>
          <Typography color="contrast">{formatPaymentValue(paymentInfo.subtotal)}</Typography>
        </View>

        <View style={styles.paymentSplitBox}>
          <View style={styles.paymentRow}>
            <Typography color="secondary" variant="caption" weight="medium">
              Valor para o professor
            </Typography>
            <Typography variant="caption">
              {formatPaymentValue(paymentInfo.instructorAmount)}
            </Typography>
          </View>
          <View style={styles.paymentRow}>
            <Typography color="secondary" variant="caption" weight="medium">
              Taxa plataforma ({Math.round(paymentInfo.platformFeeRate * 100)}%)
            </Typography>
            <Typography variant="caption">{formatPaymentValue(paymentInfo.platformFee)}</Typography>
          </View>

          <Typography variant="label" color="secondary">
            Taxa já incluída no valor da aula. O restante é repassado ao professor.
          </Typography>
        </View>
        <View style={[styles.paymentRow]}>
          <Typography weight="medium">Total</Typography>
          <Typography weight="semibold" color="success">
            {formatPaymentValue(paymentInfo.total)}
          </Typography>
        </View>
      </View>
      <Divider />
      <View style={styles.termsCard}>
        <FormCheckbox onChange={() => setTermsAccepted(!termsAccepted)} checked={termsAccepted} />
        <Typography variant="caption" color="secondary" weight="medium">
          Eu aceito os{' '}
          <Typography
            color="link"
            variant="caption"
            weight="medium"
            // onPress={() => navigation.navigate('terms')}
          >
            termos e condições
          </Typography>{' '}
          e a{' '}
          <Typography
            color="link"
            variant="caption"
            weight="medium"
            // onPress={() => navigation.navigate('terms')}
          >
            política de privacidade
          </Typography>
        </Typography>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Continuar para Pagamento"
          variant="primary"
          onPress={handleConfirmBooking}
          disabled={!termsAccepted}
        />
        <Button title="Editar Agendamento" variant="outline" onPress={handleEditBooking} />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  instructorCard: {
    marginBottom: theme.spacing.lg,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  instructorHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.xs,
  },
  vehicleInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
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
    marginBottom: theme.spacing.sm,
  },
  detailContent: {
    flex: 1,
    rowGap: theme.spacing.sm - theme.spacing.xs,
  },
  paymentCard: {
    flexDirection: 'column',
    rowGap: theme.spacing.sm,
  },
  paymentSplitBox: {
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
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

  termsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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
  actionsContainer: {
    gap: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
