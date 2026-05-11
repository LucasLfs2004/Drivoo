import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_CHECKOUT_BOOKING_ID_KEY = '@drivoo:bookings:pendingCheckoutBookingId';
const PENDING_CHECKOUT_SESSIONS_KEY = '@drivoo:bookings:pendingCheckoutSessions';

export interface PendingCheckoutSession {
  bookingId: string;
  checkoutUrl: string;
  expiresAt?: string | null;
}

const getStoredSessions = async (): Promise<Record<string, PendingCheckoutSession>> => {
  const rawSessions = await AsyncStorage.getItem(PENDING_CHECKOUT_SESSIONS_KEY);

  if (!rawSessions) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawSessions);

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const pendingCheckoutStorage = {
  async saveBookingId(bookingId: string): Promise<void> {
    await AsyncStorage.setItem(PENDING_CHECKOUT_BOOKING_ID_KEY, bookingId);
  },

  async saveCheckoutSession(session: PendingCheckoutSession): Promise<void> {
    const sessions = await getStoredSessions();
    sessions[session.bookingId] = session;

    await Promise.all([
      AsyncStorage.setItem(PENDING_CHECKOUT_BOOKING_ID_KEY, session.bookingId),
      AsyncStorage.setItem(PENDING_CHECKOUT_SESSIONS_KEY, JSON.stringify(sessions)),
    ]);
  },

  async getBookingId(): Promise<string | null> {
    return AsyncStorage.getItem(PENDING_CHECKOUT_BOOKING_ID_KEY);
  },

  async getCheckoutSession(bookingId: string): Promise<PendingCheckoutSession | null> {
    const sessions = await getStoredSessions();

    return sessions[bookingId] ?? null;
  },

  async clearCheckoutSession(bookingId: string): Promise<void> {
    const sessions = await getStoredSessions();
    delete sessions[bookingId];

    await AsyncStorage.setItem(PENDING_CHECKOUT_SESSIONS_KEY, JSON.stringify(sessions));
  },

  async clearBookingId(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_CHECKOUT_BOOKING_ID_KEY);
  },
};
