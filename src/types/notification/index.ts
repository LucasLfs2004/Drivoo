// Notification type definitions

export type NotificationType = 
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'chat_message'
  | 'chat_new_conversation'
  | 'payment_success'
  | 'payment_failed';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  userId: string;
}

export interface BookingNotificationData {
  bookingId: string;
  instructorId?: string;
  instructorName?: string;
  studentId?: string;
  studentName?: string;
  date?: string;
  timeSlot?: string;
}

export interface ChatNotificationData {
  conversationId: string;
  senderId: string;
  senderName: string;
  messagePreview: string;
  messageType: 'text' | 'image' | 'location';
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface NotificationSettings {
  enabled: boolean;
  bookingNotifications: boolean;
  chatNotifications: boolean;
  reminderNotifications: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
