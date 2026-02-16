import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Typography, Badge, Avatar, Divider, Button } from '../common';
import { Calendar, MapPin, Car, Star } from 'lucide-react-native';
import { theme } from '../../themes';

interface EnhancedLessonCardProps {
    instructorName: string;
    instructorAvatar?: string;
    rating: number;
    totalLessons: number;
    date: string;
    time: string;
    location: string;
    lessonType: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    onViewRoute?: () => void;
    onViewDetails?: () => void;
}

export const EnhancedLessonCard: React.FC<EnhancedLessonCardProps> = ({
    instructorName,
    instructorAvatar,
    rating,
    totalLessons,
    date,
    time,
    location,
    lessonType,
    status,
    onViewRoute,
    onViewDetails,
}) => {
    const statusVariant = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'error',
    }[status] as 'success' | 'warning' | 'error';

    const statusLabel = {
        confirmed: 'Confirmada',
        pending: 'Pendente',
        cancelled: 'Cancelada',
    }[status];

    return (
        <Card variant="elevated" padding="md" style={styles.container}>
            <View style={styles.statusBadge}>
                <Badge variant={statusVariant} size="sm">
                    {statusLabel}
                </Badge>
            </View>

            <View style={styles.header}>
                <Avatar
                    name={instructorName}
                    source={instructorAvatar ? { uri: instructorAvatar } : undefined}
                    size="lg"
                />
                <View style={styles.instructorInfo}>
                    <Typography variant="h4">{instructorName}</Typography>
                    <View style={styles.ratingRow}>
                        <Star
                            color={theme.colors.warning[500]}
                            size={16}
                            fill={theme.colors.warning[500]}
                        />
                        <Typography variant="caption" color="secondary">
                            {rating.toFixed(1)} • {totalLessons} aulas
                        </Typography>
                    </View>
                </View>
            </View>

            <Divider spacing="md" />

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Calendar color={theme.colors.primary[500]} size={20} />
                    <View style={styles.detailText}>
                        <Typography variant="caption" color="secondary">
                            Data e Horário
                        </Typography>
                        <Typography variant="body" weight="medium">
                            {date} às {time}
                        </Typography>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <MapPin color={theme.colors.primary[500]} size={20} />
                    <View style={styles.detailText}>
                        <Typography variant="caption" color="secondary">
                            Local de Encontro
                        </Typography>
                        <Typography variant="body" weight="medium">
                            {location}
                        </Typography>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Car color={theme.colors.primary[500]} size={20} />
                    <View style={styles.detailText}>
                        <Typography variant="caption" color="secondary">
                            Tipo de Aula
                        </Typography>
                        <Typography variant="body" weight="medium">
                            {lessonType}
                        </Typography>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <Button
                    title="Ver Rota"
                    variant="outline"
                    size="sm"
                    style={styles.actionButton}
                    onPress={onViewRoute}
                />
                <Button
                    title="Detalhes"
                    variant="primary"
                    size="sm"
                    style={styles.actionButton}
                    onPress={onViewDetails}
                />
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    statusBadge: {
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    instructorInfo: {
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginTop: theme.spacing.xs,
    },
    details: {
        gap: theme.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    detailText: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    actionButton: {
        flex: 1,
    },
});
