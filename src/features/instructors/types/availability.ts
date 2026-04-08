export type AvailabilityInterval = {
  start: string;
  end: string;
};

export type WeeklyAvailability = Record<number, AvailabilityInterval[]>;

export type AvailabilityException =
  | {
      id: string;
      type: 'available';
      date: string;
      intervals: AvailabilityInterval[];
    }
  | {
      id: string;
      type: 'blocked';
      date: string;
    };

export type InstructorBookingPreview = {
  id: string;
  date: string;
  start: string;
  end: string;
  status: 'confirmed' | 'pending';
  studentName?: string;
  preserveReason?: 'FORA_DA_DISPONIBILIDADE_ATUAL';
};

export type InstructorAvailabilityDraft = {
  timezone: string;
  weekly: WeeklyAvailability;
  exceptions: AvailabilityException[];
};
