import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AdminAnalyticsScreen,
  AdminInstructorsScreen,
  AdminSettingsScreen,
  AdminUsersScreen,
} from '../features/admin';
import { useAuth } from '../core/auth';
import { theme } from '../themes';
import type {
  AdminDrawerParamList,
  AdminAnalyticsStackParamList,
  AdminUsersStackParamList,
  AdminInstructorsStackParamList,
  AdminSettingsStackParamList,
} from '../types/navigation';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();
const AnalyticsStack = createNativeStackNavigator<AdminAnalyticsStackParamList>();
const UsersStack = createNativeStackNavigator<AdminUsersStackParamList>();
const InstructorsStack = createNativeStackNavigator<AdminInstructorsStackParamList>();
const SettingsStack = createNativeStackNavigator<AdminSettingsStackParamList>();

// Stack Navigators for each drawer item
const AnalyticsStackNavigator = () => (
  <AnalyticsStack.Navigator screenOptions={{ headerShown: false }}>
    <AnalyticsStack.Screen name="AnalyticsScreen" component={AdminAnalyticsScreen} />
  </AnalyticsStack.Navigator>
);

const UsersStackNavigator = () => (
  <UsersStack.Navigator screenOptions={{ headerShown: false }}>
    <UsersStack.Screen name="UsersScreen" component={AdminUsersScreen} />
  </UsersStack.Navigator>
);

const InstructorsStackNavigator = () => (
  <InstructorsStack.Navigator screenOptions={{ headerShown: false }}>
    <InstructorsStack.Screen name="InstructorsScreen" component={AdminInstructorsScreen} />
  </InstructorsStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsScreen" component={AdminSettingsScreen} />
  </SettingsStack.Navigator>
);

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  const { usuario } = useAuth();

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario?.perfil?.primeiroNome?.[0]}{usuario?.perfil?.ultimoNome?.[0]}
          </Text>
        </View>
        <Text style={styles.adminName}>
          {usuario?.perfil?.primeiroNome} {usuario?.perfil?.ultimoNome}
        </Text>
        <Text style={styles.adminRole}>Administrador</Text>
      </View>

      <View style={styles.drawerItems}>
        <DrawerItem
          label="Analytics"
          onPress={() => props.navigation.navigate('Analytics')}
          labelStyle={styles.drawerItemLabel}
          icon={() => <DrawerIcon name="bar-chart" />}
        />
        <DrawerItem
          label="Usuários"
          onPress={() => props.navigation.navigate('Users')}
          labelStyle={styles.drawerItemLabel}
          icon={() => <DrawerIcon name="users" />}
        />
        <DrawerItem
          label="Instrutores"
          onPress={() => props.navigation.navigate('Instructors')}
          labelStyle={styles.drawerItemLabel}
          icon={() => <DrawerIcon name="user-check" />}
        />
        <DrawerItem
          label="Configurações"
          onPress={() => props.navigation.navigate('Settings')}
          labelStyle={styles.drawerItemLabel}
          icon={() => <DrawerIcon name="settings" />}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// Simple icon component - will be replaced with proper icons later
const DrawerIcon: React.FC<{ name: string }> = () => (
  <View style={styles.drawerIcon} />
);

export const AdminDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.background.primary,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary[500],
        drawerInactiveTintColor: theme.colors.text.secondary,
      }}
    >
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsStackNavigator}
        options={{ drawerLabel: 'Analytics' }}
      />
      <Drawer.Screen
        name="Users"
        component={UsersStackNavigator}
        options={{ drawerLabel: 'Usuários' }}
      />
      <Drawer.Screen
        name="Instructors"
        component={InstructorsStackNavigator}
        options={{ drawerLabel: 'Instrutores' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ drawerLabel: 'Configurações' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  drawerHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  adminName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  adminRole: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  drawerItems: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  drawerItemLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  drawerIcon: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 10,
  },
});
