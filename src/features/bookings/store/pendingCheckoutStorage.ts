import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_CHECKOUT_BOOKING_ID_KEY = '@drivoo:bookings:pendingCheckoutBookingId';

export const pendingCheckoutStorage = {
  async saveBookingId(bookingId: string): Promise<void> {
    await AsyncStorage.setItem(PENDING_CHECKOUT_BOOKING_ID_KEY, bookingId);
  },

  async getBookingId(): Promise<string | null> {
    return AsyncStorage.getItem(PENDING_CHECKOUT_BOOKING_ID_KEY);
  },

  async clearBookingId(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_CHECKOUT_BOOKING_ID_KEY);
  },
};
