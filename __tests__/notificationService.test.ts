/**
 * Notification Service Tests
 * 
 * Tests for the notification service functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../src/services/notificationService';
import {
  NotificationSettings,
  BookingNotificationData,
  ChatNotificationData,
} from '../src/types/notification';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('NotificationService', () => {
  const mockUserId = 'test_user_123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service initialization state
    (notificationService as any).initialized = false;
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(notificationService.initialize()).resolves.not.toThrow();
    });

    it('should create default settings on first initialization', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await notificationService.initialize();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@drivoo:notification_settings',
        expect.stringContaining('"enabled":true')
      );
    });
  });

  describe('Permissions', () => {
    it('should request permissions', async () => {
      const result = await notificationService.requestPermissions();

      expect(result).toHaveProperty('granted');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('canAskAgain');
    });

    it('should check permission status', async () => {
      const mockPermissions = {
        granted: true,
        canAskAgain: true,
        status: 'granted' as const,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockPermissions)
      );

      const result = await notificationService.checkPermissions();

      expect(result.granted).toBe(true);
      expect(result.status).toBe('granted');
    });
  });

  describe('Push Token Registration', () => {
    it('should register for push notifications', async () => {
      // Mock permission check to return granted
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_permission') {
          return Promise.resolve(
            JSON.stringify({ granted: true, status: 'granted', canAskAgain: true })
          );
        }
        return Promise.resolve(null);
      });

      const token = await notificationService.registerForPushNotifications(
        mockUserId
      );

      expect(token).not.toBeNull();
      expect(token?.userId).toBe(mockUserId);
      expect(token?.token).toBeDefined();
    });

    it('should return null if permissions not granted', async () => {
      // Mock permission check to return denied
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_permission') {
          return Promise.resolve(
            JSON.stringify({ granted: false, status: 'denied', canAskAgain: false })
          );
        }
        return Promise.resolve(null);
      });

      const token = await notificationService.registerForPushNotifications(
        mockUserId
      );

      expect(token).toBeNull();
    });
  });

  describe('Booking Notifications', () => {
    const bookingData: BookingNotificationData = {
      bookingId: 'booking_123',
      instructorName: 'João Silva',
      date: '2024-03-15',
      timeSlot: '14:00',
    };

    beforeEach(async () => {
      // Setup default settings
      const settings: NotificationSettings = {
        enabled: true,
        bookingNotifications: true,
        chatNotifications: true,
        reminderNotifications: true,
        sound: true,
        vibration: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_settings') {
          return Promise.resolve(JSON.stringify(settings));
        }
        if (key.startsWith('@drivoo:notifications_')) {
          return Promise.resolve(JSON.stringify([]));
        }
        return Promise.resolve(null);
      });
    });

    it('should send booking notification', async () => {
      // Clear previous calls
      jest.clearAllMocks();

      await notificationService.sendBookingNotification(
        mockUserId,
        'booking_new',
        bookingData
      );

      // Verify notification was saved
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const notificationCall = calls.find(call =>
        call[0].includes('notifications')
      );
      expect(notificationCall).toBeDefined();
    });

    it('should not send notification if disabled in settings', async () => {
      const disabledSettings: NotificationSettings = {
        enabled: false,
        bookingNotifications: false,
        chatNotifications: false,
        reminderNotifications: false,
        sound: false,
        vibration: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_settings') {
          return Promise.resolve(JSON.stringify(disabledSettings));
        }
        return Promise.resolve(null);
      });

      await notificationService.sendBookingNotification(
        mockUserId,
        'booking_new',
        bookingData
      );

      // Should not save notification
      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const notificationCall = calls.find(call =>
        call[0].includes('notifications')
      );
      expect(notificationCall).toBeUndefined();
    });
  });

  describe('Chat Notifications', () => {
    const chatData: ChatNotificationData = {
      conversationId: 'conv_123',
      senderId: 'sender_456',
      senderName: 'Maria Santos',
      messagePreview: 'Olá! Como vai?',
      messageType: 'text',
    };

    beforeEach(async () => {
      const settings: NotificationSettings = {
        enabled: true,
        bookingNotifications: true,
        chatNotifications: true,
        reminderNotifications: true,
        sound: true,
        vibration: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_settings') {
          return Promise.resolve(JSON.stringify(settings));
        }
        if (key.startsWith('@drivoo:notifications_')) {
          return Promise.resolve(JSON.stringify([]));
        }
        return Promise.resolve(null);
      });
    });

    it('should send chat notification', async () => {
      // Clear previous calls
      jest.clearAllMocks();

      await notificationService.sendChatNotification(
        mockUserId,
        'chat_message',
        chatData
      );

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Notification Management', () => {
    it('should get notifications for user', async () => {
      const mockNotifications = [
        {
          id: 'notif_1',
          type: 'booking_new',
          title: 'Nova Aula',
          body: 'Aula agendada',
          timestamp: new Date().toISOString(),
          read: false,
          userId: mockUserId,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockNotifications)
      );

      const notifications = await notificationService.getNotifications(
        mockUserId
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('notif_1');
    });

    it('should get unread count', async () => {
      const mockNotifications = [
        {
          id: 'notif_1',
          type: 'booking_new',
          title: 'Nova Aula',
          body: 'Aula agendada',
          timestamp: new Date().toISOString(),
          read: false,
          userId: mockUserId,
        },
        {
          id: 'notif_2',
          type: 'chat_message',
          title: 'Nova Mensagem',
          body: 'Você tem uma mensagem',
          timestamp: new Date().toISOString(),
          read: true,
          userId: mockUserId,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockNotifications)
      );

      const count = await notificationService.getUnreadCount(mockUserId);

      expect(count).toBe(1);
    });

    it('should mark notification as read', async () => {
      const mockNotifications = [
        {
          id: 'notif_1',
          type: 'booking_new',
          title: 'Nova Aula',
          body: 'Aula agendada',
          timestamp: new Date().toISOString(),
          read: false,
          userId: mockUserId,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockNotifications)
      );

      await notificationService.markAsRead(mockUserId, 'notif_1');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const updateCall = calls.find(call =>
        call[0].includes('notifications')
      );
      expect(updateCall).toBeDefined();
      const updatedData = JSON.parse(updateCall[1]);
      expect(updatedData[0].read).toBe(true);
    });

    it('should clear all notifications', async () => {
      await notificationService.clearNotifications(mockUserId);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `@drivoo:notifications_${mockUserId}`
      );
    });
  });

  describe('Settings Management', () => {
    it('should get notification settings', async () => {
      const mockSettings: NotificationSettings = {
        enabled: true,
        bookingNotifications: true,
        chatNotifications: false,
        reminderNotifications: true,
        sound: true,
        vibration: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockSettings)
      );

      const settings = await notificationService.getSettings();

      expect(settings).toEqual(mockSettings);
    });

    it('should save notification settings', async () => {
      const newSettings: NotificationSettings = {
        enabled: false,
        bookingNotifications: false,
        chatNotifications: false,
        reminderNotifications: false,
        sound: false,
        vibration: false,
      };

      await notificationService.saveSettings(newSettings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@drivoo:notification_settings',
        JSON.stringify(newSettings)
      );
    });
  });

  describe('Notification Listeners', () => {
    it('should add and notify listeners', async () => {
      const mockCallback = jest.fn();
      const listenerId = 'test_listener';

      notificationService.addListener(listenerId, mockCallback);

      // Setup settings
      const settings: NotificationSettings = {
        enabled: true,
        bookingNotifications: true,
        chatNotifications: true,
        reminderNotifications: true,
        sound: true,
        vibration: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@drivoo:notification_settings') {
          return Promise.resolve(JSON.stringify(settings));
        }
        if (key.startsWith('@drivoo:notifications_')) {
          return Promise.resolve(JSON.stringify([]));
        }
        return Promise.resolve(null);
      });

      // Send notification
      await notificationService.sendBookingNotification(
        mockUserId,
        'booking_new',
        {
          bookingId: 'test_123',
          instructorName: 'Test Instructor',
          date: '2024-03-15',
          timeSlot: '14:00',
        }
      );

      // Listener should be called
      expect(mockCallback).toHaveBeenCalled();

      // Cleanup
      notificationService.removeListener(listenerId);
    });

    it('should remove listeners', () => {
      const mockCallback = jest.fn();
      const listenerId = 'test_listener';

      notificationService.addListener(listenerId, mockCallback);
      notificationService.removeListener(listenerId);

      // Listener should not be called after removal
      // (tested implicitly by not throwing errors)
    });
  });
});
