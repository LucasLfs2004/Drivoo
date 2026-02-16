import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  CardField,
  useStripe,
  CardFieldInput,
} from '@stripe/stripe-react-native';
import { Button } from '../common/Button';
import { theme } from '../../themes';
import { formatCurrency } from '../../utils/currency';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: Error) => void;
  clientSecret: string;
  disabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'BRL',
  onPaymentSuccess,
  onPaymentError,
  clientSecret,
  disabled = false,
}) => {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Detecta modo mock
  const isMockMode = clientSecret.startsWith('pi_mock_');

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Erro', 'Por favor, preencha os dados do cartão');
      return;
    }

    setLoading(true);

    try {
      // Detecta se está em modo mock (clientSecret começa com 'pi_mock_')
      const isMockMode = clientSecret.startsWith('pi_mock_');

      if (isMockMode) {
        // Modo de desenvolvimento - simula pagamento bem-sucedido
        console.log('💳 Processing mock payment...');
        
        // Simula delay de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extrai o ID do mock payment intent
        const mockPaymentIntentId = clientSecret.split('_secret_')[0];
        
        console.log('✅ Mock payment successful:', mockPaymentIntentId);
        
        onPaymentSuccess(mockPaymentIntentId);
      } else {
        // Modo de produção - usa Stripe real
        const { error, paymentIntent } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
        });

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent) {
          onPaymentSuccess(paymentIntent.id);
        }
      }
    } catch (error) {
      onPaymentError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (cardDetails: CardFieldInput.Details) => {
    setCardComplete(cardDetails.complete);
  };

  const formatValue = (value: number): string => {
    return formatCurrency(value, currency);
  };

  return (
    <View style={styles.container}>
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Valor Total</Text>
        <Text style={styles.amountValue}>{formatValue(amount)}</Text>
      </View>

      <View style={styles.cardFieldContainer}>
        <Text style={styles.label}>Dados do Cartão</Text>
        <CardField
          postalCodeEnabled={false}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={styles.cardField}
          style={styles.cardFieldWrapper}
          onCardChange={handleCardChange}
          disabled={disabled || loading}
        />
      </View>

      <Button
        onPress={handlePayment}
        disabled={!cardComplete || disabled || loading}
        style={styles.payButton}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text.inverse} />
        ) : (
          <Text style={styles.payButtonText}>
            Pagar {formatValue(amount)}
          </Text>
        )}
      </Button>

      {isMockMode && (
        <View style={styles.mockNotice}>
          <Text style={styles.mockNoticeText}>
            🧪 Modo de Desenvolvimento: Este é um pagamento simulado. Nenhuma
            cobrança real será feita.
          </Text>
        </View>
      )}

      <Text style={styles.secureText}>
        🔒 Pagamento seguro processado pelo Stripe
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  amountContainer: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  cardFieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cardFieldWrapper: {
    height: 50,
  },
  cardField: {
    backgroundColor: theme.colors.background.primary,
    textColor: theme.colors.text.primary,
    borderColor: theme.colors.border.medium,
    borderWidth: 1,
    borderRadius: theme.borders.radius.md,
  },
  payButton: {
    marginBottom: theme.spacing.md,
  },
  payButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  mockNotice: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[500],
    borderWidth: 1,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  mockNoticeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning[800],
    textAlign: 'center',
    lineHeight: 16,
  },
  secureText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
