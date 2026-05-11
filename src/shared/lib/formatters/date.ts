export const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

type FormatDateOptions = {
  dateOnly?: boolean;
};

export const formatDate = (date: Date | string, options?: FormatDateOptions) => {
  const parsedDate = new Date(date);

  const formattedDate = parsedDate.toLocaleDateString('pt-BR');

  if (options?.dateOnly) {
    return formattedDate;
  }

  const formattedTime = parsedDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} às ${formattedTime}`;
};
