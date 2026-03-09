import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { theme } from '@/themes';
import { Typography } from '@/components/common';

interface LessonCounterProps {
    count: number;
    isEditing: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
    onToggleEdit: () => void;
    maxLessons: number;
}

export const LessonCounter: React.FC<LessonCounterProps> = ({
    count,
    isEditing,
    onIncrement,
    onDecrement,
    onToggleEdit,
    maxLessons,
}) => {
    const canDecrement = count > 0;
    const canIncrement = count < maxLessons;

    if (!isEditing) {
        return (
            <TouchableOpacity
                onPress={onToggleEdit}
                style={styles.displayContainer}
                activeOpacity={0.7}
            >
                <Typography variant="h3" weight="bold" color="primary">
                    {count}
                </Typography>
                <Typography variant="caption" color="secondary">
                    aulas
                </Typography>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.editContainer}>
            <TouchableOpacity
                onPress={onDecrement}
                disabled={!canDecrement}
                style={[
                    styles.button,
                    !canDecrement && styles.buttonDisabled,
                ]}
                activeOpacity={0.7}
            >
                <Minus
                    size={20}
                    color={canDecrement ? theme.colors.primary[500] : theme.colors.text.disabled}
                />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onToggleEdit}
                style={styles.countContainer}
                activeOpacity={0.7}
            >
                <Typography variant="h3" weight="bold" color="primary">
                    {count}
                </Typography>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onIncrement}
                disabled={!canIncrement}
                style={[
                    styles.button,
                    !canIncrement && styles.buttonDisabled,
                ]}
                activeOpacity={0.7}
            >
                <Plus
                    size={20}
                    color={canIncrement ? theme.colors.primary[500] : theme.colors.text.disabled}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    displayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: theme.borders.radius.full,
        backgroundColor: theme.colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: theme.borders.width.base,
        borderColor: theme.colors.border.medium,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    countContainer: {
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
