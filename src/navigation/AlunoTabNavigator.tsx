import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AlunoHomeScreen,
  AlunoSearchScreen,
  AlunoBookingsScreen,
  AlunoProfileScreen,
  BookingConfirmationScreen,
} from '../screens/client';
import { InstructorDetailsScreen } from '../screens/client/InstructorDetailsScreen';
import { ChatListScreen } from '../screens/shared/ChatListScreen';
import { ComponentShowcaseScreen } from '../screens/shared/ComponentShowcaseScreen';
import { theme } from '../themes';
import type {
  AlunoTabParamList,
  AlunoHomeStackParamList,
  AlunoSearchStackParamList,
  AlunoBookingsStackParamList,
  AlunoProfileStackParamList,
  ChatStackParamList,
} from '../types/navigation';

const Tab = createBottomTabNavigator<AlunoTabParamList>();
const HomeStack = createNativeStackNavigator<AlunoHomeStackParamList>();
const SearchStack = createNativeStackNavigator<AlunoSearchStackParamList>();
const BookingsStack = createNativeStackNavigator<AlunoBookingsStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<AlunoProfileStackParamList>();

// Stack Navigators for each tab
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={AlunoHomeScreen} />
    <HomeStack.Screen name="InstructorDetails" component={InstructorDetailsScreen} />
    <HomeStack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />
  </HomeStack.Navigator>
);

const SearchStackNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchScreen" component={AlunoSearchScreen} />
    <SearchStack.Screen name="InstructorDetails" component={InstructorDetailsScreen} />
    <SearchStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
  </SearchStack.Navigator>
);

const BookingsStackNavigator = () => (
  <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingsStack.Screen name="BookingsScreen" component={AlunoBookingsScreen} />
  </BookingsStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
  </ChatStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={AlunoProfileScreen} />
  </ProfileStack.Navigator>
);

export const AlunoTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => (
            <TabIcon name="search" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStackNavigator}
        options={{
          tabBarLabel: 'Aulas',
          tabBarIcon: ({ color }) => (
            <TabIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <TabIcon name="message-circle" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <TabIcon name="user" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component - will be replaced with proper icons later
const TabIcon: React.FC<{ name: string; color: string }> = ({ color }) => (
  <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />
);