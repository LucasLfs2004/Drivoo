import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { theme } from '../../../theme';

export interface HeaderAction {
  icon: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

export interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  onTitlePress?: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'transparent' | 'elevated';
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  onTitlePress,
  style,
  variant = 'primary',
  showBackButton = false,
  onBackPress,
}) => {
  const renderBadge = (badge?: number) => {
    if (!badge || badge <= 0) return null;
    
    return (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>
          {badge > 99 ? '99+' : badge.toString()}
        </Text>
      </View>
    );
  };

  const renderAction = (action: HeaderAction, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.actionButton,
        action.disabled && styles.disabledAction,
      ]}
      onPress={action.onPress}
      disabled={action.disabled}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <Text style={[
          styles.actionIcon,
          action.disabled && styles.disabledActionIcon,
        ]}>
          {action.icon}
        </Text>
        {renderBadge(action.badge)}
      </View>
    </TouchableOpacity>
  );

  const renderLeftSection = () => {
    if (showBackButton && onBackPress) {
      return (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      );
    }

    if (leftAction) {
      return renderAction(leftAction, -1);
    }

    return <View style={styles.leftPlaceholder} />;
  };

  const renderTitle = () => {
    if (!title) return null;

    const TitleComponent = onTitlePress ? TouchableOpacity : View;

    return (
      <TitleComponent
        style={styles.titleContainer}
        onPress={onTitlePress}
        activeOpacity={onTitlePress ? 0.7 : 1}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </TitleComponent>
    );
  };

  const renderRightSection = () => {
    if (rightActions.length === 0) {
      return <View style={styles.rightPlaceholder} />;
    }

    return (
      <View style={styles.rightActions}>
        {rightActions.map(renderAction)}
      </View>
    );
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'transparent':
        return styles.transparentContainer;
      case 'elevated':
        return styles.elevatedContainer;
      default:
        return styles.primaryContainer;
    }
  };

  return (
    <>
      <StatusBar
        barStyle={variant === 'transparent' ? 'light-content' : 'dark-content'}
        backgroundColor={variant === 'transparent' ? 'transparent' : theme.colors.background.primary}
        translucent={variant === 'transparent'}
      />
      <View style={[
        styles.container,
        getContainerStyle(),
        style
      ]}>
        <View style={styles.content}>
          {renderLeftSection()}
          {renderTitle()}
          {renderRightSection()}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.scaleUtils.moderateScale(44), // Status bar height
  },
  primaryContainer: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: theme.borders.width.thin,
    borderBottomColor: theme.colors.border.light,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  elevatedContainer: {
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: theme.scaleUtils.moderateScale(56),
  },
  leftPlaceholder: {
    width: theme.scaleUtils.moderateScale(40),
  },
  rightPlaceholder: {
    width: theme.scaleUtils.moderateScale(40),
  },
  backButton: {
    width: theme.scaleUtils.moderateScale(40),
    height: theme.scaleUtils.moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borders.radius.full,
  },
  backIcon: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: theme.scaleUtils.moderateScale(40),
    height: theme.scaleUtils.moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borders.radius.full,
    marginLeft: theme.spacing.xs,
  },
  disabledAction: {
    opacity: 0.5,
  },
  actionContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  disabledActionIcon: {
    color: theme.colors.text.disabled,
  },
  actionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: theme.borders.radius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  actionBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
});