import type {
  BookingListApiStatus,
  BookingListItemApiResponse,
  ListMyBookingsApiResponse,
} from '../types/api';
import type { ScheduledBooking, ScheduledBookingStatus } from '../types/domain';

const getListItems = (response: ListMyBookingsApiResponse): BookingListItemApiResponse[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? response.items ?? response.agendamentos ?? [];
};

const getInstructorName = (item: BookingListItemApiResponse): string => {
  const instructor = item.instrutor;
  const fullName = instructor?.nome_completo?.trim();

  if (fullName) {
    return fullName;
  }

  const nameParts = [instructor?.nome, instructor?.sobrenome].filter(Boolean);
  const nestedName = nameParts.join(' ').trim();

  return nestedName || item.instrutor_nome?.trim() || item.nome_instrutor?.trim() || 'Instrutor';
};

const parsePtBrDate = (value: string): string | null => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

const parseDate = (date?: string | null, time?: string | null): Date | null => {
  const rawDate = date?.trim();

  if (!rawDate) {
    return null;
  }

  const normalizedDate = parsePtBrDate(rawDate) ?? rawDate.replace(' ', 'T');
  const normalizedTime = time?.trim() || '00:00:00';
  const isoCandidate = normalizedDate.includes('T')
    ? normalizedDate
    : `${normalizedDate}T${normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime}`;
  const parsed = new Date(isoCandidate);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getBookingDate = (item: BookingListItemApiResponse): Date | null => {
  const dateOnly = item.data ?? item.data_aula;
  const dateTime = item.inicio ?? item.data_inicio ?? item.data_hora_inicio;

  return parseDate(dateOnly, item.hora_inicio) ?? parseDate(dateTime);
};

const mapStatus = (status?: BookingListApiStatus | string | null): ScheduledBookingStatus => {
  switch (status) {
    case 'CONCLUIDO':
      return 'completed';
    case 'CANCELADO':
    case 'EXPIRADO':
    case 'NAO_COMPARECEU':
      return 'cancelled';
    case 'EM_ANDAMENTO':
      return 'in_progress';
    case 'AGENDADO':
    case 'CONFIRMADO':
    case 'PENDENTE_PAGAMENTO':
    default:
      return 'scheduled';
  }
};

const mapVehicleType = (item: BookingListItemApiResponse): ScheduledBooking['vehicleType'] => {
  const rawType = item.veiculo?.tipo_cambio ?? item.veiculo?.transmissao;
  const normalized = rawType?.toLowerCase();

  if (normalized === 'manual') {
    return 'manual';
  }

  if (normalized === 'automatico' || normalized === 'automatic') {
    return 'automatic';
  }

  return undefined;
};

const getLocation = (item: BookingListItemApiResponse): string | undefined => {
  if (typeof item.local === 'string') {
    return item.local || undefined;
  }

  return item.local?.endereco ?? item.endereco ?? undefined;
};

const getPrice = (item: BookingListItemApiResponse): number =>
  item.valor_total ?? item.valor_aula ?? item.preco ?? 0;

const getCurrencySymbol = (currency?: string | null): string =>
  !currency || currency === 'BRL' ? 'R$' : currency;

export const mapScheduledBookings = (response: ListMyBookingsApiResponse): ScheduledBooking[] =>
  getListItems(response)
    .map(item => {
      const date = getBookingDate(item);

      if (!date) {
        return null;
      }

      return {
        id: item.id ?? item.agendamento_id ?? '',
        instructorId: item.instrutor?.id ?? item.instrutor_id ?? null,
        instructorName: getInstructorName(item),
        instructorAvatar: item.instrutor?.foto_url ?? null,
        date,
        duration: item.duracao_minutos ?? 60,
        price: getPrice(item),
        currency: getCurrencySymbol(item.moeda ?? item.currency),
        status: mapStatus(item.status ?? item.agendamento_status),
        vehicleType: mapVehicleType(item),
        location: getLocation(item),
      };
    })
    .filter((item): item is ScheduledBooking => Boolean(item?.id))
    .sort((left, right) => left.date.getTime() - right.date.getTime());
