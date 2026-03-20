import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle, StyleProp } from 'react-native';
import { theme } from '../../../theme';

export interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
    color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    color = 'primary',
    weight,
    align = 'left',
    style,
    children,
    ...props
}) => {
    const colorStyles = {
        primary: styles.colorPrimary,
        secondary: styles.colorSecondary,
        tertiary: styles.colorTertiary,
        inverse: styles.colorInverse,
        link: styles.colorLink,
        error: styles.colorError,
    };
    const weightStyles = {
        normal: styles.weightNormal,
        medium: styles.weightMedium,
        semibold: styles.weightSemibold,
        bold: styles.weightBold,
    };

    const textStyle: StyleProp<TextStyle> = [
        styles.base,
        styles[variant],
        colorStyles[color],
        weight ? weightStyles[weight] : null,
        { textAlign: align },
        style,
    ];

    return (
        <Text style={textStyle} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        fontFamily: theme.typography.fontFamily.regular,
    },
    // Variants
    h1: {
        fontSize: theme.typography.fontSize['4xl'],
        lineHeight: theme.typography.lineHeight['4xl'],
        fontWeight: theme.typography.fontWeight.bold,
    },
    h2: {
        fontSize: theme.typography.fontSize['3xl'],
        lineHeight: theme.typography.lineHeight['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
    },
    h3: {
        fontSize: theme.typography.fontSize['2xl'],
        lineHeight: theme.typography.lineHeight['2xl'],
        fontWeight: theme.typography.fontWeight.semibold,
    },
    h4: {
        fontSize: theme.typography.fontSize.xl,
        lineHeight: theme.typography.lineHeight.xl,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    body: {
        fontSize: theme.typography.fontSize.md,
        lineHeight: theme.typography.lineHeight.md,
    },
    caption: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.sm,
    },
    label: {
        fontSize: theme.typography.fontSize.xs,
        lineHeight: theme.typography.lineHeight.xs,
        fontWeight: theme.typography.fontWeight.medium,
    },
    // Colors
    colorPrimary: {
        color: theme.colors.text.primary,
    },
    colorSecondary: {
        color: theme.colors.text.secondary,
    },
    colorTertiary: {
        color: theme.colors.text.tertiary,
    },
    colorInverse: {
        color: theme.colors.text.inverse,
    },
    colorLink: {
        color: theme.colors.text.link,
    },
    colorError: {
        color: theme.colors.semantic.error,
    },
    // Weights
    weightNormal: {
        fontWeight: theme.typography.fontWeight.normal,
    },
    weightMedium: {
        fontWeight: theme.typography.fontWeight.medium,
    },
    weightSemibold: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    weightBold: {
        fontWeight: theme.typography.fontWeight.bold,
    },
});
