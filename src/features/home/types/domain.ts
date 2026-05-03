export type StudentDashboardLessonStatus = 'scheduled' | 'confirmed' | 'unknown';

export interface StudentDashboardInstructor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
}

export interface StudentDashboardAddress {
  full: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface StudentDashboardVehicle {
  model: string;
  transmission?: string;
}

export interface StudentDashboardNextLesson {
  id: string;
  instructor: StudentDashboardInstructor;
  startAt: Date | null;
  endAt: Date | null;
  status: StudentDashboardLessonStatus;
  apiStatus: string;
  address: StudentDashboardAddress;
  vehicle: StudentDashboardVehicle;
}

export interface StudentDashboardProgress {
  completedLessons: number;
  practiceHours: number;
  lastLessonAt: Date | null;
}

export interface StudentDashboardBookingSummary {
  upcoming: number;
  completed: number;
  canceled: number;
}

export interface StudentDashboardStats {
  uniqueInstructors: number;
  averageRatingGiven: number;
}

export interface StudentDashboard {
  type: 'aluno';
  nextLesson: StudentDashboardNextLesson | null;
  progress: StudentDashboardProgress;
  bookingSummary: StudentDashboardBookingSummary;
  stats: StudentDashboardStats;
}
