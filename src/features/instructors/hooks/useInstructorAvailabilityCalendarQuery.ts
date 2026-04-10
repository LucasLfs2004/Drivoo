import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorAvailabilityCalendarQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.availabilityCalendar(enabled));

export const useInstructorAvailabilityCompleteCalendarQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.availabilityCompleteCalendar(enabled));
