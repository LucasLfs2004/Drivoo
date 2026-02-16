import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
} from 'lucide-react-native';
import {
  AlunoHomeScreen,
  AlunoSearchScreen,
  AlunoBookingsScreen,
  AlunoProfileScreen,
  BookingConfirmationScreen,
  PaymentConfirmationScreen,
  EditProfileScreen,
  SettingsScreen,
} from '../screens/client';
import { InstructorDetailsScreen } from '../screens/client/InstructorDetailsScreen';
import { ChatListScreen } from '../screens/shared/ChatListScreen';
import { ComponentShowcaseScreen } from '../screens/shared/ComponentShowcaseScreen';
import { DesignSystemScreen } from '../screens/shared/DesignSystemScreen';
import { theme } from '../themes';
import type {
  AlunoTabParamList,
  AlunoHomeStackParamList,
  AlunoSearchStackParamList,
  AlunoBookingsStackParamList,
  AlunoProfileStackParamList,
  ChatStackParamList,
} from '../types/navigation';
import { tabBarItemStyle, tabBarStyle } from './utils';
import { scale } from '@/utils';

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
    <HomeStack.Screen name="DesignSystem" component={DesignSystemScreen} />
  </HomeStack.Navigator>
);

const SearchStackNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchScreen" component={AlunoSearchScreen} />
    <SearchStack.Screen name="InstructorDetails" component={InstructorDetailsScreen} />
    <SearchStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <SearchStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
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
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

export const AlunoTabNavigator: React.FC = () => {
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



        // tabBarStyle: {
        //   backgroundColor: theme.colors.background.primary,
        //   borderTopColor: theme.colors.border.light,
        //   paddingBottom: 8,
        //   paddingTop: 8,
        //   height: 60,
        // },
        // tabBarLabelStyle: {
        //   fontSize: 12,
        //   fontWeight: '500',
        // },
        // headerShown: false,
        // tabBarActiveTintColor: colors.primary,
        // tabBarInactiveTintColor: colors.gray_200,
        // tabBarShowLabel: false,

      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => (
            <Search color={color} size={scale(24)} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStackNavigator}
        options={{
          tabBarLabel: 'Aulas',
          tabBarIcon: ({ color }) => (
            <Calendar color={color} size={scale(24)} />
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

