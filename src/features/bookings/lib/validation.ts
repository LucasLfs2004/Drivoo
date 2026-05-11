import {
  BookingData,
  BookingValidationError,
  BookingValidationResult,
} from '../types/domain';

export const validateBookingData = (
  data: BookingData
): BookingValidationResult => {
  const errors: BookingValidationError[] = [];

  if (!data.instructorId) {
    errors.push({ field: 'instructor', message: 'Instrutor é obrigatório' });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Data é obrigatória' });
  } else if (data.date <= new Date()) {
    errors.push({ field: 'date', message: 'Data deve ser no futuro' });
  }

  if (!data.timeSlot) {
    errors.push({ field: 'timeSlot', message: 'Horário é obrigatório' });
  }

  if (!data.price || data.price <= 0) {
    errors.push({ field: 'price', message: 'Preço deve ser maior que zero' });
  }

  if (!data.duration || data.duration <= 0) {
    errors.push({ field: 'duration', message: 'Duração deve ser maior que zero' });
  }

  if (!data.location?.endereco) {
    errors.push({ field: 'location', message: 'Endereço é obrigatório' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
