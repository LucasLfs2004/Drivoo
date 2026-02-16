// Services exports
// API services and external integrations will be added as needed

export { SecureStorageService } from './secureStorage';
export { AuthApiService } from './authApi';
export { locationService, LocationService } from './locationService';
export type { StoredAuthData } from './secureStorage';
export type { LocationPermissionStatus, LocationServiceResult } from './locationService';

// Stripe payment service
export {
  initializeStripe,
  createPaymentIntent,
  createSplitPayment,
  calculatePaymentSplit,
  STRIPE_PUBLISHABLE_KEY,
} from './stripeService';

// Notification service
export { notificationService, NotificationService } from './notificationService';