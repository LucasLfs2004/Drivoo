import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  MessageCircle,
  User,
} from 'lucide-react-native';
import {
  InstrutorDashboardScreen,
  InstrutorEarningsScreen,
  InstrutorScheduleScreen,
} from '../features/instructor-panel';
import { InstrutorProfileScreen } from '../features/profile';
import { ChatListScreen } from '../screens/shared/ChatListScreen';
import { theme } from '../themes';
import type {
  InstrutorTabParamList,
  InstrutorDashboardStackParamList,
  InstrutorScheduleStackParamList,
  InstrutorEarningsStackParamList,
  InstrutorProfileStackParamList,
  ChatStackParamList,
} from '../types/navigation';
import { tabBarItemStyle, tabBarStyle } from './utils';
import { scale } from '../utils';

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
  </DashboardStack.Navigator>
);

const ScheduleStackNavigator = () => (
  <ScheduleStack.Navigator screenOptions={{ headerShown: false }}>
    <ScheduleStack.Screen name="ScheduleScreen" component={InstrutorScheduleScreen} />
  </ScheduleStack.Navigator>
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
          width: 32,
          height: 32,
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
