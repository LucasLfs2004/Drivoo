/**
 * useNotifications Hook
 * 
 * React hook for managing notifications in components
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import {
  NotificationData,
  NotificationSettings,
  NotificationPermissionStatus,
  BookingNotificationData,
  ChatNotificationData,
} from '../types/notification';

export interface UseNotificationsResult {
  notifications: NotificationData[];
  unreadCount: number;
  settings: NotificationSettings | null;
  permissions: NotificationPermissionStatus | null;
  loading: boolean;
  error: string | null;
  
  // Actions
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

  // Load initial data
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
      console.error('[useNotifications] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initialize and load data
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

  // Listen for new notifications
  useEffect(() => {
    const listenerId = `hook_${userId}_${Date.now()}`;
    
    notificationService.addListener(listenerId, (notification) => {
      if (notification.userId === userId) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      notificationService.removeListener(listenerId);
    };
  }, [userId]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      const perms = await notificationService.requestPermissions();
      setPermissions(perms);
      return perms;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission request failed');
      throw err;
    }
  }, []);

  // Register for push notifications
  const registerForPush = useCallback(async (uid: string) => {
    try {
      await notificationService.registerForPushNotifications(uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push registration failed');
      throw err;
    }
  }, []);

  // Send booking notification
  const sendBookingNotification = useCallback(
    async (
      uid: string,
      type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder',
      data: BookingNotificationData
    ) => {
      try {
        await notificationService.sendBookingNotification(uid, type, data);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Send notification failed');
        throw err;
      }
    },
    [loadData]
  );

  // Send chat notification
  const sendChatNotification = useCallback(
    async (
      uid: string,
      type: 'chat_message' | 'chat_new_conversation',
      data: ChatNotificationData
    ) => {
      try {
        await notificationService.sendChatNotification(uid, type, data);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Send notification failed');
        throw err;
      }
    },
    [loadData]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(userId, notificationId);
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Mark as read failed');
        throw err;
      }
    },
    [userId]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mark all as read failed');
      throw err;
    }
  }, [userId]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clear notifications failed');
      throw err;
    }
  }, [userId]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await notificationService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update settings failed');
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

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
    refresh,
  };
}
