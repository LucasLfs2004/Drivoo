export const instructorQueryKeys = {
  all: ['instructors'] as const,
  search: (params: unknown) => [...instructorQueryKeys.all, 'search', params] as const,
  detail: (instructorId: string) =>
    [...instructorQueryKeys.all, 'detail', instructorId] as const,
  availableSlots: (
    instructorId: string,
    date: string,
    durationMinutes: number
  ) =>
    [...instructorQueryKeys.all, 'available-slots', instructorId, date, durationMinutes] as const,
};
