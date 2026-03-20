import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../../theme';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    style,
}) => {
    return (
        <View style={[styles.base, styles[variant], styles[size], style]}>
            <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
                {children}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.borders.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    // Variants
    primary: {
        backgroundColor: theme.colors.primary[100],
    },
    secondary: {
        backgroundColor: theme.colors.secondary[100],
    },
    success: {
        backgroundColor: theme.colors.success[100],
    },
    warning: {
        backgroundColor: theme.colors.warning[100],
    },
    error: {
        backgroundColor: '#FFEBEE',
    },
    neutral: {
        backgroundColor: theme.colors.neutral[200],
    },
    // Sizes
    sm: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs / 2,
        minHeight: theme.scaleUtils.moderateScale(20),
    },
    md: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minHeight: theme.scaleUtils.moderateScale(24),
    },
    lg: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: theme.scaleUtils.moderateScale(32),
    },
    // Text styles
    text: {
        fontWeight: theme.typography.fontWeight.medium,
    },
    primaryText: {
        color: theme.colors.primary[700],
    },
    secondaryText: {
        color: theme.colors.secondary[700],
    },
    successText: {
        color: theme.colors.success[700],
    },
    warningText: {
        color: theme.colors.warning[700],
    },
    errorText: {
        color: theme.colors.semantic.error,
    },
    neutralText: {
        color: theme.colors.neutral[700],
    },
    smText: {
        fontSize: theme.typography.fontSize.xs,
    },
    mdText: {
        fontSize: theme.typography.fontSize.sm,
    },
    lgText: {
        fontSize: theme.typography.fontSize.md,
    },
});
