import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '../../themes';

export interface IconButtonProps {
    icon: LucideIcon;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    onPress,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    style,
}) => {
    const buttonStyle = [
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const iconColor = disabled
        ? theme.colors.text.disabled
        : variant === 'primary'
            ? theme.colors.text.inverse
            : variant === 'secondary'
                ? theme.colors.text.inverse
                : theme.colors.primary[500];

    const iconSize = iconSizeMap[size];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Icon color={iconColor} size={iconSize} />
        </TouchableOpacity>
    );
};

const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
};

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borders.radius.md,
    },
    // Variants
    primary: {
        backgroundColor: theme.colors.primary[500],
    },
    secondary: {
        backgroundColor: theme.colors.secondary[500],
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: theme.borders.width.base,
        borderColor: theme.colors.border.medium,
    },
    // Sizes
    sm: {
        width: theme.scaleUtils.moderateScale(32),
        height: theme.scaleUtils.moderateScale(32),
    },
    md: {
        width: theme.scaleUtils.moderateScale(40),
        height: theme.scaleUtils.moderateScale(40),
    },
    lg: {
        width: theme.scaleUtils.moderateScale(48),
        height: theme.scaleUtils.moderateScale(48),
    },
    // States
    disabled: {
        opacity: 0.5,
    },
});
