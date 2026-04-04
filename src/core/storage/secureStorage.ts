import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '../../types/auth';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

export interface StoredAuthData {
  token: string;
  refreshToken: string;
  user: Usuario | null;
  sessionEmail: string | null;
  expiresAt: number;
}

/**
 * Secure storage service for authentication data
 * Uses AsyncStorage with additional security measures
 */
export class SecureStorageService {
  /**
   * Store authentication data securely
   */
  static async storeAuthData(data: StoredAuthData): Promise<void> {
    try {
      const promises = [
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
          user: data.user,
          sessionEmail: data.sessionEmail,
        })),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, data.expiresAt.toString()),
      ];

      await Promise.all(promises);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Retrieve stored authentication data
   */
  static async getAuthData(): Promise<StoredAuthData | null> {
    try {
      const [token, refreshToken, userData, expiryStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      if (!token || !refreshToken || !userData || !expiryStr) {
        return null;
      }

      const parsedUserData = JSON.parse(userData);
      const user =
        parsedUserData && typeof parsedUserData === 'object' && 'user' in parsedUserData
          ? parsedUserData.user
          : parsedUserData;
      const sessionEmail =
        parsedUserData && typeof parsedUserData === 'object' && 'sessionEmail' in parsedUserData
          ? parsedUserData.sessionEmail
          : user?.email ?? null;
      const expiresAt = parseInt(expiryStr, 10);

      return {
        token,
        refreshToken,
        user,
        sessionEmail,
        expiresAt,
      };
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return null;
    }
  }

  /**
   * Update only the access token (for refresh scenarios)
   */
  static async updateTokens(token: string, refreshToken: string, expiresAt: number): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString()),
      ]);
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw new Error('Failed to update tokens');
    }
  }

  /**
   * Clear all stored authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      // Don't throw here as we want logout to succeed even if storage fails
    }
  }

  /**
   * Check if stored token is expired
   */
  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) return true;

      const expiresAt = parseInt(expiryStr, 10);
      const now = Date.now();
      
      // Consider token expired if it expires within the next 5 minutes
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return now >= (expiresAt - bufferTime);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Assume expired on error
    }
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get current refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
}
