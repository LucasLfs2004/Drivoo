/**
 * Notification List Screen
 * 
 * Displays all notifications for the user
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationData } from '../../types/notification';
import { colors, spacing, typography } from '../../themes/variables';

export function NotificationListScreen() {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh,
  } = useNotificationContext();

  const handleNotificationPress = async (notification: NotificationData) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking_new':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_reminder':
        // Navigate to bookings screen
        navigation.navigate('AlunoBookings' as never);
        break;
      case 'chat_message':
      case 'chat_new_conversation':
        // Navigate to chat screen
        navigation.navigate('ChatList' as never);
        break;
      default:
        break;
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => {
    const isUnread = !item.read;
    const timestamp = new Date(item.timestamp);
    const timeString = formatTimestamp(timestamp);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.title, isUnread && styles.unreadText]}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.timestamp}>{timeString}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma notificação</Text>
      <Text style={styles.emptySubtext}>
        Você receberá notificações sobre agendamentos e mensagens aqui
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (notifications.length === 0) {
      return null;
    }

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notificações {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.headerButtonText}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={[styles.headerButton, styles.clearButton]}
              onPress={clearAll}
            >
              <Text style={[styles.headerButtonText, styles.clearButtonText]}>
                Limpar tudo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : undefined
        }
      />
    </View>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Agora';
  } else if (diffMins < 60) {
    return `${diffMins}m atrás`;
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`;
  } else if (diffDays < 7) {
    return `${diffDays}d atrás`;
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    backgroundColor: colors.neutral[0],
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.primary[50],
  },
  headerButtonText: {
    ...typography.small,
    color: colors.primary[700],
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.error[50],
  },
  clearButtonText: {
    color: colors.error[700],
  },
  notificationItem: {
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  unreadItem: {
    backgroundColor: colors.primary[50],
  },
  notificationContent: {
    padding: spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
    color: colors.neutral[900],
    flex: 1,
  },
  unreadText: {
    color: colors.primary[900],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...typography.small,
    color: colors.neutral[500],
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
