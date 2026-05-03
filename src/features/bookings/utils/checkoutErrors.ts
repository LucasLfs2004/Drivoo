const CHECKOUT_SLOT_CONFLICT_MESSAGE =
  'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário disponível para continuar.';

const getErrorText = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as {
      message?: unknown;
      details?: { detail?: unknown };
    };

    if (typeof record.message === 'string') {
      return record.message;
    }

    if (typeof record.details?.detail === 'string') {
      return record.details.detail;
    }
  }

  return '';
};

export const mapCreateCheckoutSessionError = (error: unknown): Error => {
  const errorText = getErrorText(error);

  if (
    errorText
      .toLowerCase()
      .includes('instructor already has an appointment at this time')
  ) {
    return new Error(CHECKOUT_SLOT_CONFLICT_MESSAGE);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(
    errorText || 'Não foi possível iniciar o checkout. Tente novamente.'
  );
};
