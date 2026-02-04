// Booking type definitions

export interface BookingData {
  id?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  date: Date;
  timeSlot: string;
  duration: number; // em minutos
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

export interface BookingConfirmationData {
  booking: BookingData;
  paymentInfo: {
    subtotal: number;
    platformFee: number;
    total: number;
    currency: string;
  };
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