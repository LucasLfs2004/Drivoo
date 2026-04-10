import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorBookingsPreviewQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.bookingsPreview(enabled));
