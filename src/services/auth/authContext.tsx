import React, { createContext, useState, useEffect, useCallback } from 'react';
import { hasToken } from './tokenStorage';
import { authService } from './authService';
import type { User } from '../api/types';

/**
 * Authentication Context Type
 * Defines the shape of the auth context
 */
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string,
        userType: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    restoreToken: () => Promise<void>;
}

/**
 * Create the Auth Context
 * Provides authentication state and methods to all components
 */
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

/**
 * Auth Provider Component
 * Wraps the app and provides authentication context
 * Manages user state, loading state, and authentication methods
 */
interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Restore token on app startup
     * Checks if a valid token exists in secure storage
     * If token exists, user is considered signed in
     */
    const restoreToken = useCallback(async () => {
        try {
            setIsLoading(true);
            const tokenExists = await hasToken();

            if (tokenExists) {
                // Token exists, user is signed in
                // In a real app, you might validate the token or fetch user data here
                // For now, we just mark that a token exists
                // The actual user data will be loaded when needed (e.g., in ProfileScreen)
            }
        } catch (error) {
            console.error('Failed to restore token:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Initialize auth state on app startup
     * Restore token if it exists
     */
    useEffect(() => {
        restoreToken();
    }, [restoreToken]);

    /**
     * Login user with email and password
     * Stores tokens securely and updates user state
     * @param email - User email
     * @param password - User password
     * @throws Error with user-friendly message on failure
     */
    const login = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authService.login({ email, senha: password });
            setUser(response.usuario);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Register new user
     * Stores tokens securely and updates user state
     * @param name - User full name
     * @param email - User email
     * @param password - User password
     * @param userType - Type of user (student, instructor, admin)
     * @throws Error with user-friendly message on failure
     */
    const register = useCallback(
        async (
            name: string,
            email: string,
            password: string,
            userType: string
        ) => {
            try {
                setIsLoading(true);
                const response = await authService.register({
                    name,
                    email,
                    password,
                    userType: userType as 'aluno' | 'instrutor' | 'admin',
                });
                setUser(response.usuario);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * Logout user
     * Removes tokens from secure storage and clears user state
     * @throws Error if logout fails
     */
    const logout = useCallback(async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Context value
     * Provides all auth state and methods to consumers
     */
    const value: AuthContextType = {
        user,
        isLoading,
        isSignedIn: !!user,
        login,
        register,
        logout,
        restoreToken,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

/**
 * useAuth Hook
 * Custom hook to access authentication context
 * Must be used within AuthProvider
 * @returns AuthContextType with user state and auth methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
