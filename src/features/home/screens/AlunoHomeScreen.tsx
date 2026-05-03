import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  Car,
  ChevronRight,
  Clock,
  GraduationCap,
  MapPin,
  Search,
  Star,
  Users,
} from 'lucide-react-native';
import { Avatar, Badge, Button, Card, Divider, Typography } from '../../../shared/ui/base';
import { theme } from '../../../theme';
import type { AlunoHomeStackParamList } from '../../../types/navigation';
import { HomeHeader } from '../components/HomeHeader';
import { useStudentDashboardQuery } from '../hooks/useStudentDashboardQuery';
import type {
  StudentDashboard,
  StudentDashboardLessonStatus,
  StudentDashboardNextLesson,
} from '../types/domain';

type NavigationProp = NativeStackNavigationProp<AlunoHomeStackParamList>;
type IconComponent = React.ComponentType<{ color: string; size: number }>;

const formatDate = (date: Date | null): string => {
  if (!date) {
    return 'Data a confirmar';
  }

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
};

const formatTime = (date: Date | null): string => {
  if (!date) {
    return '--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTransmission = (transmission?: string): string => {
  if (!transmission) {
    return 'Câmbio a confirmar';
  }

  const normalized = transmission.toLowerCase().replace('_', ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getStatusPresentation = (status: StudentDashboardLessonStatus) => {
  if (status === 'confirmed') {
    return { label: 'Confirmada', variant: 'success' as const };
  }

  if (status === 'scheduled') {
    return { label: 'Agendada', variant: 'warning' as const };
  }

  return { label: 'Em análise', variant: 'neutral' as const };
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  helper?: string;
}) => (
  <Card variant="outlined" padding="md" style={styles.metricCard}>
    <View style={styles.metricIcon}>
      <Icon color={theme.colors.primary[500]} size={20} />
    </View>
    <Typography variant="h4" style={styles.metricValue}>
      {value}
    </Typography>
    <Typography variant="caption" color="secondary">
      {label}
    </Typography>
    {helper ? (
      <Typography variant="label" color="tertiary" style={styles.metricHelper}>
        {helper}
      </Typography>
    ) : null}
  </Card>
);

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Icon color={theme.colors.primary[500]} size={18} />
    </View>
    <View style={styles.detailContent}>
      <Typography variant="label" color="secondary">
        {label}
      </Typography>
      <Typography variant="body" weight="medium">
        {value}
      </Typography>
    </View>
  </View>
);

const NextLessonCard = ({
  lesson,
  onViewDetails,
  onViewBookings,
}: {
  lesson: StudentDashboardNextLesson;
  onViewDetails: () => void;
  onViewBookings: () => void;
}) => {
  const status = getStatusPresentation(lesson.status);

  return (
    <Card variant="elevated" padding="md" style={styles.sectionCard}>
      <View style={styles.cardHeader}>
        <View>
          <Typography variant="label" color="secondary">
            Próxima aula
          </Typography>
          <Typography variant="h4">Seu próximo compromisso</Typography>
        </View>
        <Badge variant={status.variant} size="sm">
          {status.label}
        </Badge>
      </View>

      <View style={styles.instructorRow}>
        <Avatar
          name={lesson.instructor.fullName}
          source={lesson.instructor.avatarUrl}
          size="lg"
        />
        <View style={styles.instructorText}>
          <Typography variant="body" weight="semibold">
            {lesson.instructor.fullName}
          </Typography>
          <Typography variant="caption" color="secondary">
            Aula prática
          </Typography>
        </View>
      </View>

      <Divider spacing="md" />

      <View style={styles.detailsList}>
        <DetailRow
          icon={CalendarDays}
          label="Data e horário"
          value={`${formatDate(lesson.startAt)} às ${formatTime(lesson.startAt)} - ${formatTime(lesson.endAt)}`}
        />
        <DetailRow icon={MapPin} label="Local de encontro" value={lesson.address.full} />
        <DetailRow
          icon={Car}
          label="Veículo"
          value={`${lesson.vehicle.model} - ${formatTransmission(lesson.vehicle.transmission)}`}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Minhas aulas"
          variant="outline"
          size="sm"
          icon={CalendarDays}
          style={styles.actionButton}
          onPress={onViewBookings}
        />
        <Button
          title="Instrutor"
          variant="primary"
          size="sm"
          icon={ChevronRight}
          iconPosition="right"
          style={styles.actionButton}
          disabled={!lesson.instructor.id}
          onPress={onViewDetails}
        />
      </View>
    </Card>
  );
};

const EmptyNextLessonCard = ({ onSearch }: { onSearch: () => void }) => (
  <Card variant="filled" padding="md" style={styles.sectionCard}>
    <View style={styles.emptyLessonIcon}>
      <CalendarDays color={theme.colors.primary[500]} size={26} />
    </View>
    <Typography variant="h4" align="center">
      Nenhuma aula futura
    </Typography>
    <Typography variant="body" color="secondary" align="center" style={styles.emptyLessonText}>
      Quando houver uma aula agendada ou confirmada, ela aparece aqui com horário, endereço,
      instrutor e veículo.
    </Typography>
    <Button title="Buscar instrutores" icon={Search} onPress={onSearch} />
  </Card>
);

const DashboardSummary = ({ dashboard }: { dashboard: StudentDashboard }) => {
  const lastLesson = dashboard.progress.lastLessonAt
    ? `Última: ${formatDate(dashboard.progress.lastLessonAt)}`
    : 'Sem aula concluída ainda';

  return (
    <View style={styles.summaryGrid}>
      <MetricCard
        icon={GraduationCap}
        label="Aulas concluídas"
        value={String(dashboard.progress.completedLessons)}
        helper={lastLesson}
      />
      <MetricCard
        icon={Clock}
        label="Horas de prática"
        value={dashboard.progress.practiceHours.toFixed(1)}
      />
      <MetricCard
        icon={CalendarDays}
        label="Próximas"
        value={String(dashboard.bookingSummary.upcoming)}
        helper={`${dashboard.bookingSummary.completed} concluídas`}
      />
      <MetricCard
        icon={Users}
        label="Instrutores"
        value={String(dashboard.stats.uniqueInstructors)}
        helper={`${dashboard.bookingSummary.canceled} canceladas`}
      />
    </View>
  );
};

const LearningSnapshot = ({ dashboard }: { dashboard: StudentDashboard }) => {
  const hasRating = dashboard.stats.averageRatingGiven > 0;

  return (
    <Card variant="outlined" padding="md" style={styles.sectionCard}>
      <View style={styles.cardHeader}>
        <View>
          <Typography variant="label" color="secondary">
            Resumo do aluno
          </Typography>
          <Typography variant="h4">Progresso e avaliações</Typography>
        </View>
        <View style={styles.ratingPill}>
          <Star
            color={theme.colors.warning[500]}
            fill={hasRating ? theme.colors.warning[500] : 'transparent'}
            size={18}
          />
          <Typography variant="caption" weight="semibold">
            {hasRating ? dashboard.stats.averageRatingGiven.toFixed(1) : 'Sem nota'}
          </Typography>
        </View>
      </View>

      <View style={styles.snapshotRows}>
        <View style={styles.snapshotRow}>
          <Text style={styles.snapshotLabel}>Aulas concluídas</Text>
          <Text style={styles.snapshotValue}>{dashboard.progress.completedLessons}</Text>
        </View>
        <View style={styles.snapshotRow}>
          <Text style={styles.snapshotLabel}>Horas praticadas</Text>
          <Text style={styles.snapshotValue}>{dashboard.progress.practiceHours.toFixed(1)}h</Text>
        </View>
        <View style={styles.snapshotRow}>
          <Text style={styles.snapshotLabel}>Avaliação média dada</Text>
          <Text style={styles.snapshotValue}>
            {hasRating ? dashboard.stats.averageRatingGiven.toFixed(1) : '-'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

export const AlunoHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    data: dashboard,
    isError,
    isLoading,
    isRefetching,
    refetch,
  } = useStudentDashboardQuery();

  const handleSearchInstructorsPress = () => {
    navigation.getParent()?.navigate('Search' as never);
  };

  const handleMyLessonsPress = () => {
    navigation.getParent()?.navigate('Bookings' as never);
  };

  const handleProgressPress = () => {
    navigation.navigate('ProgressDetails');
  };

  const handleInstructorDetailsPress = () => {
    const instructorId = dashboard?.nextLesson?.instructor.id;

    if (instructorId) {
      navigation.navigate('InstructorDetails', { instructorId });
    }
  };

  const headerSubtitle = dashboard?.nextLesson
    ? 'Sua próxima aula já está no radar.'
    : 'Acompanhe seu progresso e encontre seu próximo instrutor.';

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={theme.colors.primary[500]} size="large" />
          <Typography variant="body" color="secondary" align="center">
            Carregando sua dashboard...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (isError && !dashboard) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorState}>
          <AlertCircle color={theme.colors.semantic.error} size={34} />
          <Typography variant="h4" align="center">
            Não foi possível carregar sua tela inicial
          </Typography>
          <Typography variant="body" color="secondary" align="center">
            Verifique sua conexão e tente novamente.
          </Typography>
          <Button title="Tentar novamente" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        <HomeHeader subtitle={headerSubtitle} />

        {dashboard.nextLesson ? (
          <NextLessonCard
            lesson={dashboard.nextLesson}
            onViewBookings={handleMyLessonsPress}
            onViewDetails={handleInstructorDetailsPress}
          />
        ) : (
          <EmptyNextLessonCard onSearch={handleSearchInstructorsPress} />
        )}

        <DashboardSummary dashboard={dashboard} />

        <LearningSnapshot dashboard={dashboard} />

        <Card variant="elevated" padding="md" style={styles.quickActions}>
          <Typography variant="h4">Ações rápidas</Typography>
          <View style={styles.actionButtons}>
            <Button
              title="Buscar"
              variant="primary"
              icon={Search}
              style={styles.actionButton}
              onPress={handleSearchInstructorsPress}
            />
            <Button
              title="Aulas"
              variant="outline"
              icon={CalendarDays}
              style={styles.actionButton}
              onPress={handleMyLessonsPress}
            />
            <Button
              title="Progresso"
              variant="outline"
              icon={GraduationCap}
              style={styles.actionButton}
              onPress={handleProgressPress}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  sectionCard: {
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  instructorText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  detailsList: {
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  detailIcon: {
    width: theme.scaleUtils.moderateScale(32),
    height: theme.scaleUtils.moderateScale(32),
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  detailContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyLessonIcon: {
    width: theme.scaleUtils.moderateScale(54),
    height: theme.scaleUtils.moderateScale(54),
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  emptyLessonText: {
    maxWidth: theme.scaleUtils.moderateScale(300),
    alignSelf: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricCard: {
    width: '48%',
    minHeight: theme.scaleUtils.moderateScale(132),
    gap: theme.spacing.xs,
  },
  metricIcon: {
    width: theme.scaleUtils.moderateScale(36),
    height: theme.scaleUtils.moderateScale(36),
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  metricValue: {
    marginTop: theme.spacing.xs,
  },
  metricHelper: {
    marginTop: 'auto',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.warning[50],
  },
  snapshotRows: {
    gap: theme.spacing.sm,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.thin,
    borderBottomColor: theme.colors.border.light,
  },
  snapshotLabel: {
    flex: 1,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  snapshotValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  quickActions: {
    gap: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
