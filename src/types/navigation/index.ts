// Navigation type definitions
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  AlunoTabs: NavigatorScreenParams<AlunoTabParamList>;
  InstrutorTabs: NavigatorScreenParams<InstrutorTabParamList>;
  AdminDrawer: NavigatorScreenParams<AdminDrawerParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: { userType?: 'aluno' | 'instrutor' };
  Onboarding: undefined;
  ForgotPassword: undefined;
};

// Aluno Tab Navigator
export type AlunoTabParamList = {
  Home: NavigatorScreenParams<AlunoHomeStackParamList>;
  Search: NavigatorScreenParams<AlunoSearchStackParamList>;
  Bookings: NavigatorScreenParams<AlunoBookingsStackParamList>;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<AlunoProfileStackParamList>;
};

// Instrutor Tab Navigator
export type InstrutorTabParamList = {
  Dashboard: NavigatorScreenParams<InstrutorDashboardStackParamList>;
  Schedule: NavigatorScreenParams<InstrutorScheduleStackParamList>;
  Earnings: NavigatorScreenParams<InstrutorEarningsStackParamList>;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<InstrutorProfileStackParamList>;
};

// Admin Drawer Navigator
export type AdminDrawerParamList = {
  Analytics: NavigatorScreenParams<AdminAnalyticsStackParamList>;
  Users: NavigatorScreenParams<AdminUsersStackParamList>;
  Instructors: NavigatorScreenParams<AdminInstructorsStackParamList>;
  Settings: NavigatorScreenParams<AdminSettingsStackParamList>;
};

// Stack Parameter Lists
export type AlunoHomeStackParamList = {
  HomeScreen: undefined;
  InstructorDetails: { instructorId: string; instructorSummary?: InstrutorDisponivel };
  ProgressDetails: undefined;
  ComponentShowcase: undefined;
  DesignSystem: undefined
};

export type AlunoSearchStackParamList = {
  SearchScreen: undefined;
  SearchResults: { filters?: any };
  InstructorDetails: { instructorId: string; instructorSummary?: InstrutorDisponivel };
  BookingConfirmation: { bookingData: any };
  PaymentConfirmation: { bookingData: any };
};

export type AlunoBookingsStackParamList = {
  BookingsScreen: undefined;
  BookingDetails: { bookingId: string };
  BookingConfirmation: { bookingData: any };
};

export type InstrutorDashboardStackParamList = {
  DashboardScreen: undefined;
  BookingDetails: { bookingId: string };
};

export type InstrutorScheduleStackParamList = {
  ScheduleScreen: undefined;
  AvailabilitySettings: undefined;
  AvailabilityEditor: undefined;
  EditAvailabilityDay: { day: number };
  AvailabilityExceptions: undefined;
};

export type InstrutorEarningsStackParamList = {
  EarningsScreen: undefined;
  EarningsDetails: { period: string };
};

export type AlunoProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type InstrutorProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Credentials: undefined;
  Settings: undefined;
  Support: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatScreen: { conversationId: string; participantName: string };
};

export type AdminAnalyticsStackParamList = {
  AnalyticsScreen: undefined;
  DetailedReport: { reportType: string };
};

export type AdminUsersStackParamList = {
  UsersScreen: undefined;
  UserDetails: { userId: string };
};

export type AdminInstructorsStackParamList = {
  InstructorsScreen: undefined;
  InstructorDetails: { instructorId: string };
  InstructorVerification: { instructorId: string };
};

export type AdminSettingsStackParamList = {
  SettingsScreen: undefined;
  SystemSettings: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AlunoTabScreenProps<T extends keyof AlunoTabParamList> =
  BottomTabScreenProps<AlunoTabParamList, T>;

export type InstrutorTabScreenProps<T extends keyof InstrutorTabParamList> =
  BottomTabScreenProps<InstrutorTabParamList, T>;

export type AdminDrawerScreenProps<T extends keyof AdminDrawerParamList> =
  DrawerScreenProps<AdminDrawerParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
import type { InstrutorDisponivel } from '../search';
