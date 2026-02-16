// Stripe service for payment processing
import { initStripe } from '@stripe/stripe-react-native';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 
  'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

/**
 * Initialize Stripe SDK
 * Should be called once when the app starts
 */
export const initializeStripe = async (): Promise<void> => {
  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.drivoo',
      urlScheme: 'drivoo',
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    throw error;
  }
};

/**
 * Create payment intent on backend
 * This should call your backend API to create a PaymentIntent
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'BRL',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  // TODO: Replace with actual backend API call
  // This is a placeholder that should be replaced with real API integration
  try {
    const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Create split payment with platform fee
 * This should call your backend API to create a PaymentIntent with transfer_data
 */
export const createSplitPayment = async (
  amount: number,
  instructorAccountId: string,
  platformFeePercentage: number = 0.15, // 15% platform fee
  currency: string = 'BRL',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  // MOCK MODE: Simula a criação de um payment intent para desenvolvimento
  // TODO: Replace with actual backend API call when backend is ready
  
  console.log('🔄 Creating split payment (MOCK MODE):', {
    amount,
    instructorAccountId,
    platformFeePercentage,
    currency,
    metadata,
  });

  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Verifica se é um ambiente de desenvolvimento
  const isDevelopment = __DEV__;

  if (isDevelopment) {
    // Retorna um clientSecret mock para desenvolvimento
    // IMPORTANTE: Isso NÃO processará pagamentos reais
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;

    console.log('✅ Mock payment intent created:', {
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    });

    return {
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    };
  }

  // Código para produção (quando backend estiver pronto)
  try {
    const platformFee = Math.round(amount * platformFeePercentage * 100);
    const instructorAmount = Math.round(amount * 100) - platformFee;

    // TODO: Substituir com a URL real do seu backend
    const backendUrl = process.env.BACKEND_URL || 'YOUR_BACKEND_URL';
    
    const response = await fetch(`${backendUrl}/create-split-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        instructorAccountId,
        platformFee,
        instructorAmount,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create split payment');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error creating split payment:', error);
    throw new Error('Não foi possível conectar ao servidor de pagamentos. Verifique sua conexão.');
  }
};

/**
 * Calculate platform fee and instructor amount
 */
export const calculatePaymentSplit = (
  totalAmount: number,
  platformFeePercentage: number = 0.15
): {
  total: number;
  platformFee: number;
  instructorAmount: number;
} => {
  const platformFee = totalAmount * platformFeePercentage;
  const instructorAmount = totalAmount - platformFee;

  return {
    total: totalAmount,
    platformFee: Math.round(platformFee * 100) / 100,
    instructorAmount: Math.round(instructorAmount * 100) / 100,
  };
};
