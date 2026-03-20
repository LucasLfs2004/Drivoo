import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../api/notificationService';
import {
  NotificationData,
  NotificationSettings,
  NotificationPermissionStatus,
  BookingNotificationData,
  ChatNotificationData,
} from '../types/domain';

export interface UseNotificationsResult {
  notifications: NotificationData[];
  unreadCount: number;
  settings: NotificationSettings | null;
  permissions: NotificationPermissionStatus | null;
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  registerForPush: (userId: string) => Promise<void>;
  sendBookingNotification: (
    userId: string,
    type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder',
    data: BookingNotificationData
  ) => Promise<void>;
  sendChatNotification: (
    userId: string,
    type: 'chat_message' | 'chat_new_conversation',
    data: ChatNotificationData
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(userId: string): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [permissions, setPermissions] = useState<NotificationPermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [notifs, count, perms, setts] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId),
        notificationService.checkPermissions(),
        notificationService.getSettings(),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
      setPermissions(perms);
      setSettings(setts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      try {
        await notificationService.initialize();
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Initialization failed');
      }
    };

    init();
  }, [loadData]);

  useEffect(() => {
    const listenerId = `hook_${userId}_${Date.now()}`;

    notificationService.addListener(listenerId, notification => {
      if (notification.userId === userId) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      notificationService.removeListener(listenerId);
    };
  }, [userId]);

  const requestPermissions = useCallback(async () => {
    const perms = await notificationService.requestPermissions();
    setPermissions(perms);
    return perms;
  }, []);

  const registerForPush = useCallback(async (uid: string) => {
    await notificationService.registerForPushNotifications(uid);
  }, []);

  const sendBookingNotification = useCallback(
    async (
      uid: string,
      type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder',
      data: BookingNotificationData
    ) => {
      await notificationService.sendBookingNotification(uid, type, data);
      await loadData();
    },
    [loadData]
  );

  const sendChatNotification = useCallback(
    async (
      uid: string,
      type: 'chat_message' | 'chat_new_conversation',
      data: ChatNotificationData
    ) => {
      await notificationService.sendChatNotification(uid, type, data);
      await loadData();
    },
    [loadData]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await notificationService.markAsRead(userId, notificationId);
      setNotifications(prev =>
        prev.map(item =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
    setUnreadCount(0);
  }, [userId]);

  const clearAll = useCallback(async () => {
    await notificationService.clearNotifications(userId);
    setNotifications([]);
    setUnreadCount(0);
  }, [userId]);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    await notificationService.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  return {
    notifications,
    unreadCount,
    settings,
    permissions,
    loading,
    error,
    requestPermissions,
    registerForPush,
    sendBookingNotification,
    sendChatNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    refresh: loadData,
  };
}
