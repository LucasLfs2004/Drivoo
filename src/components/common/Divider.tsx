import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../themes';

export interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    thickness?: 'thin' | 'base' | 'thick';
    color?: 'light' | 'medium' | 'strong';
    spacing?: keyof typeof theme.spacing;
    style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    thickness = 'base',
    color = 'medium',
    spacing = 'md',
    style,
}) => {
    const dividerStyle = [
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        styles[`${thickness}${orientation === 'horizontal' ? 'Height' : 'Width'}`],
        styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`],
        orientation === 'horizontal'
            ? { marginVertical: theme.spacing[spacing] }
            : { marginHorizontal: theme.spacing[spacing] },
        style,
    ];

    return <View style={dividerStyle} />;
};

const styles = StyleSheet.create({
    base: {},
    horizontal: {
        width: '100%',
    },
    vertical: {
        height: '100%',
    },
    // Thickness - Horizontal
    thinHeight: {
        height: theme.borders.width.thin,
    },
    baseHeight: {
        height: theme.borders.width.base,
    },
    thickHeight: {
        height: theme.borders.width.thick,
    },
    // Thickness - Vertical
    thinWidth: {
        width: theme.borders.width.thin,
    },
    baseWidth: {
        width: theme.borders.width.base,
    },
    thickWidth: {
        width: theme.borders.width.thick,
    },
    // Colors
    colorLight: {
        backgroundColor: theme.colors.border.light,
    },
    colorMedium: {
        backgroundColor: theme.colors.border.medium,
    },
    colorStrong: {
        backgroundColor: theme.colors.border.strong,
    },
});
