import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../themes';

export interface ChatBubbleProps {
  id: string;
  message: string;
  timestamp: Date;
  isOwn: boolean; // true se a mensagem é do usuário atual
  senderName?: string;
  messageType?: 'text' | 'image' | 'location' | 'system';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  id,
  message,
  timestamp,
  isOwn,
  senderName,
  messageType = 'text',
  status = 'sent',
  onPress,
  onLongPress,
  style,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (messageType) {
      case 'image':
        return (
          <View style={styles.imageMessage}>
            <Text style={styles.imageIcon}>🖼️</Text>
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
              Imagem
            </Text>
          </View>
        );
      case 'location':
        return (
          <View style={styles.locationMessage}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
              Localização compartilhada
            </Text>
          </View>
        );
      case 'system':
        return (
          <Text style={styles.systemMessageText}>
            {message}
          </Text>
        );
      default:
        return (
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {message}
          </Text>
        );
    }
  };

  if (messageType === 'system') {
    return (
      <View style={[styles.systemBubbleContainer, style]}>
        <View style={styles.systemBubble}>
          {renderMessageContent()}
          <Text style={styles.systemTimestamp}>
            {formatTime(timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.bubbleContainer,
      isOwn ? styles.ownBubbleContainer : styles.otherBubbleContainer,
      style
    ]}>
      {!isOwn && senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        {renderMessageContent()}
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(timestamp)}
          </Text>
          
          {isOwn && (
            <Text style={[
              styles.statusIcon,
              status === 'read' && styles.readStatusIcon
            ]}>
              {getStatusIcon()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
  },
  ownBubbleContainer: {
    alignItems: 'flex-end',
  },
  otherBubbleContainer: {
    alignItems: 'flex-start',
  },
  systemBubbleContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  senderName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.lg,
    ...theme.shadows.sm,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary[500],
    borderBottomRightRadius: theme.borders.radius.sm,
  },
  otherBubble: {
    backgroundColor: theme.colors.background.elevated,
    borderBottomLeftRadius: theme.borders.radius.sm,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  systemBubble: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
  },
  ownMessageText: {
    color: theme.colors.text.inverse,
  },
  otherMessageText: {
    color: theme.colors.text.primary,
  },
  systemMessageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  imageMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.sm,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.sm,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
  },
  ownTimestamp: {
    color: theme.colors.primary[100],
  },
  otherTimestamp: {
    color: theme.colors.text.tertiary,
  },
  systemTimestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  statusIcon: {
    fontSize: theme.typography.fontSize.xs,
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary[100],
  },
  readStatusIcon: {
    color: theme.colors.semantic.success,
  },
});