import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    ViewProps,
} from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { theme } from '../../../theme';
import { Typography } from '../base/Typography';

export interface ErrorAlertProps extends ViewProps {
    message: string;
    title?: string;
    onDismiss?: () => void;
    onRetry?: () => void;
    retryLabel?: string;
    dismissLabel?: string;
    style?: ViewStyle;
    showIcon?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
    message,
    title,
    onDismiss,
    onRetry,
    retryLabel = 'Tentar Novamente',
    dismissLabel = 'Descartar',
    style,
    showIcon = true,
    testID,
}) => {
    return (
        <View style={[styles.container, style]} testID={testID}>
            <View style={styles.content}>
                {showIcon && (
                    <AlertCircle
                        size={24}
                        color={theme.colors.semantic.error}
                        style={styles.icon}
                        testID="error-icon"
                    />
                )}
                <View style={styles.textContainer}>
                    {title && (
                        <Typography
                            variant="label"
                            weight="semibold"
                            color="error"
                            style={styles.title}
                        >
                            {title}
                        </Typography>
                    )}
                    <Typography
                        variant="caption"
                        color="primary"
                        style={styles.message}
                    >
                        {message}
                    </Typography>
                </View>
                {onDismiss && (
                    <TouchableOpacity
                        onPress={onDismiss}
                        style={styles.closeButton}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                        <X
                            size={20}
                            color={theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(onRetry || onDismiss) && (
                <View style={styles.actions}>
                    {onRetry && (
                        <TouchableOpacity
                            onPress={onRetry}
                            style={[styles.actionButton, styles.retryButton]}
                        >
                            <Typography
                                variant="label"
                                weight="semibold"
                                color="link"
                            >
                                {retryLabel}
                            </Typography>
                        </TouchableOpacity>
                    )}
                    {onDismiss && (
                        <TouchableOpacity
                            onPress={onDismiss}
                            style={[styles.actionButton, styles.dismissButton]}
                        >
                            <Typography
                                variant="label"
                                weight="semibold"
                                color="secondary"
                            >
                                {dismissLabel}
                            </Typography>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borders.radius.md,
        borderLeftWidth: theme.borders.width.thick,
        borderLeftColor: theme.colors.semantic.error,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    icon: {
        marginRight: theme.spacing.sm,
        marginTop: theme.spacing.xs,
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: theme.spacing.xs,
    },
    message: {
        lineHeight: theme.typography.lineHeight.sm,
    },
    closeButton: {
        marginLeft: theme.spacing.sm,
        padding: theme.spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borders.radius.sm,
    },
    retryButton: {
        backgroundColor: theme.colors.primary[50],
    },
    dismissButton: {
        backgroundColor: theme.colors.background.secondary,
    },
});
