import { useQuery } from '@tanstack/react-query';

import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorAvailabilityCalendarQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.availabilityCalendar(),
    queryFn: async () => instructorAvailabilityApi.getMyAvailabilityCalendar(),
    enabled,
  });

export const useInstructorAvailabilityCompleteCalendarQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.availabilityCompleteCalendar(),
    queryFn: async () => instructorAvailabilityApi.getMyCompleteCalendar(),
    enabled,
  });
