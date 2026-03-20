import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PaymentForm } from '../../../components/forms/PaymentForm';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { theme } from '../../../themes';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { createSplitPayment } from '../../../services/stripeService';
import { usePaymentSplit } from '../hooks/usePaymentSplit';
import { PaymentSplitBreakdown } from '../components/PaymentSplitBreakdown';
import { BOOKING_PLATFORM_FEE_RATE } from '../utils/payment';

type Props = NativeStackScreenProps<
  AlunoSearchStackParamList,
  'PaymentConfirmation'
>;

export const PaymentConfirmationScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { bookingData } = route.params;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { splitInfo, isValid } = usePaymentSplit({
    amount: bookingData.price,
    platformFeePercentage: BOOKING_PLATFORM_FEE_RATE,
    currency: bookingData.currency,
  });

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const instructorAccountId = `acct_${bookingData.instructorId}`;

      const { clientSecret: secret } = await createSplitPayment(
        bookingData.price,
        instructorAccountId,
        BOOKING_PLATFORM_FEE_RATE,
        bookingData.currency,
        {
          bookingId: bookingData.id || 'pending',
          instructorId: bookingData.instructorId,
          instructorName: bookingData.instructorName,
          date: bookingData.date.toISOString(),
          timeSlot: bookingData.timeSlot,
        }
      );

      setClientSecret(secret);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao inicializar pagamento';
      setError(errorMessage);
      Alert.alert(
        'Erro',
        'Não foi possível inicializar o pagamento. Tente novamente.',
        [
          { text: 'Tentar Novamente', onPress: initializePayment },
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setPaymentProcessing(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Pagamento Confirmado! 🎉',
        `Sua aula com ${bookingData.instructorName} foi agendada com sucesso!`,
        [
          {
            text: 'Ver Agendamentos',
            onPress: () => {
              navigation.navigate('SearchScreen');
            },
          },
        ]
      );

      console.log('Payment successful:', paymentIntentId);
    } catch {
      Alert.alert(
        'Erro',
        'Pagamento processado, mas houve um erro ao confirmar o agendamento. Entre em contato com o suporte.'
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (err: Error) => {
    console.error('Payment error:', err);

    let errorMessage = 'Não foi possível processar o pagamento.';

    if (err.message.includes('card_declined')) {
      errorMessage = 'Cartão recusado. Verifique os dados ou tente outro cartão.';
    } else if (err.message.includes('insufficient_funds')) {
      errorMessage = 'Saldo insuficiente. Tente outro cartão.';
    } else if (err.message.includes('expired_card')) {
      errorMessage = 'Cartão expirado. Use um cartão válido.';
    } else if (err.message.includes('incorrect_cvc')) {
      errorMessage = 'Código de segurança incorreto.';
    } else if (err.message.includes('processing_error')) {
      errorMessage = 'Erro ao processar pagamento. Tente novamente.';
    }

    Alert.alert('Erro no Pagamento', errorMessage, [
      { text: 'Tentar Novamente', onPress: () => setError(null) },
      {
        text: 'Voltar',
        onPress: () => navigation.goBack(),
        style: 'cancel',
      },
    ]);
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancelar Pagamento',
      'Tem certeza que deseja cancelar o pagamento? Você perderá este agendamento.',
      [
        { text: 'Não, Continuar', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('SearchScreen');
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Preparando pagamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !clientSecret || !isValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Erro ao Processar Pagamento</Text>
          <Text style={styles.errorMessage}>
            {error || 'Dados de pagamento inválidos'}
          </Text>
          <Button
            title="Tentar Novamente"
            onPress={initializePayment}
            style={styles.retryButton}
          />
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Button
            title="← Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Pagamento</Text>
          <Text style={styles.headerSubtitle}>
            Complete o pagamento para confirmar sua aula
          </Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumo da Aula</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Instrutor</Text>
            <Text style={styles.summaryValue}>{bookingData.instructorName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data</Text>
            <Text style={styles.summaryValue}>{formatDate(bookingData.date)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Horário</Text>
            <Text style={styles.summaryValue}>{bookingData.timeSlot}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duração</Text>
            <Text style={styles.summaryValue}>{bookingData.duration} minutos</Text>
          </View>
        </Card>

        <PaymentSplitBreakdown splitInfo={splitInfo} showDetails />

        <Button
          title="Cancelar Agendamento"
          variant="outline"
          onPress={handleCancelPayment}
          disabled={paymentProcessing}
          style={styles.cancelButton}
        />

        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Dados de Pagamento</Text>
          <PaymentForm
            amount={splitInfo.total}
            currency={splitInfo.currency}
            clientSecret={clientSecret}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            disabled={paymentProcessing}
          />
        </Card>

        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Seus dados de pagamento são processados de forma segura pelo Stripe.
            Não armazenamos informações do seu cartão.
          </Text>
        </View>
      </ScrollView>

      {paymentProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.text.inverse} />
          <Text style={styles.processingText}>Confirmando agendamento...</Text>
        </View>
      )}
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
  },
  scrollContent: {
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
    padding: theme.spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    marginBottom: theme.spacing.md,
    minWidth: 200,
  },
  backButton: {
    minWidth: 200,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  cancelButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  paymentCard: {
    marginBottom: theme.spacing.lg,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing.xl,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  securityText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
