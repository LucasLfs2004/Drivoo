import { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['drivoo://', 'https://drivoo.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: {
            path: 'register/:userType?',
            parse: {
              userType: (userType: string) => 
                userType === 'instrutor' ? 'instrutor' : 'aluno',
            },
          },
          ForgotPassword: 'forgot-password',
        },
      },
      AlunoTabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'aluno/home',
              InstructorDetails: 'aluno/instructor/:instructorId',
            },
          },
          Search: {
            screens: {
              SearchScreen: 'aluno/search',
              SearchResults: 'aluno/search/results',
              InstructorDetails: 'aluno/search/instructor/:instructorId',
            },
          },
          Bookings: {
            screens: {
              BookingsScreen: 'aluno/bookings',
              BookingDetails: 'aluno/booking/:bookingId',
              BookingConfirmation: 'aluno/booking/confirmation',
            },
          },
          Chat: {
            screens: {
              ChatList: 'aluno/chat',
              ChatScreen: 'aluno/chat/:conversationId',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'aluno/profile',
              EditProfile: 'aluno/profile/edit',
              Settings: 'aluno/settings',
            },
          },
        },
      },
      InstrutorTabs: {
        screens: {
          Dashboard: {
            screens: {
              DashboardScreen: 'instrutor/dashboard',
              BookingDetails: 'instrutor/booking/:bookingId',
            },
          },
          Schedule: {
            screens: {
              ScheduleScreen: 'instrutor/schedule',
              AvailabilitySettings: 'instrutor/schedule/availability',
            },
          },
          Earnings: {
            screens: {
              EarningsScreen: 'instrutor/earnings',
              EarningsDetails: 'instrutor/earnings/:period',
            },
          },
          Chat: {
            screens: {
              ChatList: 'instrutor/chat',
              ChatScreen: 'instrutor/chat/:conversationId',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'instrutor/profile',
              EditProfile: 'instrutor/profile/edit',
              Credentials: 'instrutor/profile/credentials',
              Settings: 'instrutor/settings',
            },
          },
        },
      },
      AdminDrawer: {
        screens: {
          Analytics: {
            screens: {
              AnalyticsScreen: 'admin/analytics',
              DetailedReport: 'admin/analytics/:reportType',
            },
          },
          Users: {
            screens: {
              UsersScreen: 'admin/users',
              UserDetails: 'admin/user/:userId',
            },
          },
          Instructors: {
            screens: {
              InstructorsScreen: 'admin/instructors',
              InstructorDetails: 'admin/instructor/:instructorId',
              InstructorVerification: 'admin/instructor/:instructorId/verification',
            },
          },
          Settings: {
            screens: {
              SettingsScreen: 'admin/settings',
              SystemSettings: 'admin/settings/system',
            },
          },
        },
      },
    },
  },
};

// Deep link URL examples:
// drivoo://login
// drivoo://register/instrutor
// drivoo://aluno/home
// drivoo://aluno/instructor/123
// drivoo://aluno/booking/456
// drivoo://instrutor/dashboard
// drivoo://instrutor/earnings/2024-01
// drivoo://admin/analytics
// drivoo://admin/instructor/789/verification