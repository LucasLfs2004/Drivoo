import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationData,
  NotificationPermissionStatus,
  NotificationSettings,
  BookingNotificationData,
  ChatNotificationData,
  PushNotificationToken,
} from '../types/domain';

const STORAGE_KEYS = {
  NOTIFICATIONS: '@drivoo:notifications',
  SETTINGS: '@drivoo:notification_settings',
  TOKEN: '@drivoo:push_token',
  PERMISSION: '@drivoo:notification_permission',
};

class NotificationService {
  private listeners: Map<string, (notification: NotificationData) => void> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

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
  }

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const status: NotificationPermissionStatus = {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION, JSON.stringify(status));
      return status;
    } catch {
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  async checkPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return {
      granted: false,
      canAskAgain: true,
      status: 'undetermined',
    };
  }

  async registerForPushNotifications(
    userId: string
  ): Promise<PushNotificationToken | null> {
    try {
      const currentPermissions = await this.checkPermissions();

      if (!currentPermissions.granted && currentPermissions.status === 'undetermined') {
        const permissions = await this.requestPermissions();
        if (!permissions.granted) return null;
      } else if (!currentPermissions.granted) {
        return null;
      }

      const token: PushNotificationToken = {
        token: `mock_token_${userId}_${Date.now()}`,
        platform: 'android',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
      return token;
    } catch {
      return null;
    }
  }

  async getPushToken(): Promise<PushNotificationToken | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  async sendBookingNotification(
    userId: string,
    type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder',
    data: BookingNotificationData
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings?.enabled || !settings.bookingNotifications) return;

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
      booking_reminder: 'Lembrete: Sua aula começa em 1 hora',
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

  async sendChatNotification(
    userId: string,
    type: 'chat_message' | 'chat_new_conversation',
    data: ChatNotificationData
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings?.enabled || !settings.chatNotifications) return;

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

  async getNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!stored) return [];

      const notifications: NotificationData[] = JSON.parse(stored).map(
        (notification: NotificationData & { timestamp: string }) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        })
      );

      return notifications
        .filter(notification => notification.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch {
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotifications(userId);
    return notifications.filter(notification => !notification.read).length;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notifications = await this.getNotifications(userId);
    const updated = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    await this.saveNotifications(updated, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getNotifications(userId);
    const updated = notifications.map(notification => ({ ...notification, read: true }));
    await this.saveNotifications(updated, userId);
  }

  async clearNotifications(userId: string): Promise<void> {
    await this.saveNotifications([], userId);
  }

  async getSettings(): Promise<NotificationSettings | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  addListener(id: string, listener: (notification: NotificationData) => void): void {
    this.listeners.set(id, listener);
  }

  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  private async saveNotification(notification: NotificationData): Promise<void> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const allNotifications: NotificationData[] = stored
      ? JSON.parse(stored).map((item: NotificationData & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      : [];

    allNotifications.unshift(notification);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifications));
  }

  private async saveNotifications(
    notifications: NotificationData[],
    userId: string
  ): Promise<void> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const allNotifications: NotificationData[] = stored
      ? JSON.parse(stored).map((item: NotificationData & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      : [];

    const others = allNotifications.filter(notification => notification.userId !== userId);
    const merged = [...others, ...notifications];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
  }

  private async displayNotification(_notification: NotificationData): Promise<void> {
    return Promise.resolve();
  }

  private notifyListeners(notification: NotificationData): void {
    this.listeners.forEach(listener => listener(notification));
  }
}

export { NotificationService };
export const notificationService = new NotificationService();
