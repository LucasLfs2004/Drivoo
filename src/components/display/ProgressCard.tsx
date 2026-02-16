import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Typography, Badge } from '../common';
import { theme } from '../../themes';

interface ProgressCardProps {
    completedLessons: number;
    totalLessons: number;
    practiceHours: number;
    category?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    completedLessons,
    totalLessons,
    practiceHours,
    category = 'Categoria B',
}) => {
    const progress = (completedLessons / totalLessons) * 100;

    return (
        <Card variant="elevated" padding="md" style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h4">Progresso da CNH</Typography>
                <Badge variant="primary" size="sm">{category}</Badge>
            </View>

            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Typography variant="caption" color="secondary" style={styles.progressText}>
                    {Math.round(progress)}% concluído
                </Typography>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Typography variant="caption" color="secondary">
                        Aulas Concluídas
                    </Typography>
                    <Typography variant="h3" color="primary">
                        {completedLessons}/{totalLessons}
                    </Typography>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <Typography variant="caption" color="secondary">
                        Horas de Prática
                    </Typography>
                    <Typography variant="h3" color="primary">
                        {practiceHours}h
                    </Typography>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    progressBarContainer: {
        marginBottom: theme.spacing.lg,
    },
    progressBarBackground: {
        height: theme.scaleUtils.moderateScale(8),
        backgroundColor: theme.colors.neutral[200],
        borderRadius: theme.borders.radius.full,
        overflow: 'hidden',
        marginBottom: theme.spacing.xs,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borders.radius.full,
    },
    progressText: {
        textAlign: 'right',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: theme.borders.width.base,
        height: theme.scaleUtils.moderateScale(40),
        backgroundColor: theme.colors.border.medium,
    },
});
