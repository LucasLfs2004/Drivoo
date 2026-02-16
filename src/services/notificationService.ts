/**
 * Notification Service
 * 
 * Handles push notifications for bookings and chat messages.
 * This implementation provides the core infrastructure for notifications.
 * 
 * For production, integrate with:
 * - @react-native-firebase/messaging for FCM (Android/iOS)
 * - @notifee/react-native for local notifications and advanced features
 * 
 * Current implementation uses AsyncStorage for notification persistence
 * and provides hooks for push notification integration.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationData,
  NotificationType,
  NotificationPermissionStatus,
  NotificationSettings,
  BookingNotificationData,
  ChatNotificationData,
  PushNotificationToken,
} from '../types/notification';

const STORAGE_KEYS = {
  NOTIFICATIONS: '@drivoo:notifications',
  SETTINGS: '@drivoo:notification_settings',
  TOKEN: '@drivoo:push_token',
  PERMISSION: '@drivoo:notification_permission',
};

class NotificationService {
  private listeners: Map<string, (notification: NotificationData) => void> = new Map();
  private initialized = false;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if settings exist, if not create defaults
      const settings = await this.getSettings();
      if (!settings) {
        await this.saveSettings({
          enabled: true,
          bookingNotifications: true,
          chatNotifications: true,
          reminderNotifications: true,
          sound: true,
          vibration: true,
        });
      }

      this.initialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      // In a real implementation, this would use:
      // - iOS: PushNotificationIOS.requestPermissions()
      // - Android: PermissionsAndroid.request()
      // - Or @notifee/react-native for unified API
      
      // For now, simulate permission request
      const status: NotificationPermissionStatus = {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.PERMISSION,
        JSON.stringify(status)
      );

      return status;
    } catch (error) {
      console.error('[NotificationService] Permission request failed:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  /**
   * Check current permission status
   */
  async checkPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION);
      if (stored) {
        return JSON.parse(stored);
      }

      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    } catch (error) {
      console.error('[NotificationService] Permission check failed:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    }
  }

  /**
   * Register device for push notifications and get token
   */
  async registerForPushNotifications(
    userId: string
  ): Promise<PushNotificationToken | null> {
    try {
      // Check current permissions first
      const currentPermissions = await this.checkPermissions();
      
      // If not granted and undetermined, request permissions
      if (!currentPermissions.granted && currentPermissions.status === 'undetermined') {
        const permissions = await this.requestPermissions();
        if (!permissions.granted) {
          console.warn('[NotificationService] Permissions not granted');
          return null;
        }
      } else if (!currentPermissions.granted) {
        // Already denied, don't request again
        console.warn('[NotificationService] Permissions not granted');
        return null;
      }

      // In production, get actual FCM/APNS token:
      // const token = await messaging().getToken();
      
      // Simulate token generation
      const token: PushNotificationToken = {
        token: `mock_token_${userId}_${Date.now()}`,
        platform: 'android', // or 'ios' based on Platform.OS
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
      
      // In production, send token to backend for storage
      console.log('[NotificationService] Push token registered:', token.token);
      
      return token;
    } catch (error) {
      console.error('[NotificationService] Push registration failed:', error);
      return null;
    }
  }

  /**
   * Get stored push notification token
   */
  async getPushToken(): Promise<PushNotificationToken | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('[NotificationService] Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Create and display a notification for a new booking
   */
  async sendBookingNotification(
    userId: string,
    type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder',
    data: BookingNotificationData
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings?.enabled || !settings?.bookingNotifications) {
      console.log('[NotificationService] Booking notifications disabled');
      return;
    }

    const titles: Record<typeof type, string> = {
      booking_new: 'Nova Aula Agendada',
      booking_confirmed: 'Aula Confirmada',
      booking_cancelled: 'Aula Cancelada',
      booking_reminder: 'Lembrete de Aula',
    };

    const bodies: Record<typeof type, string> = {
      booking_new: `${data.instructorName || data.studentName} agendou uma aula para ${data.date} às ${data.timeSlot}`,
      booking_confirmed: `Sua aula com ${data.instructorName || data.studentName} foi confirmada`,
      booking_cancelled: `Sua aula com ${data.instructorName || data.studentName} foi cancelada`,
      booking_reminder: `Lembrete: Sua aula começa em 1 hora`,
    };

    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: titles[type],
      body: bodies[type],
      data: data as Record<string, any>,
      timestamp: new Date(),
      read: false,
      userId,
    };

    await this.saveNotification(notification);
    await this.displayNotification(notification);
    this.notifyListeners(notification);
  }

  /**
   * Create and display a notification for a chat message
   */
  async sendChatNotification(
    userId: string,
    type: 'chat_message' | 'chat_new_conversation',
    data: ChatNotificationData
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings?.enabled || !settings?.chatNotifications) {
      console.log('[NotificationService] Chat notifications disabled');
      return;
    }

    const titles: Record<typeof type, string> = {
      chat_message: `Nova mensagem de ${data.senderName}`,
      chat_new_conversation: 'Nova conversa',
    };

    const bodies: Record<typeof type, string> = {
      chat_message: data.messagePreview,
      chat_new_conversation: `${data.senderName} iniciou uma conversa com você`,
    };

    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: titles[type],
      body: bodies[type],
      data: data as Record<string, any>,
      timestamp: new Date(),
      read: false,
      userId,
    };

    await this.saveNotification(notification);
    await this.displayNotification(notification);
    this.notifyListeners(notification);
  }

  /**
   * Display a notification to the user
   * In production, use @notifee/react-native or similar
   */
  private async displayNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // In production, use notifee or similar:
      // await notifee.displayNotification({
      //   title: notification.title,
      //   body: notification.body,
      //   data: notification.data,
      //   android: { channelId: 'default' },
      //   ios: { sound: 'default' }
      // });

      console.log('[NotificationService] Display notification:', {
        title: notification.title,
        body: notification.body,
      });
    } catch (error) {
      console.error('[NotificationService] Display failed:', error);
    }
  }

  /**
   * Save notification to storage
   */
  private async saveNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      const notifications = await this.getNotifications(notification.userId);
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      const trimmed = notifications.slice(0, 100);
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.NOTIFICATIONS}_${notification.userId}`,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      console.error('[NotificationService] Save notification failed:', error);
    }
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem(
        `${STORAGE_KEYS.NOTIFICATIONS}_${userId}`
      );
      if (stored) {
        const notifications = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('[NotificationService] Get notifications failed:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.NOTIFICATIONS}_${userId}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('[NotificationService] Mark as read failed:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      const updated = notifications.map(n => ({ ...n, read: true }));
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.NOTIFICATIONS}_${userId}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('[NotificationService] Mark all as read failed:', error);
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearNotifications(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(
        `${STORAGE_KEYS.NOTIFICATIONS}_${userId}`
      );
    } catch (error) {
      console.error('[NotificationService] Clear notifications failed:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('[NotificationService] Get settings failed:', error);
      return null;
    }
  }

  /**
   * Update notification settings
   */
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('[NotificationService] Save settings failed:', error);
      throw error;
    }
  }

  /**
   * Add a listener for new notifications
   */
  addListener(
    id: string,
    callback: (notification: NotificationData) => void
  ): void {
    this.listeners.set(id, callback);
  }

  /**
   * Remove a notification listener
   */
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners of a new notification
   */
  private notifyListeners(notification: NotificationData): void {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('[NotificationService] Listener error:', error);
      }
    });
  }

  /**
   * Handle notification tap/press
   */
  async handleNotificationPress(
    notificationId: string,
    userId: string
  ): Promise<NotificationData | null> {
    try {
      const notifications = await this.getNotifications(userId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        await this.markAsRead(userId, notificationId);
        return notification;
      }
      
      return null;
    } catch (error) {
      console.error('[NotificationService] Handle press failed:', error);
      return null;
    }
  }

  /**
   * Schedule a reminder notification
   * In production, use @notifee/react-native trigger notifications
   */
  async scheduleReminder(
    userId: string,
    bookingData: BookingNotificationData,
    triggerTime: Date
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings?.enabled || !settings?.reminderNotifications) {
        console.log('[NotificationService] Reminder notifications disabled');
        return;
      }

      // In production, schedule with notifee:
      // await notifee.createTriggerNotification(
      //   {
      //     title: 'Lembrete de Aula',
      //     body: `Sua aula começa em 1 hora`,
      //     data: bookingData,
      //   },
      //   {
      //     type: TriggerType.TIMESTAMP,
      //     timestamp: triggerTime.getTime(),
      //   }
      // );

      console.log('[NotificationService] Reminder scheduled for:', triggerTime);
    } catch (error) {
      console.error('[NotificationService] Schedule reminder failed:', error);
    }
  }

  /**
   * Cancel a scheduled reminder
   */
  async cancelReminder(notificationId: string): Promise<void> {
    try {
      // In production: await notifee.cancelNotification(notificationId);
      console.log('[NotificationService] Reminder cancelled:', notificationId);
    } catch (error) {
      console.error('[NotificationService] Cancel reminder failed:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export { NotificationService };
