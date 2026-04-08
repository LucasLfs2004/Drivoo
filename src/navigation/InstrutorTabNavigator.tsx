import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Calendar,
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  User,
} from 'lucide-react-native';
import React from 'react';
import {
  InstrutorBookingsScreen,
  InstrutorDashboardScreen,
  InstrutorEarningsScreen,
  InstrutorScheduleScreen,
} from '../features/instructor-panel';
import {
  EditInstructorAvailabilityDayScreen,
  InstructorAvailabilityEditorScreen,
  InstructorAvailabilityExceptionsScreen,
} from '../features/instructors/screens';
import { InstructorAvailabilityDraftProvider } from '../features/instructors/store/InstructorAvailabilityDraftContext';
import {
  EditInstructorProfileScreen,
  InstructorSupportScreen,
  InstrutorProfileScreen,
  SettingsScreen,
} from '../features/profile';
import { ChatListScreen } from '../screens/shared/ChatListScreen';
import { theme } from '../theme';
import type {
  ChatStackParamList,
  InstrutorDashboardStackParamList,
  InstrutorEarningsStackParamList,
  InstrutorProfileStackParamList,
  InstrutorScheduleStackParamList,
  InstrutorTabParamList,
} from '../types/navigation';
import { scale } from '../utils';
import { tabBarItemStyle, tabBarStyle } from './utils';

const Tab = createBottomTabNavigator<InstrutorTabParamList>();
const DashboardStack = createNativeStackNavigator<InstrutorDashboardStackParamList>();
const ScheduleStack = createNativeStackNavigator<InstrutorScheduleStackParamList>();
const EarningsStack = createNativeStackNavigator<InstrutorEarningsStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<InstrutorProfileStackParamList>();

// Stack Navigators for each tab
const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardScreen" component={InstrutorDashboardScreen} />
    <DashboardStack.Screen name="BookingsScreen" component={InstrutorBookingsScreen} />
  </DashboardStack.Navigator>
);

const ScheduleStackNavigator = () => (
  <InstructorAvailabilityDraftProvider>
    <ScheduleStack.Navigator screenOptions={{ headerShown: false }}>
      <ScheduleStack.Screen name="ScheduleScreen" component={InstrutorScheduleScreen} />
      <ScheduleStack.Screen
        name="AvailabilityEditor"
        component={InstructorAvailabilityEditorScreen}
      />
      <ScheduleStack.Screen
        name="EditAvailabilityDay"
        component={EditInstructorAvailabilityDayScreen}
      />
      <ScheduleStack.Screen
        name="AvailabilityExceptions"
        component={InstructorAvailabilityExceptionsScreen}
      />
    </ScheduleStack.Navigator>
  </InstructorAvailabilityDraftProvider>
);

const EarningsStackNavigator = () => (
  <EarningsStack.Navigator screenOptions={{ headerShown: false }}>
    <EarningsStack.Screen name="EarningsScreen" component={InstrutorEarningsScreen} />
  </EarningsStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
  </ChatStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={InstrutorProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditInstructorProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Support" component={InstructorSupportScreen} />
  </ProfileStack.Navigator>
);

export const InstrutorTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        animation: 'shift',
        tabBarItemStyle: tabBarItemStyle,
        tabBarStyle: tabBarStyle,
        tabBarIconStyle: {
          width: scale(30),
          height: scale(30),
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStackNavigator}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color }) => (
            <Calendar color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsStackNavigator}
        options={{
          tabBarLabel: 'Ganhos',
          tabBarIcon: ({ color }) => (
            <DollarSign color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <User color={color} size={scale(24)} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
