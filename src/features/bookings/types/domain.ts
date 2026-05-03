export interface BookingData {
  id?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  vehicleId?: string | null;
  date: Date;
  timeSlot: string;
  duration: number;
  price: number;
  currency: string;
  vehicleInfo: {
    marca: string;
    modelo: string;
    transmissao: 'manual' | 'automatico';
  };
  location: {
    endereco: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentSplitInfo {
  total: number;
  platformFee: number;
  platformFeePercentage: number;
  instructorAmount: number;
  currency: string;
}

export interface BookingConfirmationData {
  booking: BookingData;
  paymentInfo: {
    subtotal: number;
    platformFee: number;
    total: number;
    currency: string;
  };
  paymentSplit?: PaymentSplitInfo;
  termsAccepted: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface BookingValidationError {
  field: string;
  message: string;
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: BookingValidationError[];
}

export type BookingCheckoutStatusValue =
  | 'PENDENTE_PAGAMENTO'
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'EXPIRADO'
  | 'CANCELADO'
  | 'NAO_COMPARECEU';

export interface BookingCheckoutSession {
  bookingId: string;
  bookingStatus: BookingCheckoutStatusValue;
  transactionId: string;
  transactionStatus: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  expiresAt: string;
  paymentInfo: PaymentSummary | null;
}

export interface BookingCheckoutStatus {
  bookingId: string;
  bookingStatus: BookingCheckoutStatusValue;
  transactionId: string | null;
  transactionStatus: string | null;
  paymentConfirmed: boolean;
  checkoutExpiresAt: string | null;
  paidAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paymentInfo: PaymentSummary | null;
}

export interface PaymentSummary {
  subtotal: number | null;
  platformFee: number | null;
  total: number | null;
  currency: string;
}

export type ScheduledBookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';

export interface ScheduledBooking {
  id: string;
  instructorId: string | null;
  instructorName: string;
  instructorAvatar: string | null;
  date: Date;
  duration: number;
  price: number;
  currency: string;
  status: ScheduledBookingStatus;
  vehicleType: 'manual' | 'automatic' | undefined;
  location: string | undefined;
}
