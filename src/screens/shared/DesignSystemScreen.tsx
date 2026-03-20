import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
    Typography,
    Button,
    Card,
    Badge,
    Divider,
    Avatar,
    IconButton,
} from '../../shared/ui/base';
import { Home, Heart, Settings, Bell } from 'lucide-react-native';
import { theme } from '../../themes';

export const DesignSystemScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Typography Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Typography
                </Typography>
                <Divider spacing="sm" />

                <Typography variant="h1">Heading 1</Typography>
                <Typography variant="h2">Heading 2</Typography>
                <Typography variant="h3">Heading 3</Typography>
                <Typography variant="h4">Heading 4</Typography>
                <Typography variant="body">Body text - Regular paragraph</Typography>
                <Typography variant="caption" color="secondary">
                    Caption text - Secondary information
                </Typography>
                <Typography variant="label" color="tertiary">
                    LABEL TEXT
                </Typography>
            </Card>

            {/* Colors Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Colors
                </Typography>
                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Brand Colors
                </Typography>
                <View style={styles.colorGrid}>
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.primary[500] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary[500] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.accent[500] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.success[500] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.semantic.warning }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.semantic.error }]} />
                </View>

                <Typography variant="caption" color="secondary" style={styles.colorLabels}>
                    Primary • Secondary • Accent • Success • Warning • Error
                </Typography>

                <Divider spacing="md" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Cool Gray Palette (#EBEEF1)
                </Typography>
                <View style={styles.colorGrid}>
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[50] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[100] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[200] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[300] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[400] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[500] }]} />
                </View>
                <View style={styles.colorGrid}>
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[600] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[700] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[800] }]} />
                    <View style={[styles.colorBox, { backgroundColor: theme.colors.coolGray[900] }]} />
                </View>

                <Typography variant="caption" color="secondary" style={styles.colorLabels}>
                    50 • 100 • 200 (base) • 300 • 400 • 500 • 600 • 700 • 800 • 900
                </Typography>
            </Card>

            {/* Buttons Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Buttons
                </Typography>
                <Divider spacing="sm" />

                <View style={styles.buttonRow}>
                    <Button title="Primary" variant="primary" size="md" onPress={() => { }} />
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Secondary" variant="secondary" size="md" onPress={() => { }} />
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Outline" variant="outline" size="md" onPress={() => { }} />
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Ghost" variant="ghost" size="md" onPress={() => { }} />
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Sizes
                </Typography>
                <View style={styles.buttonRow}>
                    <Button title="Small" variant="primary" size="sm" onPress={() => { }} />
                    <Button title="Medium" variant="primary" size="md" onPress={() => { }} />
                    <Button title="Large" variant="primary" size="lg" onPress={() => { }} />
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    States
                </Typography>
                <View style={styles.buttonRow}>
                    <Button title="Disabled" variant="primary" disabled onPress={() => { }} />
                    <Button title="Loading" variant="primary" loading onPress={() => { }} />
                </View>
            </Card>

            {/* Icon Buttons Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Icon Buttons
                </Typography>
                <Divider spacing="sm" />

                <View style={styles.iconButtonRow}>
                    <IconButton icon={Home} variant="primary" onPress={() => { }} />
                    <IconButton icon={Heart} variant="secondary" onPress={() => { }} />
                    <IconButton icon={Settings} variant="outline" onPress={() => { }} />
                    <IconButton icon={Bell} variant="ghost" onPress={() => { }} />
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Sizes
                </Typography>
                <View style={styles.iconButtonRow}>
                    <IconButton icon={Home} size="sm" onPress={() => { }} />
                    <IconButton icon={Home} size="md" onPress={() => { }} />
                    <IconButton icon={Home} size="lg" onPress={() => { }} />
                </View>
            </Card>

            {/* Badges Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Badges
                </Typography>
                <Divider spacing="sm" />

                <View style={styles.badgeRow}>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Sizes
                </Typography>
                <View style={styles.badgeRow}>
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                </View>
            </Card>

            {/* Avatars Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Avatars
                </Typography>
                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    With Initials
                </Typography>
                <View style={styles.avatarRow}>
                    <Avatar name="João Silva" size="xs" />
                    <Avatar name="Maria Santos" size="sm" />
                    <Avatar name="Pedro Costa" size="md" />
                    <Avatar name="Ana Lima" size="lg" />
                    <Avatar name="Carlos Souza" size="xl" />
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Variants
                </Typography>
                <View style={styles.avatarRow}>
                    <Avatar name="JS" variant="circle" size="lg" />
                    <Avatar name="MS" variant="rounded" size="lg" />
                    <Avatar name="PC" variant="square" size="lg" />
                </View>

                <Divider spacing="sm" />

                <Typography variant="caption" color="secondary" style={styles.subsectionTitle}>
                    Without Image
                </Typography>
                <View style={styles.avatarRow}>
                    <Avatar size="md" />
                    <Avatar size="lg" />
                </View>
            </Card>

            {/* Cards Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Cards
                </Typography>
                <Divider spacing="sm" />

                <Card variant="elevated" padding="md" style={styles.cardExample}>
                    <Typography variant="body" weight="semibold">Elevated Card</Typography>
                    <Typography variant="caption" color="secondary">
                        With shadow elevation
                    </Typography>
                </Card>

                <Card variant="outlined" padding="md" style={styles.cardExample}>
                    <Typography variant="body" weight="semibold">Outlined Card</Typography>
                    <Typography variant="caption" color="secondary">
                        With border
                    </Typography>
                </Card>

                <Card variant="filled" padding="md" style={styles.cardExample}>
                    <Typography variant="body" weight="semibold">Filled Card</Typography>
                    <Typography variant="caption" color="secondary">
                        With background color
                    </Typography>
                </Card>
            </Card>

            {/* Spacing Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Spacing Scale
                </Typography>
                <Divider spacing="sm" />

                <View style={styles.spacingExample}>
                    <View style={[styles.spacingBox, { width: theme.spacing.xs }]} />
                    <Typography variant="caption">xs (4px)</Typography>
                </View>
                <View style={styles.spacingExample}>
                    <View style={[styles.spacingBox, { width: theme.spacing.sm }]} />
                    <Typography variant="caption">sm (8px)</Typography>
                </View>
                <View style={styles.spacingExample}>
                    <View style={[styles.spacingBox, { width: theme.spacing.md }]} />
                    <Typography variant="caption">md (16px)</Typography>
                </View>
                <View style={styles.spacingExample}>
                    <View style={[styles.spacingBox, { width: theme.spacing.lg }]} />
                    <Typography variant="caption">lg (24px)</Typography>
                </View>
                <View style={styles.spacingExample}>
                    <View style={[styles.spacingBox, { width: theme.spacing.xl }]} />
                    <Typography variant="caption">xl (32px)</Typography>
                </View>
            </Card>

            {/* Border Radius Section */}
            <Card style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Border Radius
                </Typography>
                <Divider spacing="sm" />

                <View style={styles.radiusRow}>
                    <View style={[styles.radiusBox, { borderRadius: theme.borders.radius.sm }]}>
                        <Typography variant="caption">sm</Typography>
                    </View>
                    <View style={[styles.radiusBox, { borderRadius: theme.borders.radius.md }]}>
                        <Typography variant="caption">md</Typography>
                    </View>
                    <View style={[styles.radiusBox, { borderRadius: theme.borders.radius.lg }]}>
                        <Typography variant="caption">lg</Typography>
                    </View>
                    <View style={[styles.radiusBox, { borderRadius: theme.borders.radius.xl }]}>
                        <Typography variant="caption">xl</Typography>
                    </View>
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.secondary,
    },
    content: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        marginBottom: theme.spacing.sm,
    },
    subsectionTitle: {
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.xs,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginVertical: theme.spacing.sm,
    },
    colorBox: {
        width: theme.scaleUtils.moderateScale(48),
        height: theme.scaleUtils.moderateScale(48),
        borderRadius: theme.borders.radius.md,
    },
    colorLabels: {
        marginTop: theme.spacing.xs,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        flexWrap: 'wrap',
    },
    iconButtonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginVertical: theme.spacing.sm,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginVertical: theme.spacing.sm,
        flexWrap: 'wrap',
    },
    avatarRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginVertical: theme.spacing.sm,
        alignItems: 'center',
    },
    cardExample: {
        marginBottom: theme.spacing.sm,
    },
    spacingExample: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    spacingBox: {
        height: theme.spacing.md,
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borders.radius.sm,
    },
    radiusRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginVertical: theme.spacing.sm,
        flexWrap: 'wrap',
    },
    radiusBox: {
        width: theme.scaleUtils.moderateScale(64),
        height: theme.scaleUtils.moderateScale(64),
        backgroundColor: theme.colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
});
