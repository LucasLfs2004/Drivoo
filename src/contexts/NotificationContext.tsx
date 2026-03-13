/**
 * Notification Context
 * 
 * Provides notification functionality throughout the app
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications, UseNotificationsResult } from '../hooks/useNotifications';
import { useAuth } from './AuthContext';

interface NotificationContextValue extends UseNotificationsResult {
  initialized: boolean;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { usuario } = useAuth();
  const userId = usuario?.id || '';
  
  const notificationState = useNotifications(userId);

  // Auto-register for push notifications when user logs in
  useEffect(() => {
    if (usuario?.id && notificationState.permissions?.granted) {
      notificationState.registerForPush(usuario.id).catch(err => {
        console.error('[NotificationProvider] Auto-register failed:', err);
      });
    }
  }, [usuario?.id, notificationState.permissions?.granted]);

  const value: NotificationContextValue = {
    ...notificationState,
    initialized: !notificationState.loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider'
    );
  }
  return context;
}
