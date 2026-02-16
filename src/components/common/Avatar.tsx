import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { User } from 'lucide-react-native';
import { theme } from '../../themes';

export interface AvatarProps {
    source?: ImageSourcePropType | string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'circle' | 'rounded' | 'square';
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
    source,
    name,
    size = 'md',
    variant = 'circle',
    style,
}) => {
    const getInitials = (name?: string) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const sizeValue = sizeMap[size];
    const iconSize = iconSizeMap[size];
    const fontSize = fontSizeMap[size];

    const containerStyle = [
        styles.container,
        { width: sizeValue, height: sizeValue },
        variant === 'circle' && styles.circle,
        variant === 'rounded' && styles.rounded,
        variant === 'square' && styles.square,
        style,
    ];

    const imageSource = typeof source === 'string' ? { uri: source } : source;

    return (
        <View style={containerStyle}>
            {imageSource ? (
                <Image source={imageSource} style={styles.image} />
            ) : name ? (
                <Text style={[styles.initials, { fontSize }]}>
                    {getInitials(name)}
                </Text>
            ) : (
                <User color={theme.colors.text.tertiary} size={iconSize} />
            )}
        </View>
    );
};

const sizeMap = {
    xs: theme.scaleUtils.moderateScale(24),
    sm: theme.scaleUtils.moderateScale(32),
    md: theme.scaleUtils.moderateScale(40),
    lg: theme.scaleUtils.moderateScale(56),
    xl: theme.scaleUtils.moderateScale(80),
};

const iconSizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 40,
};

const fontSizeMap = {
    xs: theme.typography.fontSize.xs,
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.md,
    lg: theme.typography.fontSize.xl,
    xl: theme.typography.fontSize['3xl'],
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    circle: {
        borderRadius: theme.borders.radius.full,
    },
    rounded: {
        borderRadius: theme.borders.radius.md,
    },
    square: {
        borderRadius: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initials: {
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.semibold,
    },
});
