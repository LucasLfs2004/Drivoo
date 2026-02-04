import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../themes';

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
  showLabels?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
  variant = 'primary',
  showLabels = true,
}) => {
  const renderBadge = (badge?: number) => {
    if (!badge || badge <= 0) return null;
    
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {badge > 99 ? '99+' : badge.toString()}
        </Text>
      </View>
    );
  };

  const renderTab = (tab: TabItem) => {
    const isActive = tab.key === activeTab;
    const isDisabled = tab.disabled;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          isActive && styles.activeTab,
          isDisabled && styles.disabledTab,
        ]}
        onPress={() => !isDisabled && onTabPress(tab.key)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          {tab.icon && (
            <View style={styles.iconContainer}>
              <Text style={[
                styles.tabIcon,
                isActive && styles.activeTabIcon,
                isDisabled && styles.disabledTabIcon,
              ]}>
                {tab.icon}
              </Text>
              {renderBadge(tab.badge)}
            </View>
          )}
          
          {showLabels && (
            <Text style={[
              styles.tabLabel,
              isActive && styles.activeTabLabel,
              isDisabled && styles.disabledTabLabel,
            ]}>
              {tab.label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      variant === 'secondary' && styles.secondaryContainer,
      style
    ]}>
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: theme.borders.width.thin,
    borderTopColor: theme.colors.border.light,
    paddingBottom: theme.scaleUtils.isTablet ? theme.spacing.md : theme.spacing.sm,
    ...theme.shadows.md,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderTopColor: theme.colors.border.medium,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borders.radius.md,
    minHeight: theme.scaleUtils.moderateScale(48),
  },
  activeTab: {
    backgroundColor: theme.colors.primary[50],
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  tabIcon: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
  },
  activeTabIcon: {
    color: theme.colors.primary[500],
  },
  disabledTabIcon: {
    color: theme.colors.text.disabled,
  },
  tabLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  disabledTabLabel: {
    color: theme.colors.text.disabled,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: theme.borders.radius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
});