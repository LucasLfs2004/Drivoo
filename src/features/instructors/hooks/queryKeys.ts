export const instructorQueryKeys = {
  all: ['instructors'] as const,
  search: (params: unknown) => [...instructorQueryKeys.all, 'search', params] as const,
  me: () => [...instructorQueryKeys.all, 'me'] as const,
  availability: () => [...instructorQueryKeys.all, 'availability', 'me'] as const,
  availabilityBookingsPreview: () =>
    [...instructorQueryKeys.all, 'availability-bookings-preview', 'me'] as const,
  availabilityCalendar: () =>
    [...instructorQueryKeys.all, 'availability-calendar', 'me'] as const,
  availabilityCompleteCalendar: () =>
    [...instructorQueryKeys.all, 'availability-complete-calendar', 'me'] as const,
  schedule: () => [...instructorQueryKeys.all, 'schedule', 'me'] as const,
  vehicles: () => [...instructorQueryKeys.all, 'vehicles', 'me'] as const,
  earningsOverview: () => [...instructorQueryKeys.all, 'earnings', 'overview', 'me'] as const,
  financial: () => [...instructorQueryKeys.all, 'financial', 'me'] as const,
  detail: (instructorId: string) =>
    [...instructorQueryKeys.all, 'detail', instructorId] as const,
  publicAvailabilityCalendar: (instructorId: string) =>
    [...instructorQueryKeys.all, 'availability-calendar', instructorId] as const,
};
