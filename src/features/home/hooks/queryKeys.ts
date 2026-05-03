export const studentDashboardQueryKeys = {
  all: ['student-dashboard'] as const,
  overview: () => [...studentDashboardQueryKeys.all, 'overview'] as const,
};
